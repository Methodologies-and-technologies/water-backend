import { PaginationMixin } from 'src/common/dto';
import { ProductEntity } from '../product.entity';

export class PaginationProductsDto extends PaginationMixin(ProductEntity) {
  constructor([result, total]: [ProductEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
