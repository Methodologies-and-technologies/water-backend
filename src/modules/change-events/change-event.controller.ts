import {
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChangeEventService } from './change-event.service';
import { CompleteChangeEventsDto } from './dto/complete-change-events.dto';
import { PaginationChangeEventsDto } from './dto/pagination-change-events.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { ChangeEventEntity } from './change-event.entity';
import { ResponseSuccess } from '../auth/auth.interface';

@ApiTags('change-events')
@Controller('change-events')
export class ChangeEventController {
  constructor(private changeEventService: ChangeEventService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    description:
      'Returned all change events using pagination or query: (type, operation, isCompleted).',
  })
  public async getAllChangeEvents(
    @Query(new ValidationPipe({ transform: true })) options?: QueryParamsDto,
  ): Promise<PaginationChangeEventsDto> {
    return this.changeEventService.getManyChangeEvents(options);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned a change event via id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found change event.',
  })
  public async getChangeEventById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<ChangeEventEntity> {
    return this.changeEventService.getChangeEvent(id);
  }

  @Put('/complete')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Change events are marked as processed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found user profile.',
  })
  @ApiBody({ type: CompleteChangeEventsDto })
  public async complete(
    @Body(new ValidationPipe()) data: CompleteChangeEventsDto,
  ): Promise<ResponseSuccess> {
    return await this.changeEventService.complete(data.ids);
  }
}
