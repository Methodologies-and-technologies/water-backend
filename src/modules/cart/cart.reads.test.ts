import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { AuthModule } from '../auth/auth.module';
import { CartController } from './cart.controller';
import { CartEntity } from './cart.entity';
import { CartService } from './services';

describe.skip('cart reads test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([CartEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [CartController],
      providers: [CartService],
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
    token = registratedUser.token;
  });

  // *****************************************************************************************************************
  // GET /api/cart
  // *****************************************************************************************************************

  it(`/GET cart`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/cart',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(productPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  // *****************************************************************************************************************
  // GET /api/cart/{id}
  // *****************************************************************************************************************

  it(`/GET cart, failed case`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/cart/a',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(productPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
