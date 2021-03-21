import { Injectable } from '@nestjs/common';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from 'src/config';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET') || 'thisIsASecretKey',
      signOptions: {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') || '1D',
      },
    };
  }
}
