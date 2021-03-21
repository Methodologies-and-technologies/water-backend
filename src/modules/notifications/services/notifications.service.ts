import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { UserEntity } from 'src/modules/user/user.entity';
import { Twilio } from 'twilio';
import { Repository, SaveOptions } from 'typeorm';
import { PaginationNotificationDto } from '../dto/pagination-notification.dto';
import { ALL_NOTIFICATIONS_SENT, QUERY_PARAMS } from '../notification.constants';
import { NotificationEntity } from '../notification.entity';
import { createError } from '../../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../../common/enums';
import { QueryParamsDto } from '../dto';
import { PaginationUsersDto, UserService } from 'src/modules/user';
import { ResponseSuccess } from 'src/modules/auth/auth.interface';

@Injectable()
export class NotificationsService {
  private readonly client: Twilio;
  private readonly from: string;
  private readonly twillioEnabled: boolean;

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
    this.from = String(this.configService.get('TWILIO_FROM'));
    this.twillioEnabled = this.configService.get('TWILLIO_ENABLED');
  }

  public async getAllNotifications(options?: QueryParamsDto): Promise<PaginationNotificationDto> {
    const optionsKeys: string[] = Object.keys(options || []);
    const data: [NotificationEntity[], number] = optionsKeys.includes(QUERY_PARAMS)
      ? await this.notificationRepository.findAndCount({
          where: { userId: options.userId },
          take: 10,
          skip: 0,
        })
      : ((options = { take: 10, skip: 0 } as any),
        await this.notificationRepository.findAndCount({
          ...options,
        }));

    return new PaginationNotificationDto(data);
  }

  public async sendNotificationsToAllUsers(
    options: SaveOptions = { transaction: false },
  ): Promise<ResponseSuccess> {
    return this.notificationRepository.manager.transaction(async () => {
      const { result: users }: PaginationUsersDto = await this.userService.getManyUsers({});
      const { result: notifications }: PaginationNotificationDto = await this.getAllNotifications();
      const usersToUpdate = [];

      try {
        users.map(async (user: UserEntity) => {
          if (user.notifications) {
            user.notifications.push(...notifications);
          }
          usersToUpdate.push(user);
          notifications.forEach(async (notification: NotificationEntity) => {
            if (this.twillioEnabled) {
              try {
                await this.client.messages.create({
                  to: user.phoneNumber,
                  from: this.from,
                  body: notification.name + '\n' + notification.content,
                });
              } catch (err) {
                throw new ConflictException([
                  createError(err.message, 'twilio error'),
                  createError(ErrorTypeEnum.TWILIO_ERROR, '[empty]'),
                ]);
              }
            }
          });
        });

        await this.userService.setNewUsersInfo(usersToUpdate, options);
        return { result: ALL_NOTIFICATIONS_SENT };
      } catch (err) {
        throw new BadRequestException(createError(ErrorTypeEnum.FAILED_TO_BULK_UPDATE, 'user id'));
      }
    });
  }

  public async createNotification(
    notification: Partial<NotificationEntity>,
    user: UserEntity,
  ): Promise<NotificationEntity> {
    const createdNotification: NotificationEntity = this.notificationRepository.create({
      ...notification,
      user: user,
    });
    await this.notificationRepository.save(createdNotification);
    return await this.getNotificationById(createdNotification.id);
  }

  public async getNotificationsByUserId(id: number): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = await this.notificationRepository.find({
      where: { userId: id },
    });
    return notifications;
  }

  public async updateNotification(
    id: number,
    data: Partial<NotificationEntity>,
  ): Promise<NotificationEntity> {
    let notification: NotificationEntity = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(createError(ErrorTypeEnum.NOTIFICATION_NOT_FOUND, 'id'));
    }
    await this.notificationRepository.update(id, data);
    notification = await this.notificationRepository.findOne({ where: { id } });
    return notification;
  }

  public async getNotificationById(id: number): Promise<NotificationEntity> {
    const notification: NotificationEntity = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(createError(ErrorTypeEnum.NOTIFICATION_NOT_FOUND, 'id'));
    }
    return notification;
  }

  public async destroyNotification(id: number): Promise<NotificationEntity> {
    const notification: NotificationEntity = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(createError(ErrorTypeEnum.NOTIFICATION_NOT_FOUND, 'id'));
    }
    await this.notificationRepository.delete(id);
    return notification;
  }
}
