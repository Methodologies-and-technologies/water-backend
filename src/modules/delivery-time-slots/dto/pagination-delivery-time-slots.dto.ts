import { PaginationMixin } from 'src/common/dto';
import { DeliveryTimeSlotsEntity } from '../delivery-time-slots.entity';

export class PaginationDeliveryTimeSlotsDto extends PaginationMixin(DeliveryTimeSlotsEntity) {
  constructor([result, total]: [DeliveryTimeSlotsEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
