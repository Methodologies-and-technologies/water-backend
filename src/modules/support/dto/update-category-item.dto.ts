import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryItemDto {
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 2 })
  public readonly categoryItemId?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some name for category' })
  public readonly name?: string;

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
