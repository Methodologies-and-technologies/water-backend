import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryTimeSlotsController } from './delivery-time-slots.controller';
import { DeliveryTimeSlotsEntity } from './delivery-time-slots.entity';
import { DeliveryTimeSlotsService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryTimeSlotsEntity])],
  providers: [DeliveryTimeSlotsService],
  controllers: [DeliveryTimeSlotsController],
  exports: [DeliveryTimeSlotsService],
})
export class DeliveryTimeSlotsModule {}
