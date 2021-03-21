import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { RegisterDto } from 'src/modules/auth';
import { Connection, InsertResult, Repository } from 'typeorm';
import { DraftUserEntity } from './draft-user.entity';

@Injectable()
export class DraftUserService {
  constructor(
    @InjectRepository(DraftUserEntity)
    private readonly draftUserRepository: Repository<DraftUserEntity>,
    private readonly connection: Connection,
  ) {}

  public async createDraftUser(credentials: RegisterDto): Promise<InsertResult> {
    if (await this.getDraftUserByEmail(credentials.email)) {
      throw new ConflictException(
        createError(ErrorTypeEnum.NOT_CONFIRMED_EMAIL_ALREADY_TAKEN, 'email'),
      );
    }
    if (await this.getDraftUserByFullName(credentials.fullName)) {
      throw new ConflictException(
        createError(ErrorTypeEnum.NOT_CONFIRMED_FULLNAME_ALREADY_TAKEN, 'fullName'),
      );
    }
    if (await this.getDraftUserByPhoneNumber(credentials.phoneNumber)) {
      throw new ConflictException(
        createError(ErrorTypeEnum.NOT_CONFIRMED_PHONE_NUMBER_ALREADY_TAKEN, 'phoneNumber'),
      );
    }

    const draftUser: DraftUserEntity = new DraftUserEntity();
    draftUser.email = credentials.email;
    draftUser.fullName = credentials.fullName;
    draftUser.phoneNumber = credentials.phoneNumber;

    return await this.connection
      .createQueryBuilder()
      .insert()
      .into(DraftUserEntity)
      .values(draftUser)
      .execute();
  }

  public async getDraftUserByPhoneNumber(phoneNumber: string): Promise<DraftUserEntity | null> {
    return await this.draftUserRepository.findOne({ where: { phoneNumber } });
  }

  public async getDraftUserByEmail(email: string): Promise<DraftUserEntity | null> {
    return await this.draftUserRepository.findOne({ where: { email } });
  }

  public async getDraftUserByFullName(fullName: string): Promise<DraftUserEntity | null> {
    return await this.draftUserRepository.findOne({ where: { fullName } });
  }

  public async deleteDraftUserByPhoneNumber(phoneNumber: string): Promise<DraftUserEntity> {
    const draftUser: DraftUserEntity = await this.getDraftUserByPhoneNumber(phoneNumber);
    if (!draftUser) {
      throw new NotFoundException(ErrorTypeEnum.DRAFT_USER_NOT_FOUND);
    }
    await this.draftUserRepository.delete(draftUser.id);
    return draftUser;
  }
}
