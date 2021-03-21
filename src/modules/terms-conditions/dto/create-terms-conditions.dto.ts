import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermsConditionsDto {
  @IsString()
  @ApiProperty({ example: 'new terms and conditions' })
  public readonly title: string;

  @IsString()
  @ApiProperty({ example: 'some text' })
  public readonly text: string;
}
