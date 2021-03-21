import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryParamsDto {
  @IsBoolean()
  @Transform((val) => (val === 'true' ? true : val))
  public readonly isProcessed: boolean = false;
}
