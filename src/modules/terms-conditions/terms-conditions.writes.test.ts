import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { TermsConditionsService } from './services/terms-conditions.service';
import { TermsConditionsController } from './terms-conditions.controller';
import { TermsConditionsEntity } from './terms-conditions.entity';

describe('terms and conditions writes test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([TermsConditionsEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [TermsConditionsController],
      providers: [TermsConditionsService],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'us1er@1.com',
        phoneNumber: '+3801666751205',
        fullName: 'use1r 1',
      },
    });
    const registratedUser = JSON.parse(userPayload);
    token = registratedUser.accessToken;
  });

  // *****************************************************************************************************************
  // POST /api/terms-conditions
  // *****************************************************************************************************************

  it(`/POST terms-conditions, set new terms and conditions`, async () => {
    const newtermsConditions = {
      title: 'new title',
      text: 'some long text',
    };

    const { payload: termsConditionsPayload } = await app.inject({
      method: 'POST',
      url: '/terms-conditions',
      payload: {
        title: newtermsConditions.title,
        text: newtermsConditions.text,
      },
      headers: {
        authorization: 'Token ' + token,
      },
    });

    const { title, text } = JSON.parse(termsConditionsPayload);
    expect(title).toEqual(newtermsConditions.title);
    expect(text).toEqual(newtermsConditions.text);

    const { payload: termsConditions } = await app.inject({
      method: 'GET',
      url: '/terms-conditions',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { title: titleUp, text: textUp } = JSON.parse(termsConditions);
    expect(titleUp).toEqual(newtermsConditions.title);
    expect(textUp).toEqual(newtermsConditions.text);
  });

  it(`/POST terms-conditions, override old terms and conditions with new one`, async () => {
    const oldtermsConditions = {
      title: 'new title: (old)',
      text: 'some long text: (old)',
    };

    const { payload: oldTermsConditionsPayload } = await app.inject({
      method: 'POST',
      url: '/terms-conditions',
      payload: {
        title: oldtermsConditions.title,
        text: oldtermsConditions.text,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const newtermsConditions = {
      title: 'new title: (override)',
      text: 'some long text: (override)',
    };

    const { payload: termsConditionsPayload } = await app.inject({
      method: 'POST',
      url: '/terms-conditions',
      payload: {
        title: newtermsConditions.title,
        text: newtermsConditions.text,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { title, text } = JSON.parse(termsConditionsPayload);
    expect(title).toEqual(newtermsConditions.title);
    expect(text).toEqual(newtermsConditions.text);

    const { payload: termsConditions } = await app.inject({
      method: 'GET',
      url: '/terms-conditions',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { title: titleUp, text: textUp } = JSON.parse(termsConditions);
    expect(titleUp).toEqual(newtermsConditions.title);
    expect(textUp).toEqual(newtermsConditions.text);
  });

  afterAll(async () => {
    await app.close();
  });
});
