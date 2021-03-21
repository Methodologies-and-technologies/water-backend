import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { MosqueController } from './mosque.controller';
import { MosqueEntity } from './mosque.entity';
import { MosqueService } from './services';

describe('mosque reads test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([MosqueEntity]),
        DatabaseModule,
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [MosqueController],
      providers: [MosqueService],
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
  // GET /api/mosque/{id}
  // *****************************************************************************************************************

  it(`/GET mosque`, async () => {
    const { payload: mosquePayload } = await app.inject({
      method: 'GET',
      url: '/mosque',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    expect(JSON.parse(mosquePayload)).toHaveProperty('result');
    expect(JSON.parse(mosquePayload)).toHaveProperty('total');
    // const {
    //   result: [{ id, name }],
    //   total,
    // } = JSON.parse(mosquePayload);
    // expect(id).toEqual(1);
    // expect(total).toEqual(1);
    // expect(name).toEqual('test mosque');
  });

  afterAll(async () => {
    await app.close();
  });
});
