import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { RegisterDto } from 'src/modules/auth';
import { Not, Repository, SaveOptions } from 'typeorm';
import { PaginationUsersDto } from '../dto/pagination-users.dto';
import { QueryParamsDto } from '../dto/query-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../user.entity';
import { createError } from '../../../common/helpers/error-handling.helpers';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { DeliveryAreaService } from 'src/modules/delivery-area';
import { FilesService } from '../../files';
import { UpdateUserSapIdDto, UploadAvatarDto } from '..';
import { ServiceRatingDto, ServiceRatingService } from 'src/modules/service-rating';
import { ResponseSuccess, SapAuthPayload } from 'src/modules/auth/auth.interface';
import { SUCCESS } from 'src/modules/auth/auth.constants';
import { DeliveryAreaEntity } from 'src/modules/delivery-area/delivery-area.entity';
import { FileEntity } from 'src/modules/files/file.entity';
import { ConfigService } from 'src/config/config.service';
import { UserSapService } from '../user.sap-service';
import { isSapAuthPayload } from '../../../common/helpers/is-sap-auth-payload.helpers';
import { SapApiResponse } from 'src/modules/core/sap-api.service';
import { ServiceRatingEntity } from 'src/modules/service-rating/service-rating.entity';
import { SapCreateUserDto } from '../dto/sap-create-user.dto';
import { TokenService } from '../../../common/services/token.service';
import { SapUpdateUserDto } from '../dto/sap-update-user.dto';
import { SapUserResponseDto } from '../dto/sap-user-response.dto';

