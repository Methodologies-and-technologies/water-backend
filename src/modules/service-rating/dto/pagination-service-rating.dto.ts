import { PaginationMixin } from 'src/common/dto';
import { ServiceRatingEntity } from '../service-rating.entity';

export class PaginationServiceRatingDto extends PaginationMixin(ServiceRatingEntity) {
  constructor([result, total]: [ServiceRatingEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
