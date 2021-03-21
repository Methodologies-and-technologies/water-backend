import { HttpModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { DeliveryAddressModule } from '../delivery-address';
import { DeliveryAddressSapService } from '../delivery-address/delivery-address-sap.service';
import { DeliveryTimeSlotsModule } from '../delivery-time-slots';
import { OrderController } from './order.controller';
import { OrderEntity } from './order.entity';
import { OrderSapService } from './order.sap-service';
import { OrderService } from './order.service';
import { JwtConfigService } from '../auth/jwt-config.service';
import { ConfigService } from '../../config';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '../files';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    HttpModule,
    ChangeEventModule,
    CoreModule,
    DeliveryAddressModule,
    DeliveryTimeSlotsModule,
    CartModule,
    FilesModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderSapService, DeliveryAddressSapService],
})
export class OrderModule {}
