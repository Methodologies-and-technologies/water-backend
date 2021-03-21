import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @ApiProperty({ example: 1 })
  public readonly productId?: number;

  @IsOptional()
  @ApiProperty({ example: 1 })
  public readonly userId?: number;

  @IsOptional()
  @ApiProperty({ example: 4 })
  public readonly quantity?: number;
}
