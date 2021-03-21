import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryQuestionAnswerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some name for question' })
  public readonly questionName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some name for answer' })
  public readonly answerName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some content for answer' })
  public readonly answerContent?: string;
}
