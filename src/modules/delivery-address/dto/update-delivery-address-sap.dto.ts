import { DeliveryAddressEntity } from '../delivery-address.entity';
import { DeliveryAddressSapDto } from './delivery-address-sap.dto';

export class UpdateDeliveryAddressSapDto extends DeliveryAddressSapDto {
  constructor(userDeliveryAddress: DeliveryAddressEntity, userSapId: string) {
    super(userDeliveryAddress, userSapId);
  }
}
