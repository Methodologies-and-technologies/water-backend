import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services';
import { UserEntity } from './user.entity';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { DeliveryAreaModule } from '../delivery-area';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from '../auth/jwt-config.service';
import { FilesModule } from '../files';
import { ServiceRatingModule } from '../service-rating';
import { UserSapService } from './user.sap-service';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { ConfigService } from 'src/config';
import { TokenService } from '../../common/services/token.service';
import { SapUserController } from './sap-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    DeliveryAreaModule,
    ServiceRatingModule,
    FilesModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
    ChangeEventModule,
    CoreModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [UserService, UserSapService, TokenService],
  controllers: [UserController, SapUserController],
  exports: [UserService],
})
export class UserModule {}
