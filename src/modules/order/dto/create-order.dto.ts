import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryAddressId: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryTimeSlotId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'deliveryDate here' })
  public readonly deliveryDate: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'comment here' })
  public readonly comment: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'promocode here' })
  public readonly promocode: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'paymentMethod here' })
  public readonly paymentMethod?: string;
}
