import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { OrderTypeEnum } from 'src/common/enums/order-type.enum';

export class QueryParamsOrderDto {
  @Type(() => String)
  @IsOptional()
  @ApiProperty({ enum: OrderTypeEnum })
  public readonly status?: string;
}
