import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { FindManyOptions, Repository } from 'typeorm';
import { DeliveryAreaEntity } from '../delivery-area.entity';
import { PaginationDeliveryAreaDto } from '../dto/pagination-delivery-area.dto';

@Injectable()
export class DeliveryAreaService {
  constructor(
    @InjectRepository(DeliveryAreaEntity)
    private readonly deliveryAreaEntityRepository: Repository<DeliveryAreaEntity>,
  ) {}

  public async getAllDeliveryAreas(
    options: FindManyOptions<DeliveryAreaEntity> = { take: 10, skip: 0 },
  ): Promise<PaginationDeliveryAreaDto> {
    const data: [
      DeliveryAreaEntity[],
      number,
    ] = await this.deliveryAreaEntityRepository.findAndCount(classToPlain(options));
    return new PaginationDeliveryAreaDto(data);
  }

  public async getDeliveryAreaById(id: number): Promise<DeliveryAreaEntity | null> {
    const deliveryArea: DeliveryAreaEntity = await this.deliveryAreaEntityRepository.findOne({
      where: { id },
    });
    if (!deliveryArea) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_AREA_NOT_FOUND, 'id'));
    }
    return deliveryArea;
  }
}
