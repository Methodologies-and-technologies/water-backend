import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({ example: 'Bob Brown' })
  public readonly fullName: string;

  @IsEmail()
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'jake@jake.com' })
  public readonly email: string;

  @IsString()
  @ApiProperty({ example: '+38000000000' })
  public readonly phoneNumber: string;

  @IsString()
  @ApiProperty({ example: 'question here' })
  public readonly question: string;
}
