import { HttpModule, Module } from '@nestjs/common';
import { SapApiService } from './sap-api.service';
import { ConfigModule } from '../../config/config.module';
import { TokenService } from '../../common/services/token.service';
import { JwtConfigService } from '../auth/jwt-config.service';
import { ConfigService } from '../../config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
  ],
  providers: [SapApiService, TokenService],
  exports: [SapApiService, TokenService],
})
export class CoreModule {}
