import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @IsUUID(4)
  @IsOptional()
  @ApiProperty({ example: '98114f04-f417-4bab-8885-53897638659e' })
  public readonly avatarId?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1 })
  public readonly deliveryAreaId?: number;
}
