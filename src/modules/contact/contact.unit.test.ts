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

describe('ContactService', () => {
  let service: ContactService;

  beforeAll(async () => {
    process.env.TYPEORM_NAME = uuid.v4();
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([ContactEntity])],
      providers: [ContactService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('selectAll', () => {
    it('should be return application contacts entity', async () => {
      const received = await service.selectAll();
      expect(received).toBeInstanceOf(ContactEntity);
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.APPLICATION_CONTACTS_NOT_FOUND);
      return service.selectAll({ skip: -1 }).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });
});
