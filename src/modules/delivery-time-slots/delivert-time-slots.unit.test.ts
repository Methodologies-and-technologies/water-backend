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

describe('DeliveryTimeSlotsService', () => {
  let service: DeliveryTimeSlotsService;

  const owner = plainToClass(UserEntity, { id: '067f2f3e-b936-4029-93d6-b2f58ae4f489' });
  const expected = plainToClass(DeliveryTimeSlotsEntity, {});

  beforeAll(async () => {
    process.env.TYPEORM_NAME = uuid.v4();
    const module: TestingModule = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    service = module.get<DeliveryTimeSlotsService>(DeliveryTimeSlotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should be return deliveryTimeSlots entity', async () => {
      const received = await service.createOne({ ...expected });
      expect(received).toBeInstanceOf(DeliveryTimeSlotsEntity);
      expect(received).toEqual({ ...expected });
    });

    it('should be return conflict error', async () => {
      const error = new ConflictException(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND);
      return service.createOne({ ...expected, }).catch((err) => {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectAll', () => {
    it('should be return deliveryTimeSlots entity', async () => {
      const received = await service.selectAll();
      expect(received).toBeInstanceOf(PaginationDeliveryTimeSlotsDto);
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND);
      return service.selectAll({ skip: -1 }).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectOne', () => {
    const conditions = { id: expected.id };

    it('should be return deliveryTimeSlots entity', async () => {
      const received = await service.selectOne(conditions);
      expect(received).toBeInstanceOf(DeliveryTimeSlotsEntity);
      expect(received).toEqual(expected);
    });
  });

  describe('deleteOne', () => {
    const conditions = { id: expected.id };

    it('should be return deliveryTimeSlots entity', async () => {
      const received = await service.deleteOne(conditions);
      expect(received).toBeInstanceOf(DeliveryTimeSlotsEntity);
      expect(received.id).toBe(undefined);

      const error = new NotFoundException(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND);
      return service.selectOne(conditions).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND);
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });

    it('should be return transaction error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND);
      jest.spyOn(service, 'selectOne').mockImplementation(async () => new DeliveryTimeSlotsEntity());
      return service.deleteOne({}).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });
});
