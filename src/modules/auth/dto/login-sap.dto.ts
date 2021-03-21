import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSapDto {
  @IsString()
  @ApiProperty({ example: 'sap_app_1234' })
  public readonly clientId: string;

  @IsString()
  @ApiProperty({ example: '21432fdsgdytrhbgfh' })
  public readonly clientSecret: string;
}
