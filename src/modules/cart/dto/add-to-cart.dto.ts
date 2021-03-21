import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly productId: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly quantity: number;
}
