import { IsInt } from 'class-validator';

export class CompleteChangeEventsDto {
  @IsInt({ each: true })
  public readonly ids: number[];
}
