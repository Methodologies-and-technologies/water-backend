import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { FindManyOptions, Repository } from 'typeorm';
import { DeliveryTimeSlotsEntity } from '../delivery-time-slots.entity';
import { PaginationDeliveryTimeSlotsDto } from '../dto/pagination-delivery-time-slots.dto';

@Injectable()
export class DeliveryTimeSlotsService {
  constructor(
    @InjectRepository(DeliveryTimeSlotsEntity)
    private readonly deliveryTimeSlotsEntityRepository: Repository<DeliveryTimeSlotsEntity>,
  ) {}

  public async getAllDeliveryTimeSlots(
    options: FindManyOptions<DeliveryTimeSlotsEntity> = { take: 10, skip: 0 },
  ): Promise<PaginationDeliveryTimeSlotsDto> {
    const data: [
      DeliveryTimeSlotsEntity[],
      number,
    ] = await this.deliveryTimeSlotsEntityRepository.findAndCount(classToPlain(options));
    return new PaginationDeliveryTimeSlotsDto(data);
  }

  public async getDeliveryTimeSlotById(id: number): Promise<DeliveryTimeSlotsEntity> {
    const deliveryTimeSlot: DeliveryTimeSlotsEntity = await this.deliveryTimeSlotsEntityRepository.findOne(
      {
        where: { id },
      },
    );

    if (!deliveryTimeSlot) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND, 'id'));
    }
    return deliveryTimeSlot;
  }

  public async getDeliveryTimeSlotBySapId(sapId: number): Promise<DeliveryTimeSlotsEntity> {
    const deliveryTimeSlot: DeliveryTimeSlotsEntity = await this.deliveryTimeSlotsEntityRepository.findOne(
      {
        where: { sapId },
      },
    );

    if (!deliveryTimeSlot) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND, 'id'));
    }
    return deliveryTimeSlot;
  }
}
