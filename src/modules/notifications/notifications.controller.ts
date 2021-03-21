import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../user/user.decorator';
import { UserEntity } from '../user/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationNotificationDto } from './dto/pagination-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationEntity } from './notification.entity';
import { NotificationsService } from './services/notifications.service';
import { QueryParamsDto } from './dto/query-notifications.dto';
import { ResponseSuccess } from '../auth/auth.interface';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all notifications using pagination.',
  })
  public async getAllNotifications(
    @Query(new ValidationPipe()) options?: QueryParamsDto,
  ): Promise<PaginationNotificationDto> {
    return this.notificationService.getAllNotifications(options);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returned one notification via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found notification.',
  })
  public async getNotificationById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<NotificationEntity> {
    return await this.notificationService.getNotificationById(id);
  }

  @Get('/user')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned notifications via user id.',
  })
  @ApiResponse({
    status: 404,
    description: 'No notifications for such user.',
  })
  public async getNotificationsByUserId(@User() user: UserEntity): Promise<NotificationEntity[]> {
    return await this.notificationService.getNotificationsByUserId(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  @ApiBody({ type: CreateNotificationDto })
  public async createNotification(
    @Body(new ValidationPipe()) notificationDto: CreateNotificationDto,
    @User() user: UserEntity,
  ): Promise<NotificationEntity> {
    return await this.notificationService.createNotification(notificationDto, user);
  }

  @Post('/send')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Notification are sent successfully',
  })
  public async sendNotificationToAllUsers(): Promise<ResponseSuccess> {
    return await this.notificationService.sendNotificationsToAllUsers();
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Notification updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found notification.',
  })
  @ApiBody({ type: UpdateNotificationDto })
  public async updateNotification(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    return await this.notificationService.updateNotification(id, data);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found Notification.',
  })
  public async destroyNotification(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<NotificationEntity> {
    return await this.notificationService.destroyNotification(id);
  }
}
