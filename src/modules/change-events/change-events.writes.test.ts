import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { SapApiService } from '../core/sap-api.service';
import { HttpStatus } from '@nestjs/common';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe.skip('change-events writes test', () => {
  let app: NestFastifyApplication;

  let userToken1: string;
  let userToken2: string;

  let sapToken: string;

  let completedIds: number[] = [];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    const apiService = module.get(SapApiService);

    jest.spyOn(apiService, 'post').mockImplementation(async () => {
      console.log('Mocked method');
      return { isSuccess: false };
    });
  });

  beforeAll(async () => {
    const { payload: registerPayload } = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: '221estf@gmail1111.com',
        phoneNumber: '+38000000011',
        fullName: 'test name',
      },
    });

    const { payload: loginPayload } = await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: '+38000000011',
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: '+38000000011',
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const registratedUser = JSON.parse(userPayload);
    userToken1 = registratedUser.accessToken;

    expect(JSON.parse(registerPayload)).toEqual({ result: SUCCESS });
    expect(JSON.parse(loginPayload)).toEqual({ result: SUCCESS });
  });

  beforeAll(async () => {
    const { payload: registerPayload } = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'userblocker@gmail1111.com',
        phoneNumber: '+38000000012',
        fullName: 'another test name',
      },
    });

    const { payload: loginPayload } = await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: '+38000000012',
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: '+38000000012',
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const registratedUser = JSON.parse(userPayload);
    userToken2 = registratedUser.accessToken;

    expect(JSON.parse(registerPayload)).toEqual({ result: SUCCESS });
    expect(JSON.parse(loginPayload)).toEqual({ result: SUCCESS });
  });

  beforeAll(async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `users/current`,
      payload: {
        fullName: 'bobil',
        phoneNumber: '+380997363950',
        email: 'test@gmail.com',
      },
      headers: {
        authorization: 'Bearer ' + userToken1,
      },
    });

    await app.inject({
      method: 'PUT',
      url: `users/current`,
      payload: {
        fullName: 'bobil213',
        phoneNumber: '+380997363951',
        email: 'test123@gmail.com',
      },
      headers: {
        authorization: 'Bearer ' + userToken2,
      },
    });
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

  // *****************************************************************************************************************
  // PUT /users/id
  // *****************************************************************************************************************

  describe('Validation', () => {
    [false, '', undefined, null, 'hello'].forEach((value) => {
      it('should not allow to provide invalid ids', async () => {
        const { payload: payloadString } = await app.inject({
          method: 'PUT',
          url: `change-events/complete`,
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
          payload: {
            ids: [value, value],
          },
        });
        const errorPayload = JSON.parse(payloadString);
        expect(errorPayload).toHaveProperty('statusCode', HttpStatus.BAD_REQUEST);
        expect(errorPayload).toHaveProperty('message', [
          'each value in ids must be an integer number',
        ]);
        expect(errorPayload).toHaveProperty('error', 'Bad Request');
      });
    });
  });

  it('should not allow to provide ids that do not exist in the database', async () => {
    const { payload: payloadString } = await app.inject({
      method: 'PUT',
      url: `change-events/complete`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
      payload: {
        ids: [567, 130],
      },
    });
    const errorPayload = JSON.parse(payloadString);
    expect(errorPayload).toHaveProperty('statusCode', HttpStatus.BAD_REQUEST);
    expect(errorPayload).toHaveProperty('message', 'Events for ids [567,130] are not found');
    expect(errorPayload).toHaveProperty('error', 'Bad Request');
  });

  it(`should validly complete events`, async (done) => {
    const { payload: getPayloadString1 } = await app.inject({
      method: 'GET',
      url: `change-events`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
    });

    const getPayload1: any = JSON.parse(getPayloadString1);
    expect(getPayload1.result).toHaveLength(4);
    expect(getPayload1.result[0]).toHaveProperty('isProcessed', false);
    expect(getPayload1.result[1]).toHaveProperty('isProcessed', false);
    expect(getPayload1.result[2]).toHaveProperty('isProcessed', false);
    expect(getPayload1.result[3]).toHaveProperty('isProcessed', false);

    completedIds = getPayload1.result.slice(0, 2).map((event) => event.id);

    const { payload: payloadString } = await app.inject({
      method: 'PUT',
      url: `change-events/complete`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
      payload: {
        ids: completedIds,
      },
    });

    const payload: any = JSON.parse(payloadString);
    expect(payload).toHaveProperty('result', SUCCESS);

    const { payload: getPayloadString2 } = await app.inject({
      method: 'GET',
      url: `change-events`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
    });

    const getPayload2: any = JSON.parse(getPayloadString2);

    expect(getPayload2.result).toHaveLength(2);
    expect(getPayload2.result[0]).toHaveProperty('isProcessed', false);
    expect(getPayload2.result[1]).toHaveProperty('isProcessed', false);

    getPayload2.result.forEach((e) => expect(completedIds.includes(e.id)).toBeFalsy());

    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
