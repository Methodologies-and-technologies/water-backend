import { PaginationMixin } from 'src/common/dto';
import { DeliveryAddressEntity } from '../delivery-address.entity';

export class PaginationDeliveryAddressDto extends PaginationMixin(DeliveryAddressEntity) {
  constructor([result, total]: [DeliveryAddressEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
