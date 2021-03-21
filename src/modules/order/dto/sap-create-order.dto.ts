import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class SapCreateOrderDto {
  @IsString()
  @ApiProperty({ readOnly: true })
  public readonly deliveryAddressId: string;

  @IsString()
  @ApiProperty({ readOnly: true })
  public readonly deliveryTimeSlotId: string;

  @IsString()
  @IsDateString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'deliveryDate here' })
  public readonly deliveryDate: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'comment here' })
  public readonly comment: string;
}
