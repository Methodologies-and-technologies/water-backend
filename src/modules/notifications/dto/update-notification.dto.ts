import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(256)
  @ApiProperty({ example: 'notification name' })
  public readonly name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'notification content' })
  public readonly content: string;
}
