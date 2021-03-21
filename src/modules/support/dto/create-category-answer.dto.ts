import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryAnswerDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'name for answer' })
  public readonly name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'content for answer' })
  public readonly content: string;
}
