import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { SapApiService } from '../core/sap-api.service';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { DeliveryAddressEntity } from './delivery-address.entity';

describe('delivery address integrations test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    id?: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    accessToken?: string;
  }

  let verifiedUser: UserPayload;
  let registratedUser: UserPayload;
  let sapToken: string;
  let userToken: string;
  let firstDeliveryAddressId: string;
  let firstDeliveryAddress: Partial<DeliveryAddressEntity>;

  const successfulPost: Function = async () => {
    console.log('Mocked method');
    return { isSuccess: true, data: { id: '40' } };
  };

  const failedPost: Function = async () => {
    console.log('Mocked method');
    return { isSuccess: false };
  };

  const apiService = {
    post: successfulPost,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    })
      .overrideProvider(SapApiService)
      .useValue(apiService)
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });

  beforeAll(async () => {
    const { payload } = await app.inject({
      method: 'POST',
      url: '/auth/sap/login',
      payload: {
        clientId: process.env.SAP_CLIENT_ID,
        clientSecret: process.env.SAP_CLIENT_SECRET,
      },
    });
    sapToken = JSON.parse(payload).token;
  });

  beforeAll(async () => {
    verifiedUser = {
      email: 't1estf@gmail1111.com',
      phoneNumber: '+38000000000',
      fullName: 'test fullname',
    };
    apiService.post = successfulPost;

    const { payload: registerPayload } = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: verifiedUser.email,
        phoneNumber: verifiedUser.phoneNumber,
        fullName: verifiedUser.fullName,
      },
    });

    const { payload: loginPayload } = await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: verifiedUser.phoneNumber,
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: verifiedUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    expect(JSON.parse(registerPayload)).toEqual({ result: SUCCESS });
    expect(JSON.parse(loginPayload)).toEqual({ result: SUCCESS });

    registratedUser = JSON.parse(userPayload);
    userToken = registratedUser.accessToken;
  });

  // *****************************************************************************************************************
  // GET /delivery-addresses
  // *****************************************************************************************************************

  describe('Creation of the delivery address', () => {
    describe('Request to SAP is successful', () => {
      beforeAll(async () => {
        firstDeliveryAddress = {
          type: 'test p11',
          addressName: ' is a test product',
          governorate: '91119.11199',
          area: 1,
          block: 'str',
          street: 'street',
          avenue: 'ave',
          houseNumber: 1,
          buildingNumber: 1,
          floorNumber: 1,
          apartmentNumber: 2,
          officeNumber: 2,
          direction: 'direction',
        };

        const { payload: newDeliveryAddress } = await app.inject({
          method: 'POST',
          url: '/delivery-addresses',
          payload: {
            type: firstDeliveryAddress.type,
            addressName: firstDeliveryAddress.addressName,
            governorate: firstDeliveryAddress.governorate,
            area: firstDeliveryAddress.area,
            block: firstDeliveryAddress.block,
            street: firstDeliveryAddress.street,
            avenue: firstDeliveryAddress.avenue,
            houseNumber: firstDeliveryAddress.houseNumber,
            buildingNumber: firstDeliveryAddress.buildingNumber,
            floorNumber: firstDeliveryAddress.floorNumber,
            apartmentNumber: firstDeliveryAddress.apartmentNumber,
            officeNumber: firstDeliveryAddress.officeNumber,
            direction: firstDeliveryAddress.direction,
          },
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });

        firstDeliveryAddressId = JSON.parse(newDeliveryAddress).id;
      });

      it('should generate an event of creation', async (done) => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });

        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 2);
        expect(payload.result[1]).toHaveProperty('id');
        expect(payload.result[1]).toHaveProperty('type', 'DELIVERY_ADDRESS');
        expect(payload.result[1]).toHaveProperty('operation', 'CREATE');
        expect(payload.result[1]).toHaveProperty('isProcessed', true);
        expect(payload.result[1]).toHaveProperty('createdAt');
        expect(payload.result[1]).toHaveProperty('updatedAt');
        done();
      });
    });

    describe('Request to SAP is failed', () => {
      beforeAll(async () => {
        firstDeliveryAddress = {
          type: 'new delivery address',
          addressName: 'new is a test product',
          governorate: '12.11199',
          area: 7,
          block: 'str-08',
          street: 'street-01',
          avenue: 'ave-03',
          houseNumber: 3,
          buildingNumber: 9,
          floorNumber: 4,
          apartmentNumber: 6,
          officeNumber: 7,
          direction: 'direction-00',
        };

        apiService.post = failedPost;

        await app.inject({
          method: 'POST',
          url: '/delivery-addresses',
          payload: {
            type: firstDeliveryAddress.type,
            addressName: firstDeliveryAddress.addressName,
            governorate: firstDeliveryAddress.governorate,
            area: firstDeliveryAddress.area,
            block: firstDeliveryAddress.block,
            street: firstDeliveryAddress.street,
            avenue: firstDeliveryAddress.avenue,
            houseNumber: firstDeliveryAddress.houseNumber,
            buildingNumber: firstDeliveryAddress.buildingNumber,
            floorNumber: firstDeliveryAddress.floorNumber,
            apartmentNumber: firstDeliveryAddress.apartmentNumber,
            officeNumber: firstDeliveryAddress.officeNumber,
            direction: firstDeliveryAddress.direction,
          },
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });
      });

      it('should generate an event of creation', async (done) => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 2);
        expect(payload.result[1]).toHaveProperty('id');
        expect(payload.result[1]).toHaveProperty('type', 'DELIVERY_ADDRESS');
        expect(payload.result[1]).toHaveProperty('operation', 'CREATE');
        expect(payload.result[1]).toHaveProperty('isProcessed', true);
        expect(payload.result[1]).toHaveProperty('createdAt');
        expect(payload.result[1]).toHaveProperty('updatedAt');
        done();
      });
    });
  });

  describe('Updating of the delivery address by its id', () => {
    describe('Request to SAP is successful', () => {
      beforeAll(async () => {
        apiService.post = successfulPost;

        const secondDeliveryAddress = {
          type: 'p11 123',
          addressName: ' is a test product12',
          governorate: '91119.11199',
          area: 12,
          block: 'str',
          street: 'street',
          avenue: 'ave',
          houseNumber: 3,
          buildingNumber: 4,
          floorNumber: 1,
          apartmentNumber: 4,
          officeNumber: 7,
          direction: 'direction 123',
        };

        await app.inject({
          method: 'PUT',
          url: `/delivery-addresses/${firstDeliveryAddressId}`,
          payload: {
            type: secondDeliveryAddress.type,
            addressName: secondDeliveryAddress.addressName,
            governorate: secondDeliveryAddress.governorate,
            area: secondDeliveryAddress.area,
            block: secondDeliveryAddress.block,
            street: secondDeliveryAddress.street,
            avenue: secondDeliveryAddress.avenue,
            houseNumber: secondDeliveryAddress.houseNumber,
            buildingNumber: secondDeliveryAddress.buildingNumber,
            floorNumber: secondDeliveryAddress.floorNumber,
            apartmentNumber: secondDeliveryAddress.apartmentNumber,
            officeNumber: secondDeliveryAddress.officeNumber,
            direction: secondDeliveryAddress.direction,
          },
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });
      });

      it('should generate an event of update', async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 3);
        expect(payload.result[2]).toHaveProperty('id');
        expect(payload.result[2]).toHaveProperty('type', 'DELIVERY_ADDRESS');
        expect(payload.result[2]).toHaveProperty('operation', 'UPDATE');
        expect(payload.result[2]).toHaveProperty('isProcessed', true);
        expect(payload.result[2]).toHaveProperty('createdAt');
        expect(payload.result[2]).toHaveProperty('updatedAt');
      });
    });

    describe('Request to SAP is failed', () => {
      beforeAll(async () => {
        apiService.post = failedPost;

        const newDeliveryAddress = {
          type: 'p11 123',
          addressName: ' is a test product12',
          governorate: '91119.11199',
          area: 12,
          block: 'str',
          street: 'street',
          direction: 'direction 123',
        };

        await app.inject({
          method: 'PUT',
          url: `/delivery-addresses/${firstDeliveryAddressId}`,
          payload: {
            type: newDeliveryAddress.type,
            addressName: newDeliveryAddress.addressName,
            governorate: newDeliveryAddress.governorate,
            area: newDeliveryAddress.area,
            block: newDeliveryAddress.block,
            street: newDeliveryAddress.street,
            direction: newDeliveryAddress.direction,
          },
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });
      });

      it('should generate an event of update', async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 2);
        expect(payload.result[1]).toHaveProperty('id');
        expect(payload.result[1]).toHaveProperty('type', 'DELIVERY_ADDRESS');
        expect(payload.result[1]).toHaveProperty('operation', 'UPDATE');
        expect(payload.result[1]).toHaveProperty('isProcessed', false);
        expect(payload.result[1]).toHaveProperty('createdAt');
        expect(payload.result[1]).toHaveProperty('updatedAt');
      });
    });

    describe('Request to update from SAP', () => {
      beforeAll(async () => {
        apiService.post = failedPost;

        const secondDeliveryAddress = {
          apartmentNumber: 4,
          officeNumber: 9,
          direction: 'direction-90',
        };

        await app.inject({
          method: 'PUT',
          url: `/delivery-addresses/${firstDeliveryAddressId}`,
          payload: {
            apartmentNumber: secondDeliveryAddress.apartmentNumber,
            officeNumber: secondDeliveryAddress.officeNumber,
            direction: secondDeliveryAddress.direction,
          },
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });
      });

      it('should not generate an event of update', async () => {
        const { payload: payloadString1 } = await app.inject({
          method: 'GET',
          url: '/change-events',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload1 = JSON.parse(payloadString1);
        expect(payload1).toHaveProperty('result');
        expect(payload1).toHaveProperty('total', 3);

        const { payload: payloadString2 } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload2 = JSON.parse(payloadString2);
        expect(payload2).toHaveProperty('result');
        expect(payload2).toHaveProperty('total', 3);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
