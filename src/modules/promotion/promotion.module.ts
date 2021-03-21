import { HttpModule, Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PassportModule } from '@nestjs/passport';
import { PromotionEntity } from './promotion.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { JwtConfigService } from '../auth/jwt-config.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { PromotionSapService } from './promotion-sap.service';
import { FilesModule } from '../files';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionEntity]),
    HttpModule,
    ChangeEventModule,
    CoreModule,
    FilesModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [PromotionService, PromotionSapService],
  controllers: [PromotionController],
  exports: [PromotionService],
})
export class PromotionModule {}
