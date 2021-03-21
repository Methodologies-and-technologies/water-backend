import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { OrderTypeEnum } from 'src/common/enums/order-type.enum';

export class UpdateOrderDto {
  @Type(() => String)
  @IsOptional()
  @ApiProperty({ enum: OrderTypeEnum })
  public readonly status?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly orderNumber?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly discount?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly deliveryCost?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly totalAmount?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly transactionId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'new delivery date here' })
  public readonly deliveryDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'new comment here' })
  public readonly comment?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'new promocode here' })
  public readonly promocode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'new paymentMethod here' })
  public readonly paymentMethod?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryAddressId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryTimeSlotId?: number;
}
