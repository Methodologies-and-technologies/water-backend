import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { Like, Repository } from 'typeorm';
import { DeliveryAddressEntity } from '../delivery-address.entity';
import { PaginationDeliveryAddressDto } from '../dto/pagination-delivery-address.dto';
import { createError } from '../../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../../common/enums';
import { QueryParamsDeliveryAddressDto } from '../dto/query-delivery-address.dto';
import { DeliveryAddressSapService } from '../delivery-address-sap.service';

@Injectable()
export class DeliveryAddressService {
  constructor(
    @InjectRepository(DeliveryAddressEntity)
    private readonly deliveryAddressRepository: Repository<DeliveryAddressEntity>,
    private readonly deliveryAddressSapService: DeliveryAddressSapService,
  ) {}

  public async getAllDeliveryAddress(
    options: QueryParamsDeliveryAddressDto,
  ): Promise<PaginationDeliveryAddressDto> {
    return new PaginationDeliveryAddressDto(
      (Array.from(Object.keys(options)) as Array<string>).length
        ? await this.deliveryAddressRepository.findAndCount({
            where: { type: Like(`${options.type}%`) },
            relations: ['user'],
            take: 10,
            skip: 0,
          })
        : ((options = { take: 10, skip: 0 } as any),
          await this.deliveryAddressRepository.findAndCount({
            ...options,
            relations: ['user'],
          })),
    );
  }

  public async createDeliveryAddress(
    delivery: Partial<DeliveryAddressEntity>,
    user: UserEntity,
  ): Promise<DeliveryAddressEntity> {
    const deliveryAddress: DeliveryAddressEntity[] = await this.deliveryAddressRepository.find({
      where: { userId: user.id },
      relations: ['user'],
    });
    const createdDeliveryAddress: DeliveryAddressEntity = this.deliveryAddressRepository.create({
      ...delivery,
      user: user,
    });
    await this.deliveryAddressRepository.save(createdDeliveryAddress);
    deliveryAddress.push(createdDeliveryAddress);
    await this.deliveryAddressSapService.sendCreatedUserDeliveryAddress(
      createdDeliveryAddress,
      createdDeliveryAddress.user.sapId,
    );
    return createdDeliveryAddress;
  }

  public async updateDeliveryAddress(
    id: number,
    data: Partial<DeliveryAddressEntity>,
  ): Promise<DeliveryAddressEntity> {
    let deliveryAddress: DeliveryAddressEntity = await this.deliveryAddressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!deliveryAddress) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_ADDRESS_NOT_FOUND, 'id'));
    }
    await this.deliveryAddressRepository.update(id, data);
    deliveryAddress = await this.deliveryAddressRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    await this.deliveryAddressSapService.sendUpdatedUserDeliveryAddress(
      deliveryAddress,
      deliveryAddress.user.sapId,
    );
    return deliveryAddress;
  }

  public async getDeliveryAddressById(id: number): Promise<DeliveryAddressEntity> {
    const deliveryAddress: DeliveryAddressEntity = await this.deliveryAddressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!deliveryAddress) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_ADDRESS_NOT_FOUND, 'id'));
    }
    return deliveryAddress;
  }

  public async getDeliveryAddressBySapId(sapId: string): Promise<DeliveryAddressEntity> {
    const deliveryAddress: DeliveryAddressEntity = await this.deliveryAddressRepository.findOne({
      where: { sapId },
    });

    if (!deliveryAddress) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_ADDRESS_NOT_FOUND, 'sapId'));
    }
    return deliveryAddress;
  }

  public async destroyDeliveryAddress(id: number): Promise<DeliveryAddressEntity> {
    const deliveryAddress: DeliveryAddressEntity = await this.deliveryAddressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!deliveryAddress) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_ADDRESS_NOT_FOUND, 'id'));
    }
    await this.deliveryAddressRepository.delete(id);
    return deliveryAddress;
  }
}
