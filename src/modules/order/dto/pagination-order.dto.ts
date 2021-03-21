import { PaginationMixin } from 'src/common/dto';
import { OrderEntity } from '../order.entity';

export class PaginationOrdersDto extends PaginationMixin(OrderEntity) {
  constructor([result, total]: [OrderEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
