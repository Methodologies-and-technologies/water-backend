import { TokenPayload } from '../../modules/auth/token-payload.interface';
import { ConfigService } from '../../config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async getAndGenerateJwtRefreshToken(fullName: string) {
    const payload: TokenPayload = { fullName };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });
    return refreshToken;
  }
}
