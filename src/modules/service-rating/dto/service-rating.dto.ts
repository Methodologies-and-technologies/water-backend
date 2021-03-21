import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ example: 5 })
  public readonly rating: number;
}
