import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAreaController } from './delivery-area.controller';
import { DeliveryAreaEntity } from './delivery-area.entity';
import { DeliveryAreaService } from './services/delivery-area.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryAreaEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DeliveryAreaController],
  providers: [DeliveryAreaService],
  exports: [DeliveryAreaService],
})
export class DeliveryAreaModule {}
