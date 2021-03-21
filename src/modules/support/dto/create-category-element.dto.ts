import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateCategoryAnswerDto } from './create-category-answer.dto';
import { CreateCategoryQuestionDto } from './create-category-question.dto';

export class CreateCategoryElementDto {
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateCategoryQuestionDto)
  public readonly question: CreateCategoryQuestionDto;

  @ValidateNested({
    each: true,
  })
  @Type(() => CreateCategoryAnswerDto)
  public readonly answer: CreateCategoryAnswerDto;
}
