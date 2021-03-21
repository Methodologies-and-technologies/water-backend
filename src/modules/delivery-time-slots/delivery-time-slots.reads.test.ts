import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { deliveryTimeSlots } from 'src/database/migrations/1610622011512-delivery-time-slots';
import { AuthModule } from '../auth/auth.module';
import { DeliveryTimeSlotsController } from './delivery-time-slots.controller';
import { DeliveryTimeSlotsEntity } from './delivery-time-slots.entity';
import { DeliveryTimeSlotsService } from './services';

describe('delivery time slots reads test', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([DeliveryTimeSlotsEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [DeliveryTimeSlotsController],
      providers: [DeliveryTimeSlotsService],
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
  // GET /api/delivery-time-slots
  // *****************************************************************************************************************

  it(`/GET delivery-time-slots`, async () => {
    const { payload: deliveryAreaPayload } = await app.inject({
      method: 'GET',
      url: '/delivery-time-slots',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(deliveryAreaPayload);
    const filteredData = result.map(({ value }) => ({ value }));
    const filteredDeliveryTimeSlots = deliveryTimeSlots.map(({ value }) => ({ value }));
    expect(filteredData).toEqual(filteredDeliveryTimeSlots);
    expect(total).toEqual(filteredDeliveryTimeSlots.length);
  });

  afterAll(async () => {
    await app.close();
  });
});
