import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEXP_PHONE_NUMBER } from '../auth.constants';

export class RegisterDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'Bob Brown' })
  public readonly fullName: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'jake@jake.com' })
  public readonly email?: string;

  @IsString()
  @Matches(REGEXP_PHONE_NUMBER, {
    message: 'phoneNumber must be between 8 and 13 characters',
  })
  @ApiProperty({ example: '+38000000000' })
  public readonly phoneNumber: string;
}
