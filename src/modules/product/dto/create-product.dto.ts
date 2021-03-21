import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'some-type' })
  public readonly type: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'some-title' })
  public readonly title: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly capacity: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly packCapacity: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly pricePerItem: number;

  @IsInt()
  @Min(1)
  @Max(500)
  @ApiProperty({ example: 5 })
  public readonly totalPrice: number;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  @ApiProperty({ example: 'about' })
  public readonly about: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly minOrder: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly maxOrder: number;

  @IsUUID(4)
  @ApiProperty({ example: '98114f04-f417-4bab-8885-53897638659e' })
  public readonly imageId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly freeProducts: number;
}
