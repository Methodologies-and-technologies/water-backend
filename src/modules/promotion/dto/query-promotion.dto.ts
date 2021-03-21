import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryParamsPromotionDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public readonly paidPacks?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public readonly price?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public readonly freePacks?: number;
}
