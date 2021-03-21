import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user';
import { CartController } from './cart.controller';
import { CartEntity } from './cart.entity';
import { CartService } from './services/cart.service';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { FilesModule } from '../files';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity]),
    UserModule,
    ProductModule,
    FilesModule,
    CoreModule,
    ChangeEventModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
