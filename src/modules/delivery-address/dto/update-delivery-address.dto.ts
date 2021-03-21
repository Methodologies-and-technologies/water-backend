import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeliveryAddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256 })
  public readonly type: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly addressName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly governorate: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly area: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly block: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly street: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly avenue: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly houseNumber: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly buildingNumber: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly floorNumber: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly apartmentNumber: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly officeNumber: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly direction: string;
}
