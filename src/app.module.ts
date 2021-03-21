import { Module } from '@nestjs/common';

import { DatabaseModule } from './database';
import { ConfigModule } from './config';

import { FilesModule } from './modules/files/files.module';
import { MosqueModule } from './modules/mosque';
import { DeliveryAddressModule } from './modules/delivery-address';

import { ServiceRatingModule } from './modules/service-rating';
import { AuthModule } from './modules/auth';
import { UserModule } from './modules/user';
import { QuestionModule } from './modules/question';
import { ContactModule } from './modules/contact/contact.module';
import { NotificationsModule } from './modules/notifications';
import { ProductModule } from './modules/product/product.module';
import { TermsConditionsModule } from './modules/terms-conditions/terms-conditions.module';
import { DeliveryAreaModule } from './modules/delivery-area/delivery-area.module';
import { DraftUserModule } from './modules/draft-user';
import { CartModule } from './modules/cart';
import { SupportModule } from './modules/support';
import { ChangeEventModule } from './modules/change-events/change-event.module';
import { DeliveryTimeSlotsModule } from './modules/delivery-time-slots';
import { PromotionModule } from './modules/promotion/promotion.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    FilesModule,
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
  ],
})
export class AppModule {}
