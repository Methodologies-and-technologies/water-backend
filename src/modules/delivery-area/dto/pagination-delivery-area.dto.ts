import { PaginationMixin } from 'src/common/dto';
import { DeliveryAreaEntity } from '../delivery-area.entity';

export class PaginationDeliveryAreaDto extends PaginationMixin(DeliveryAreaEntity) {
  constructor([result, total]: [DeliveryAreaEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
