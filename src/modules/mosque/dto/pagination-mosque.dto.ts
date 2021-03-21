import { PaginationMixin } from 'src/common/dto';
import { MosqueEntity } from '../mosque.entity';

export class PaginationMosqueDto extends PaginationMixin(MosqueEntity) {
  constructor([result, total]: [MosqueEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
