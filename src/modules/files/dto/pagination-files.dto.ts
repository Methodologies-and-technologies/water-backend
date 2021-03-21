import { PaginationMixin } from 'src/common/dto';

import { FileEntity } from '../file.entity';

export class PaginationFilesDto extends PaginationMixin(FileEntity) {
  constructor([result, total]: [FileEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
