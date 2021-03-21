import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { DeliveryAddressTypeEnum } from 'src/common/enums/delivery-address-type.enum';

export class QueryParamsDeliveryAddressDto {
  @Type(() => String)
  @IsOptional()
  @Transform((type) => type.toLowerCase())
  @ApiProperty({ enum: DeliveryAddressTypeEnum })
  public readonly type?: string;
}
