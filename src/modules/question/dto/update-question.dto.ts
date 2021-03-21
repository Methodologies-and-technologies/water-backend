import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @ApiProperty({ example: 'question here' })
  public readonly question: string;
}
