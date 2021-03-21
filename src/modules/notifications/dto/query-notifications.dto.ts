import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryParamsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public readonly userId?: number;
}
