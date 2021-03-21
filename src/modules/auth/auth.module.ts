import { Module } from '@nestjs/common';
import { AuthService } from './services';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfigService } from './jwt-config.service';
import { ConfigService } from 'src/config';
import { UserModule } from '../user';
import { DraftUserModule } from '../draft-user';
import { FilesModule } from '../files';
import { ChangeEventModule } from '../change-events/change-event.module';
import { CoreModule } from '../core/core.module';
import { TokenService } from '../../common/services/token.service';

@Module({
  imports: [
    ChangeEventModule,
    CoreModule,
    FilesModule,
    DraftUserModule,
    UserModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, inject: [ConfigService] }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
