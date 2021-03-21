import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class UploadAvatarDto {
  @IsUUID(4)
  @ApiProperty({ example: '98114f04-f417-4bab-8885-53897638659e' })
  public readonly fileId: string;
}
