import { HttpModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { DeliveryAddressController } from './delivery-address.controller';
import { DeliveryAddressEntity } from './delivery-address.entity';
import { DeliveryAddressSapService } from './delivery-address-sap.service';
import { DeliveryAddressService } from './services';

@Module({
  imports: [
    HttpModule,
    ChangeEventModule,
    CoreModule,
    TypeOrmModule.forFeature([DeliveryAddressEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DeliveryAddressController],
  providers: [DeliveryAddressService, DeliveryAddressSapService],
  exports: [DeliveryAddressService],
})
export class DeliveryAddressModule {}
