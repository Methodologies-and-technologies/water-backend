import { HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { JwtConfigService } from '../auth/jwt-config.service';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { ProductPromotionEntity } from './product-promotion.entity';
import { ProductSapService } from './product-sap.service';
import { ProductController } from './product.controller';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { FilesModule } from '../files';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductPromotionEntity]),
    HttpModule,
    ChangeEventModule,
    CoreModule,
    FilesModule,
    PromotionModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductSapService],
  exports: [ProductService],
})
export class ProductModule {}
