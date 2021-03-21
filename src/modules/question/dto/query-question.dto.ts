import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryParamsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public readonly userId?: number;
}