@Injectable()
export class UserService {
  private readonly pathToDownload: string;

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly deliveryAreaService: DeliveryAreaService,
    private readonly fileService: FilesService,
    private readonly serviceRatingService: ServiceRatingService,
    private readonly userSapService: UserSapService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    this.pathToDownload = this.configService.get('PATH_TO_DOWNLOAD');
  }

  public async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
  }

  public async findUserByPhoneNumber(phoneNumber: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { phoneNumber },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
  }

  public async findUserByFullName(fullName: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { fullName },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
  }

  public async createUser(credentials: RegisterDto): Promise<UserEntity> {
    const user: UserEntity = this.userRepository.create(credentials);
    const createdUser: UserEntity = await this.userRepository.save(user);
    const sapUserResponse: SapApiResponse = await this.userSapService.sendCreatedUser(createdUser);
    if (sapUserResponse.isSuccess) {
      await this.userRepository.update(user.id, { sapId: sapUserResponse.data.id });
    }
    return await this.getUserById(user.id);
  }

  public async createUserFromSap(userData: SapCreateUserDto): Promise<SapUserResponseDto> {
    const user = await this.userRepository.save(
      this.userRepository.create({
        sapId: userData.SapId,
        fullName: userData.CustomerName,
        phoneNumber: userData.Phone,
        email: userData.Email,
        imageUrl: null,
      }),
    );
    const refreshToken: string = await this.tokenService.getAndGenerateJwtRefreshToken(
      user.fullName,
    );
    const updatedUser = await this.setCurrentRefreshTokenAndGetUser(refreshToken, user.id);
    return new SapUserResponseDto(updatedUser);
  }

  public async findUserByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { currentHashedRefreshToken: refreshToken },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
  }

  public async update(
    id: number,
    data: UpdateUserDto | UpdateUserSapIdDto,
    authUser: UserEntity | SapAuthPayload,
  ): Promise<UserEntity> {
    let user: UserEntity = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'id'));
    }
    await this.userRepository.update(id, data);
    user = await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });

    if (!isSapAuthPayload(authUser)) {
      console.log('Here upload');
      await this.userSapService.sendUpdatedUser(user);
    }

    return user;
  }

  public async updateUserFromSap(
    sapId: string,
    data: SapUpdateUserDto,
  ): Promise<SapUserResponseDto> {
    const user: UserEntity = await this.userRepository.findOne({ sapId: sapId });

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'sapId'));
    }

    if (await this.userRepository.findOne({ email: data.Email, id: Not(user.id) })) {
      throw new ConflictException(createError(ErrorTypeEnum.EMAIL_ALREADY_TAKEN, 'email'));
    }

    if (await this.userRepository.findOne({ phoneNumber: data.Phone, id: Not(user.id) })) {
      throw new ConflictException(
        createError(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN, 'CustomerName'),
      );
    }

    await this.userRepository.update(
      { sapId },
      {
        fullName: data.CustomerName,
        email: data.Email,
        phoneNumber: data.Phone,
      },
    );

    const updatedUser: UserEntity = await this.userRepository.findOne({
      where: { sapId },
    });

    return new SapUserResponseDto(updatedUser);
  }

  public async setNewUsersInfo(users: UserEntity[], options: SaveOptions): Promise<void> {
    await this.userRepository.save(users, options);
  }

  public async updateUserProfile(id: number, data: UpdateUserProfileDto): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'avatar', 'cartItems'],
    });
    let deliveryArea: DeliveryAreaEntity;
    let avatar: FileEntity;

    if (data.deliveryAreaId && data.avatarId) {
      deliveryArea = await this.deliveryAreaService.getDeliveryAreaById(data.deliveryAreaId);
      avatar = await this.fileService.selectOne({ id: data.avatarId });
    } else if (data.avatarId && !data.deliveryAreaId) {
      deliveryArea = user.deliveryArea;
      avatar = await this.fileService.selectOne({ id: data.avatarId });
    } else if (!data.avatarId && data.deliveryAreaId) {
      avatar = user.avatar;
      deliveryArea = await this.deliveryAreaService.getDeliveryAreaById(data.deliveryAreaId);
    } else {
      deliveryArea = user.deliveryArea;
      avatar = user.avatar;
    }

    let imageUrl: string | undefined;

    if (avatar) {
      imageUrl = `${this.pathToDownload}${avatar.id}`;
    }
    await this.userRepository.update(id, { deliveryArea, avatar, imageUrl });
    const updatedUser: UserEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
    await this.userSapService.sendUpdatedUser(updatedUser);
    return updatedUser;
  }

  public async getUserById(id: number): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'id'));
    }
    return user;
  }

  public async uploadAvatar(id: number, data: UploadAvatarDto): Promise<UserEntity> {
    const avatar: FileEntity = await this.fileService.selectOne({ id: data.fileId });

    if (!avatar) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILES_NOT_FOUND, 'avtar id'));
    }

    const imageUrl = `${this.pathToDownload}${avatar.id}`;
    await this.userRepository.update(id, { avatar, imageUrl });
    return await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
  }

  public async destroy(id: number): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'id'));
    }
    await this.userRepository.delete(id);
    return user;
  }

  public async getManyUsers(options?: QueryParamsDto): Promise<PaginationUsersDto> {
    const usersByQuery: [UserEntity[], number] = await this.userRepository.findAndCount({
      where: [
        { fullName: options.fullName },
        { email: options.email },
        { phoneNumber: options.phoneNumber },
      ],
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
      take: 10,
      skip: 0,
    });

    if ((Array.from(usersByQuery).shift() as Array<UserEntity>).length)
      return new PaginationUsersDto(usersByQuery);
    options = { take: 10, skip: 0 } as any;
    const data: [UserEntity[], number] = await this.userRepository.findAndCount({
      ...options,
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
    return new PaginationUsersDto(data);
  }

  public async estimateApplicationService(
    id: number,
    ratingPayload: ServiceRatingDto,
  ): Promise<ResponseSuccess> {
    const user: UserEntity = await this.userRepository.findOne({ where: { id } });
    const rating: ServiceRatingEntity = await this.serviceRatingService.createServiceRating(
      ratingPayload,
    );

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'id'));
    }
    await this.userRepository.update(id, { rating });
    return { result: SUCCESS };
  }

  public async setCurrentRefreshTokenAndGetUser(refreshToken: string, id: number) {
    let user: UserEntity = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(createError(ErrorTypeEnum.USER_NOT_FOUND, 'id'));
    }
    await this.userRepository.update(id, { currentHashedRefreshToken: refreshToken });
    user = await this.userRepository.findOne({
      where: { id },
      relations: ['deliveryArea', 'cartItems', 'deliveryAddresses', 'rating'],
    });
    return user;
  }

  public async getUserIfRefreshTokenMatches(refreshToken: string) {
    const user: UserEntity = await this.findUserByRefreshToken(refreshToken);
    if (user) {
      return user;
    } else {
      throw new ConflictException(createError(ErrorTypeEnum.INVALID_REFRESH_TOKEN, 'refreshToken'));
    }
  }

  public async removeRefreshToken(id: number) {
    return this.userRepository.update(id, {
      currentHashedRefreshToken: null,
    });
  }
}
