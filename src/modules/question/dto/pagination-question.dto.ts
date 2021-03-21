import { PaginationMixin } from 'src/common/dto';
import { QuestionEntity } from '../question.entity';

export class PaginationQuestionDto extends PaginationMixin(QuestionEntity) {
  constructor([result, total]: [QuestionEntity[], number]) {
    super();
    Object.assign(this, { result, total });
  }
}
