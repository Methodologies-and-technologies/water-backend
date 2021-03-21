import { DatabaseModule } from '../../database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../../modules/files/files.module';
import { AuthModule } from '../../modules/auth';
import { UserModule } from '../../modules/user';
import { ServiceRatingModule } from '../../modules/service-rating';
import { QuestionModule } from '../../modules/question';
import { ContactModule } from '../../modules/contact';
import { NotificationsModule } from '../../modules/notifications';
import { ProductModule } from '../../modules/product';
import { CartModule } from '../../modules/cart';
import { MosqueModule } from '../../modules/mosque';
import { DeliveryAddressModule } from '../../modules/delivery-address';
import { TermsConditionsModule } from '../../modules/terms-conditions';
import { DeliveryAreaModule } from '../../modules/delivery-area';
import { DraftUserModule } from '../../modules/draft-user';
import { SupportModule } from '../../modules/support';
import { DeliveryTimeSlotsModule } from '../../modules/delivery-time-slots';
import { ChangeEventModule } from '../../modules/change-events/change-event.module';
import { PromotionModule } from '../../modules/promotion';
import { FileEntity } from '../../modules/files/file.entity';
import { OrderModule } from 'src/modules/order/order.module';

export const testImports = [
  DatabaseModule,
  AuthModule,
  UserModule,
  ServiceRatingModule,
  QuestionModule,
  ContactModule,
  NotificationsModule,
  ProductModule,
  CartModule,
  MosqueModule,
  DeliveryAddressModule,
  TermsConditionsModule,
  DeliveryAreaModule,
  DraftUserModule,
  SupportModule,
  DeliveryTimeSlotsModule,
  ChangeEventModule,
  PromotionModule,
  OrderModule,
  FilesModule,
  TypeOrmModule.forFeature([FileEntity]),
];
