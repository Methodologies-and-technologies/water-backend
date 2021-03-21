import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload, SapAuthPayload } from './auth.interface';
import { createError } from '../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../common/enums';
import { UserService } from '../user/services/user.service';
import { ConfigService } from '../../config/config.service';
import { isSapAuthPayload } from '../../common/helpers/is-sap-auth-payload.helpers';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET || 'thisIsASecretKey',
    });
  }

  public async validate(payload: AuthPayload | SapAuthPayload) {
    if (isSapAuthPayload(payload)) {
      const sapClientId: string = this.configService.get('SAP_CLIENT_ID');

      if (sapClientId !== payload.clientId) {
        throw new UnauthorizedException(createError(ErrorTypeEnum.INVALID_CLIENT_ID, 'clientId'));
      }

      return payload;
    }

    const { fullName } = payload;
    const user = await this.userService.findUserByFullName(fullName);
    if (!user) {
      throw new UnauthorizedException(
        createError(ErrorTypeEnum.INVALID_JWT_TOKEN, 'authorization'),
      );
    }
    return user;
  }
}
