import { PaginationMixin } from 'src/common/dto';
import { ChangeEventEntity } from '../change-event.entity';

export class PaginationChangeEventsDto extends PaginationMixin(ChangeEventEntity) {
  constructor([result, total]: [ChangeEventEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
