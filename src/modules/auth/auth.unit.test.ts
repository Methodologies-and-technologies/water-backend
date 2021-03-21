import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';

import * as uuid from 'uuid';

import { ErrorTypeEnum } from 'src/common/enums';
import { StorageService } from 'src/multipart';
import { DatabaseModule } from 'src/database';
import { ConfigModule } from 'src/config';

import { UserEntity } from '../user/user.entity';

import { PaginationFilesDto } from './dto';
import { FileEntity } from './file.entity';

import { TokenService } from '../../common/services/token.service';
import { JwtStrategy } from './jwt.strategy';

describe('AuthService', () => {
  let service: AuthService;

  const owner = plainToClass(UserEntity, { id: '067f2f3e-b936-4029-93d6-b2f58ae4f489' });
  const expected = plainToClass(UserEntity, {
    email: 'nse113@gmail1111.com',
    phoneNumber: '+380992373914',
    fullName: 'nfen+cs123',
  });

  beforeAll(async () => {
    process.env.TYPEORM_NAME = uuid.v4();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([FileEntity]),
        DatabaseModule,
        ConfigModule,
        ChangeEventModule,
        CoreModule,
        FilesModule,
        DraftUserModule,
        UserModule,
      ],
      providers: [
        AuthService,
        JwtStrategy,
        TokenService
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should be return file entity', async () => {
      const received = await service.register({ ...expected });
      expect(received).toBeInstanceOf(UserEntity);
      expect(received).toEqual({ ...expected });
    });

    it('should be return conflict error', async () => {
      const error = new ConflictException(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN);
      return service.createOne({ ...expected }).catch((err) => {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectAll', () => {
    it('should be return user entity', async () => {
      const received = await service.selectAll();
      expect(received).toBeInstanceOf(PaginationUsersDto);
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN);
      return service.selectAll({ skip: -1 }).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectOne', () => {
    const conditions = { id: expected.id };

    it('should be return user entity', async () => {
      const received = await service.selectOne(conditions);
      expect(received).toBeInstanceOf(UserEntity);
      expect(received).toEqual(expected);
    });
  });

  describe('deleteOne', () => {
    const conditions = { id: expected.id };

    it('should be return user entity', async () => {
      const received = await service.deleteOne(conditions);
      expect(received).toBeInstanceOf(UserEntity);
      expect(received.id).toBe(undefined);

      const error = new NotFoundException(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN);
      return service.selectOne(conditions).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN);
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });

    it('should be return transaction error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.FULLNAME_ALREADY_TAKEN);
      jest.spyOn(service, 'selectOne').mockImplementation(async () => new FileEntity());
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });
})
