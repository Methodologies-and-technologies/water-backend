import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryParamsDto {
  @Type(() => String)
  @IsOptional()
  @Transform((type) => type.toLowerCase())
  @ApiProperty({ enum: ['bottles', 'gallons', 'cups-ice', 'offers', 'special'] })
  public readonly type?: string;

  @Type(() => String)
  @IsOptional()
  @Transform((title) => title.toLowerCase())
  @ApiProperty({ example: 'some-title' })
  public readonly title?: string;
}
