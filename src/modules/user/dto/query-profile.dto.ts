import { IsOptional } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  public readonly fullName?: string;

  @IsOptional()
  public readonly email?: string;

  @IsOptional()
  public readonly phoneNumber?: string;
}
