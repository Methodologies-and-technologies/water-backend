import { JwtModule } from '@nestjs/jwt';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { ConfigModule, ConfigService } from 'src/config';
import { DatabaseModule } from 'src/database';
import { DraftUserService } from '../draft-user';
import { DraftUserEntity } from '../draft-user/draft-user.entity';
import { UserEntity } from '../user/user.entity';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from './auth.constants';
import { AuthModule } from './auth.module';
import { AuthService } from './services';
import { HttpStatus } from '@nestjs/common';
import { isString } from 'class-validator';

describe('auth writes test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let anotherToken: string;
  let refreshToken: string;
  let configService: ConfigService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule,
        DatabaseModule,
        TypeOrmModule.forFeature([UserEntity, DraftUserEntity]),
        JwtModule.register({}),
      ],
      providers: [
        AuthService,
        ConfigService,
        DraftUserService,
        {
          provide: AuthService,
          useFactory: () => ({
            selectOne: (data: Partial<UserEntity>) => {
              return data;
            },
          }),
        },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    configService = app.get(ConfigService);
  });

  describe('Plain login', () => {
    beforeAll(async () => {
      verifiedUser = {
        email: 't1estf@gmail1111.com',
        phoneNumber: '+38000000000',
        fullName: 'test fullname',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: verifiedUser.email,
          phoneNumber: verifiedUser.phoneNumber,
          fullName: verifiedUser.fullName,
        },
      });

      await app.inject({
        method: 'POST',
        url: '/auth/verify-confirmation-code',
        payload: {
          phoneNumber: verifiedUser.phoneNumber,
          confirmationCode: TEST_VALID_CONFIRMATION_CODE,
        },
      });
    });

    beforeAll(async () => {
      anotherUser = {
        email: 'nse113@gmail1111.com',
        phoneNumber: '+380992373914',
        fullName: 'nfen+cs123',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: anotherUser.email,
          phoneNumber: anotherUser.phoneNumber,
          fullName: anotherUser.fullName,
        },
      });

      await app.inject({
        method: 'POST',
        url: '/auth/send-confirmation-code',
        payload: {
          phoneNumber: anotherUser.phoneNumber,
        },
      });

      const { payload: userPayload } = await app.inject({
        method: 'POST',
        url: '/auth/verify-confirmation-code',
        payload: {
          phoneNumber: anotherUser.phoneNumber,
          confirmationCode: TEST_VALID_CONFIRMATION_CODE,
        },
      });

      const user = JSON.parse(userPayload);
      anotherToken = user.accessToken;
      refreshToken = user.refreshToken;
    });

    // *****************************************************************************************************************
    // POST /api/auth/register
    // *****************************************************************************************************************

    it(`/POST register user, duplicated email`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: verifiedUser.email,
          phoneNumber: verifiedUser.phoneNumber,
          fullName: verifiedUser.fullName,
        },
      });
      expect(JSON.parse(payload)).toEqual({ message: 'EMAIL_ALREADY_TAKEN', property: 'email' });
    });

    it(`/POST register user, duplicated fullName`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 't1estf@gmail4411.com',
          phoneNumber: '+38000008000',
          fullName: verifiedUser.fullName,
        },
      });
      expect(JSON.parse(payload)).toEqual({
        message: 'FULLNAME_ALREADY_TAKEN',
        property: 'fullName',
      });
    });

    it(`/POST register user, duplicated phoneNumber`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 't@gmail1111.com',
          phoneNumber: verifiedUser.phoneNumber,
          fullName: 'test full',
        },
      });
      expect(JSON.parse(payload)).toEqual({
        message: 'PHONE_NUMBER_ALREADY_TAKEN',
        property: 'phoneNumber',
      });
    });

    // *****************************************************************************************************************
    // POST /api/auth/login
    // *****************************************************************************************************************

    it(`/POST login, invalid credentials(phoneNumber)`, async () => {
      const notExistingPhoneNumber = '+38000000001';

      const { payload, statusCode } = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          phoneNumber: notExistingPhoneNumber,
        },
      });
      const { message } = JSON.parse(payload);
      expect(statusCode).toEqual(401);
      expect(message).toEqual(ErrorTypeEnum.PHONE_NUMBER_NOT_FOUND);
    });

    it(`/POST login, SUCCESS`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          phoneNumber: verifiedUser.phoneNumber,
        },
      });
      expect(JSON.parse(payload)).toEqual({ result: SUCCESS });
    });

    // *****************************************************************************************************************
    // POST /api/auth/send-confirmation-code
    // *****************************************************************************************************************

    it(`/POST send-confirmation-code, invalid credentials(phoneNumber)`, async () => {
      const notExistingPhoneNumber = '+38000000001';

      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/send-confirmation-code',
        payload: {
          phoneNumber: notExistingPhoneNumber,
        },
      });
      expect(JSON.parse(payload)).toEqual({
        message: 'USER_NOT_REGISTRATED',
        property: 'phoneNumber',
      });
    });

    it(`/POST send-confirmation-code, SUCCESS`, async () => {
      const userCredentials = {
        email: 't1@gmail1111.com',
        phoneNumber: '+380997363950',
        fullName: 't fullname',
      };

      const { payload: register } = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: userCredentials.email,
          phoneNumber: userCredentials.phoneNumber,
          fullName: userCredentials.fullName,
        },
      });

      const { payload: verify } = await app.inject({
        method: 'POST',
        url: '/auth/send-confirmation-code',
        payload: {
          phoneNumber: userCredentials.phoneNumber,
        },
      });
      expect(JSON.parse(register)).toEqual({ result: SUCCESS });
      expect(JSON.parse(verify)).toEqual({ result: SUCCESS });
    });

    // *****************************************************************************************************************
    // POST /api/auth/verify-confirmation-code
    // *****************************************************************************************************************

    it(`/POST verify-confirmation-code, invalid credentials(phoneNumber)`, async () => {
      const notExistingPhoneNumber = '+38000000001';

      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/verify-confirmation-code',
        payload: {
          phoneNumber: notExistingPhoneNumber,
          confirmationCode: TEST_VALID_CONFIRMATION_CODE,
        },
      });
      expect(JSON.parse(payload)).toEqual({
        message: 'USER_NOT_REGISTRATED',
        property: 'phoneNumber',
      });
    });

    it(`/POST verify-confirmation-code, invalid credentials(confirmationCode)`, async () => {
      const userCredentials = {
        email: 'q1estf@gmail1111.com',
        phoneNumber: '+38000000020',
        fullName: 'test fullnameq',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: userCredentials.email,
          phoneNumber: userCredentials.phoneNumber,
          fullName: userCredentials.fullName,
        },
      });

      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/verify-confirmation-code',
        payload: {
          phoneNumber: userCredentials.phoneNumber,
          confirmationCode: TEST_VALID_CONFIRMATION_CODE + TEST_VALID_CONFIRMATION_CODE,
        },
      });
      expect(JSON.parse(payload)).toEqual({
        message: 'INVALID_CONFIRMATION_CODE',
        property: 'confirmationCode',
      });
    });

    it(`/POST verify-confirmation-code, SUCCESS`, async () => {
      const userCredentials = {
        email: 'q1estf@gma2il1131.com',
        phoneNumber: '+38000000023',
        fullName: 'te2st fullnameq',
      };

      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: userCredentials.email,
          phoneNumber: userCredentials.phoneNumber,
          fullName: userCredentials.fullName,
        },
      });

      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/verify-confirmation-code',
        payload: {
          phoneNumber: userCredentials.phoneNumber,
          confirmationCode: TEST_VALID_CONFIRMATION_CODE,
        },
      });

      const { email, fullName, phoneNumber, avatar, deliveryArea, accessToken } = JSON.parse(
        payload,
      );
      expect(email).toEqual(userCredentials.email);
      expect(fullName).toEqual(userCredentials.fullName);
      expect(phoneNumber).toEqual(userCredentials.phoneNumber);
      expect(avatar).toBeFalsy();
      expect(deliveryArea).toBeFalsy();
      expect(accessToken).not.toBeUndefined();
    });

    // *****************************************************************************************************************
    // POST /api/auth/refresh-access-token
    // *****************************************************************************************************************

    it(`/POST refresh-access-token, access token is set new`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/refresh-access-token',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(payload).toBeDefined();
    });

    it(`/POST refresh-access-token, refresh token is invalid`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/refresh-access-token',
        payload: {
          refreshToken: refreshToken + '12',
        },
      });

      expect(JSON.parse(payload)).toEqual({
        message: ErrorTypeEnum.INVALID_REFRESH_TOKEN,
        property: 'refreshToken',
      });
    });

    // *****************************************************************************************************************
    // POST /api/auth/logout
    // *****************************************************************************************************************

    it(`/POST logout, refreshToken is set null`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(JSON.parse(payload)).toEqual({
        result: SUCCESS,
      });
    });

    it(`/POST logout, refreshToken is not valid to null: (no such user with this token)`, async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(JSON.parse(payload)).toEqual({
        message: ErrorTypeEnum.INVALID_REFRESH_TOKEN,
        property: 'refreshToken',
      });
    });
  });

  describe('SAP login', () => {
    it('should validate invalid clientSecret', async () => {
      const { statusCode, payload: payloadString } = await app.inject({
        method: 'POST',
        url: '/auth/sap/login',
        payload: {
          clientId: configService.get('SAP_CLIENT_ID'),
          clientSecret: 'SOME value',
        },
      });
      const payload = JSON.parse(payloadString);
      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(payload).toHaveProperty('message', ErrorTypeEnum.INVALID_CLIENT_SECRET);
      expect(payload).toHaveProperty('property', 'clientSecret');
    });

    it('should validate invalid clientId', async () => {
      const { statusCode, payload: payloadString } = await app.inject({
        method: 'POST',
        url: '/auth/sap/login',
        payload: {
          clientId: 'Some value',
          clientSecret: configService.get('SAP_CLIENT_SECRET'),
        },
      });
      const payload = JSON.parse(payloadString);
      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(payload).toHaveProperty('message', ErrorTypeEnum.INVALID_CLIENT_ID);
      expect(payload).toHaveProperty('property', 'clientId');
    });

    it('should validate both invalid clientId and clientSecret', async () => {
      const { statusCode, payload: payloadString } = await app.inject({
        method: 'POST',
        url: '/auth/sap/login',
        payload: {
          clientId: 'SOME value',
          clientSecret: 'SOME value',
        },
      });
      const payload = JSON.parse(payloadString);
      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(payload).toHaveProperty('message', ErrorTypeEnum.INVALID_CLIENT_ID);
      expect(payload).toHaveProperty('property', 'clientId');
    });

    it('should return generated jwt token', async () => {
      const { statusCode, payload } = await app.inject({
        method: 'POST',
        url: '/auth/sap/login',
        payload: {
          clientId: configService.get('SAP_CLIENT_ID'),
          clientSecret: configService.get('SAP_CLIENT_SECRET'),
        },
      });
      expect(statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(payload)).toHaveProperty('token');
      expect(isString(JSON.parse(payload).token)).toBeTruthy();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
