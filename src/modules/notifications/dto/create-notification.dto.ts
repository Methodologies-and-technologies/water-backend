import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @IsString()
  @MinLength(5)
  @MaxLength(256)
  @ApiProperty({ example: 'notification name' })
  public readonly name: string;

  @IsString()
  @ApiProperty({ example: 'notification content' })
  public readonly content: string;
}
