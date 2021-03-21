import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEXP_PHONE_NUMBER } from '../../auth/auth.constants';

export class SapUpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ maxLength: 256 })
  CustomerName?: string;

  @IsString()
  @IsOptional()
  @Matches(REGEXP_PHONE_NUMBER, {
    message: 'Phone must be between 8 and 13 characters',
  })
  @ApiProperty({ example: '+38000000000' })
  Phone?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ maxLength: 256 })
  Email?: string;
}
