import { Injectable } from '@nestjs/common';
import { ChangeEventService } from '../change-events/change-event.service';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { EntityOperationEnum } from '../../common/enums/entity-operation.enum';
import { SapApiResponse, SapApiService } from '../core/sap-api.service';
import { DeliveryAddressEntity } from './delivery-address.entity';
import { UpdateDeliveryAddressSapDto } from './dto/update-delivery-address-sap.dto';
import { DeliveryAddressSapDto } from './dto/delivery-address-sap.dto';

@Injectable()
export class DeliveryAddressSapService {
  constructor(
    private sapApiService: SapApiService,
    private readonly changeEventService: ChangeEventService,
  ) {}

  public async sendCreatedUserDeliveryAddress(
    userDeliveryAddress: DeliveryAddressEntity,
    userSapId: string,
  ): Promise<SapApiResponse> {
    const userDeliveryAddressDto: DeliveryAddressSapDto = new DeliveryAddressSapDto(
      userDeliveryAddress,
      userSapId,
    );
    const sapResponse: SapApiResponse = await this.sapApiService.post(
      '/AddUserAddresses/',
      userDeliveryAddressDto,
    );
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.DELIVERY_ADDRESS,
      EntityOperationEnum.CREATE,
      JSON.stringify(userDeliveryAddressDto),
      sapResponse.isSuccess,
    );
    return sapResponse;
  }

  public async sendUpdatedUserDeliveryAddress(
    userDeliveryAddress: DeliveryAddressEntity,
    userSapId: string,
  ): Promise<SapApiResponse> {
    const userDeliveryAddressDto: UpdateDeliveryAddressSapDto = new UpdateDeliveryAddressSapDto(
      userDeliveryAddress,
      userSapId,
    );
    const sapResponse: SapApiResponse = await this.sapApiService.post(
      '/UpdateUserAddress/',
      userDeliveryAddressDto,
    );
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.DELIVERY_ADDRESS,
      EntityOperationEnum.UPDATE,
      JSON.stringify(userDeliveryAddressDto),
      sapResponse.isSuccess,
    );
    return sapResponse;
  }
}
