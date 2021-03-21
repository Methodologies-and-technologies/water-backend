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

describe('NotificationService', () => {
  let service: NotificationService;

  const owner = plainToClass(UserEntity, { id: '067f2f3e-b936-4029-93d6-b2f58ae4f489' });
  const expected = plainToClass(NotificationEntity, {});

  beforeAll(async () => {
    process.env.TYPEORM_NAME = uuid.v4();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([NotificationEntity]),
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

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should be return notification entity', async () => {
      const received = await service.register({ ...expected });
      expect(received).toBeInstanceOf(NotificationEntity);
      expect(received).toEqual({ ...expected });
    });
  });

  describe('selectAll', () => {
    it('should be return notification entity', async () => {
      const received = await service.selectAll();
      expect(received).toBeInstanceOf(PaginationNotificationsDto);
    });
  });

  describe('selectOne', () => {
    const conditions = { id: expected.id };

    it('should be return notification entity', async () => {
      const received = await service.selectOne(conditions);
      expect(received).toBeInstanceOf(NotificationEntity);
      expect(received).toEqual(expected);
    });
  });

  describe('deleteOne', () => {
    const conditions = { id: expected.id };

    it('should be return notification entity', async () => {
      const received = await service.deleteOne(conditions);
      expect(received).toBeInstanceOf(NotificationEntity);
      expect(received.id).toBe(undefined);

      return service.selectOne(conditions).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual({});
      });
    });

    it('should be return not found error', async () => {
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual({});
      });
    });

    it('should be return transaction error', async () => {
      jest.spyOn(service, 'selectOne').mockImplementation(async () => new NotificationEntity());
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual({});
      });
    });
  });
})
