import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { CreateCategoryElementDto } from './create-category-element.dto';

export class CreateCategoryDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'name for category' })
  public readonly name: string;

  @ValidateNested({
    each: true,
  })
  @Type(() => CreateCategoryElementDto)
  public readonly categoryElements: CreateCategoryElementDto[];
}
