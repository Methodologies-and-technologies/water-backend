import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some-type' })
  public readonly type?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'some-title' })
  public readonly title?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly capacity?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly packCapacity?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly pricePerItem?: number;

  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly totalPrice?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  @ApiProperty({ example: 'about' })
  public readonly about?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly minOrder?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly maxOrder?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @ApiProperty({ example: 5 })
  public readonly freeProducts?: number;

  @IsUUID(4)
  @IsOptional()
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly imageId?: string;
}
