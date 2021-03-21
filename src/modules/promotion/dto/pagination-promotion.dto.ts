import { PaginationMixin } from 'src/common/dto';
import { PromotionEntity } from '../promotion.entity';

export class PaginationPromotionDto extends PaginationMixin(PromotionEntity) {
  constructor([result, total]: [PromotionEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
