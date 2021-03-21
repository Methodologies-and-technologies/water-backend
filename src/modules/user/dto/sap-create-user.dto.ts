import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEXP_PHONE_NUMBER } from '../../auth/auth.constants';

export class SapCreateUserDto {
  @IsString()
  @ApiProperty({ maxLength: 256 })
  SapId: string;

  @IsString()
  @ApiProperty({ maxLength: 256 })
  CustomerName: string;

  @IsString()
  @Matches(REGEXP_PHONE_NUMBER, {
    message: 'Phone must be between 8 and 13 characters',
  })
  @ApiProperty({ example: '+38000000000' })
  Phone: string;

  @IsEmail()
  @ApiProperty({ maxLength: 256 })
  Email: string;
}
