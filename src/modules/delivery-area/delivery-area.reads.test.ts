import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { deliveryAreas } from 'src/database/migrations/1610622011589-delivery-area';
import { AuthModule } from '../auth/auth.module';
import { DeliveryAreaController } from './delivery-area.controller';
import { DeliveryAreaEntity } from './delivery-area.entity';
import { DeliveryAreaService } from './services/delivery-area.service';

describe('delivery area reads test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([DeliveryAreaEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [DeliveryAreaController],
      providers: [DeliveryAreaService],
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
  // GET /api/delivery-area
  // *****************************************************************************************************************

  it.skip(`/GET delivery-area`, async () => {
    const { payload: deliveryAreaPayload } = await app.inject({
      method: 'GET',
      url: '/delivery-area',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const data = JSON.parse(deliveryAreaPayload);
    const filteredData = data.result.map(({ id, name }) => ({ id, name }));
    const filteredDeliveryAreas = deliveryAreas.map(({ id, name }) => ({ id, name }));
    expect(filteredData).toEqual(filteredDeliveryAreas);
  });

  afterAll(async () => {
    await app.close();
  });
});
