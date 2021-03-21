import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserSapIdDto {
  @IsString()
  @ApiProperty({ example: 'C83187' })
  public readonly sapId: string;
}
