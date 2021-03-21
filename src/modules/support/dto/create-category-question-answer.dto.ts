import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryQuestionAnswerDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'name for question' })
  public readonly questionName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'content for answer' })
  public readonly answerName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'content for answer' })
  public readonly answerContent: string;
}
