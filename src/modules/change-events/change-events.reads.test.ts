import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { SapApiService } from '../core/sap-api.service';
import { HttpStatus } from '@nestjs/common';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe.skip('change-events reads test', () => {
  let app: NestFastifyApplication;

  let userToken1: string;
  let userToken2: string;

  let sapToken: string;

  let completedIds: number[] = [];

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

    apiService.post = failedPost;
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
  // GET /change-events/{id}
  // *****************************************************************************************************************

  beforeAll(async (done) => {
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

    done();
  });

  describe('Validation', () => {
    [undefined, null, 'hello'].forEach((value) => {
      it(`should not allow to provide invalid value '${value}' for isProcessed`, async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: `change-events?isProcessed=${value}`,
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const errorPayload = JSON.parse(payloadString);
        expect(errorPayload).toHaveProperty('statusCode', HttpStatus.BAD_REQUEST);
        expect(errorPayload).toHaveProperty('message', ['isProcessed must be a boolean value']);
        expect(errorPayload).toHaveProperty('error', 'Bad Request');
      });
    });
  });

  it('should not allow to get events without sap token', async () => {
    const { payload: getPayloadString } = await app.inject({
      method: 'GET',
      url: `change-events?isProcessed=true`,
      headers: {
        authorization: 'Bearer gfdgfgf',
      },
    });

    const getPayload: any = JSON.parse(getPayloadString);
    expect(getPayload).toHaveProperty('statusCode', HttpStatus.UNAUTHORIZED);
    expect(getPayload).toHaveProperty('message', 'Unauthorized');
  });

  it('should filter by the isProcessed', async () => {
    const { payload: getPayloadString } = await app.inject({
      method: 'GET',
      url: `change-events?isProcessed=true`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
    });

    const getPayload: any = JSON.parse(getPayloadString);
    expect(getPayload.result).toHaveLength(2);
    expect(getPayload.result[0]).toHaveProperty('isProcessed', true);
    expect(getPayload.result[1]).toHaveProperty('isProcessed', true);

    getPayload.result.forEach((e) => expect(completedIds.includes(e.id)).toBeTruthy());
  });

  it('should return all unprocessed events if filter is not provided', async () => {
    const { payload: getPayloadString } = await app.inject({
      method: 'GET',
      url: `change-events`,
      headers: {
        authorization: 'Bearer ' + sapToken,
      },
    });

    const getPayload: any = JSON.parse(getPayloadString);

    expect(getPayload.result).toHaveLength(2);
    expect(getPayload.result[0]).toHaveProperty('isProcessed', false);
    expect(getPayload.result[1]).toHaveProperty('isProcessed', false);
    expect(getPayload.result[0].createdAt < getPayload.result[1].createdAt).toBeTruthy();

    getPayload.result.forEach((e) => expect(completedIds.includes(e.id)).toBeFalsy());
  });

  afterAll(async () => {
    await app.close();
  });
});
