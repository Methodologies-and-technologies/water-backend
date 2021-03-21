import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEXP_PHONE_NUMBER } from '../auth.constants';

export class VerifyDto {
  @IsString()
  @Matches(REGEXP_PHONE_NUMBER, {
    message: 'phoneNumber must be between 8 and 13 characters',
  })
  @ApiProperty({ example: '+38000000000' })
  public readonly phoneNumber: string;

  @IsString()
  @ApiProperty({ example: '652655' })
  public readonly confirmationCode: string;
}
