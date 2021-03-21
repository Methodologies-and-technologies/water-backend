import { PaginationMixin } from 'src/common/dto';
import { NotificationEntity } from '../notification.entity';

export class PaginationNotificationDto extends PaginationMixin(NotificationEntity) {
  constructor([result, total]: [NotificationEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
