import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { AuthModule } from '../auth/auth.module';
import { ContactController } from './contact.controller';
import { ContactEntity } from './contact.entity';
import { ContactService } from './services';

describe('contact reads test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([ContactEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [ContactController],
      providers: [ContactService],
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
  // GET /api/contact
  // *****************************************************************************************************************

  it(`/GET contact`, async () => {
    const { payload: contactPayload } = await app.inject({
      method: 'GET',
      url: '/contact',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const { id, instagram, phone, twitter, address, whatsApp } = JSON.parse(contactPayload);
    expect(id).toEqual(1);
    expect(address).toEqual('Shuwaikh Port, WH12 State of Kuwait');
    expect(phone).toEqual('1844666');
    expect(whatsApp).toEqual('+9651844666');
    expect(instagram).toEqual('https://instagram.com/abraajwater?igshid=wrq37sw9e6if');
    expect(twitter).toEqual('https://twitter.com/AbraajWater?s=09');
  });

  afterAll(async () => {
    await app.close();
  });
});
