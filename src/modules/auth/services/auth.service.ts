import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, LoginDto, ResendConfirmationCodeDto, LogoutDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ResponseSuccess, SapJwtResponse } from '../auth.interface';
import { UserService } from 'src/modules/user';
import { ConfigService } from 'src/config';
import { Twilio } from 'twilio';
import { VerifyDto } from '../dto/verify-phone-number.dto';
import { SEND_CONFIRMATION_CODE, SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth.constants';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from '../../../common/helpers/error-handling.helpers';
import { DraftUserService } from 'src/modules/draft-user';
import { TokenPayload } from '../token-payload.interface';
import { LoginSapDto } from '../dto/login-sap.dto';
import { TokenService } from '../../../common/services/token.service';
import { UserEntity } from 'src/modules/user/user.entity';
import { DraftUserEntity } from 'src/modules/draft-user/draft-user.entity';

@Injectable()
export class AuthService {
  private readonly client: Twilio;
  private readonly twillioEnabled: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly draftUserService: DraftUserService,
    private readonly tokenService: TokenService,
  ) {
    this.client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
    this.twillioEnabled = this.configService.get('TWILLIO_ENABLED');
  }

  public async getAndGenerateJwtAccessToken(userId: number): Promise<string> {
    const user: UserEntity = await this.userService.getUserById(userId);
    const payload: TokenPayload = { fullName: user.fullName };
    const token: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
    return token;
  }

  public async register(credentials: RegisterDto): Promise<ResponseSuccess> {
    if (await this.userService.findUserByEmail(credentials.email)) {
      throw new ConflictException(createError(ErrorTypeEnum.EMAIL_ALREADY_TAKEN, 'email'));
    }
    if (await this.userService.findUserByFullName(credentials.fullName)) {
      throw new ConflictException(createError(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN, 'fullName'));
    }
    if (await this.userService.findUserByPhoneNumber(credentials.phoneNumber)) {
      throw new ConflictException(
        createError(ErrorTypeEnum.PHONE_NUMBER_ALREADY_TAKEN, 'phoneNumber'),
      );
    }
    await this.draftUserService.createDraftUser(credentials);
    return { result: SUCCESS };
  }

  public async loginSap(credentials: LoginSapDto): Promise<SapJwtResponse> {
    const sapClientId: string = this.configService.get('SAP_CLIENT_ID');
    const sapClientSecret: string = this.configService.get('SAP_CLIENT_SECRET');

    if (credentials.clientId !== sapClientId) {
      throw new BadRequestException(createError(ErrorTypeEnum.INVALID_CLIENT_ID, 'clientId'));
    }

    if (credentials.clientSecret !== sapClientSecret) {
      throw new BadRequestException(
        createError(ErrorTypeEnum.INVALID_CLIENT_SECRET, 'clientSecret'),
      );
    }

    const token: string = this.jwtService.sign({ isSap: true, clientId: sapClientId });
    return { token };
  }

  public async login(credentials: LoginDto): Promise<ResponseSuccess> {
    if (!(await this.userService.findUserByPhoneNumber(credentials.phoneNumber))) {
      throw new UnauthorizedException(
        createError(ErrorTypeEnum.PHONE_NUMBER_NOT_FOUND, 'phoneNumber'),
      );
    }
    return { result: SUCCESS };
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const user: UserEntity = await this.userService.getUserIfRefreshTokenMatches(refreshToken);
    try {
      await this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });
      return await this.getAndGenerateJwtAccessToken(user.id);
    } catch (err) {
      throw new ConflictException(createError(ErrorTypeEnum.INVALID_REFRESH_TOKEN, 'refreshToken'));
    }
  }

  public async logout(credentials: LogoutDto): Promise<ResponseSuccess> {
    const user: UserEntity = await this.userService.getUserIfRefreshTokenMatches(
      credentials.refreshToken,
    );
    await this.userService.removeRefreshToken(user.id);
    return { result: SUCCESS };
  }

  public async completeVerificationAndGetToken(credentials: VerifyDto): Promise<any> {
    if (!this.twillioEnabled) {
      if (credentials.confirmationCode !== TEST_VALID_CONFIRMATION_CODE) {
        throw new BadRequestException(
          createError(ErrorTypeEnum.INVALID_CONFIRMATION_CODE, 'confirmationCode'),
        );
      }
    }

    const draftUser: DraftUserEntity = await this.draftUserService.getDraftUserByPhoneNumber(
      credentials.phoneNumber,
    );
    const existsUser: UserEntity = await this.userService.findUserByPhoneNumber(
      credentials.phoneNumber,
    );

    if (draftUser && !existsUser) {
      if (this.twillioEnabled) {
        try {
          await this.client.verify
            .services(this.configService.get('TWILIO_SERVICE_ID'))
            .verificationChecks.create({
              to: credentials.phoneNumber,
              code: credentials.confirmationCode,
            });
        } catch (err) {
          throw new BadRequestException(
            createError(ErrorTypeEnum.INVALID_CONFIRMATION_CODE, 'confirmationCode'),
          );
        }
      }

      await this.userService.createUser({
        fullName: draftUser.fullName,
        email: draftUser.email,
        phoneNumber: draftUser.phoneNumber,
      });
      await this.draftUserService.deleteDraftUserByPhoneNumber(draftUser.phoneNumber);
      const user: UserEntity = await this.userService.findUserByPhoneNumber(
        credentials.phoneNumber,
      );
      const accessToken: string = await this.getAndGenerateJwtAccessToken(user.id);
      const refreshToken: string = await this.tokenService.getAndGenerateJwtRefreshToken(
        user.fullName,
      );
      const updatedUser: UserEntity = await this.userService.setCurrentRefreshTokenAndGetUser(
        refreshToken,
        user.id,
      );
      return { ...updatedUser, accessToken, refreshToken };
    } else if (!draftUser && existsUser) {
      const accessToken: string = await this.getAndGenerateJwtAccessToken(existsUser.id);
      const refreshToken: string = await this.tokenService.getAndGenerateJwtRefreshToken(
        existsUser.fullName,
      );
      const updatedUser: UserEntity = await this.userService.setCurrentRefreshTokenAndGetUser(
        refreshToken,
        existsUser.id,
      );
      return { ...updatedUser, accessToken, refreshToken };
    } else {
      throw new UnauthorizedException(
        createError(ErrorTypeEnum.USER_NOT_REGISTRATED, 'phoneNumber'),
      );
    }
  }

  public async resendConfirmationCode(
    credentials: ResendConfirmationCodeDto,
  ): Promise<ResponseSuccess> {
    const draftUser: DraftUserEntity = await this.draftUserService.getDraftUserByPhoneNumber(
      credentials.phoneNumber,
    );
    const existsUser: UserEntity = await this.userService.findUserByPhoneNumber(
      credentials.phoneNumber,
    );

    if ((!draftUser && existsUser) || (draftUser && !existsUser)) {
      if (this.twillioEnabled) {
        try {
          await this.client.verify
            .services(this.configService.get('TWILIO_SERVICE_ID'))
            .verifications.create({ to: credentials.phoneNumber, channel: 'sms' });
        } catch (err) {
          throw new BadRequestException(
            createError(ErrorTypeEnum.INVALID_PHONE_NUMBER, 'phoneNumber'),
          );
        }
      }
      return { result: SEND_CONFIRMATION_CODE };
    } else {
      throw new UnauthorizedException(
        createError(ErrorTypeEnum.USER_NOT_REGISTRATED, 'phoneNumber'),
      );
    }
  }
}
