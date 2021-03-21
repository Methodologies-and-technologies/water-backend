import { PaginationMixin } from 'src/common/dto';
import { CartEntity } from '../cart.entity';

export class PaginationCartItemsDto extends PaginationMixin(CartEntity) {
  constructor([result, total]: [CartEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
