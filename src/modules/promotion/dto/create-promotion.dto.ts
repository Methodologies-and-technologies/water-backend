import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID, Max, Min } from 'class-validator';

export class CreatePromotionDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly paidPacks: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly price: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 5 })
  public readonly freePacks: number;

  @IsUUID(4)
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly imageId: string;
}
