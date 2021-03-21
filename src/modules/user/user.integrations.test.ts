import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { SapApiResponse, SapApiService } from '../core/sap-api.service';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { HttpStatus } from '@nestjs/common';

describe('users integrations test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    readonly id?: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
    readonly accessToken?: string;
  }

  let verifiedUser: UserPayload;
  let registratedUser: UserPayload;
  let sapToken: string;
  let userToken: string;

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

  // *****************************************************************************************************************
  // GET /users
  // *****************************************************************************************************************

  describe('Side-effects', () => {
    describe('Creation of the user', () => {
      describe('Request to SAP is successful', () => {
        beforeAll(async () => {
          verifiedUser = {
            email: 't1estf@gmail1111.com',
            phoneNumber: '+38000000000',
            fullName: 'test fullname',
          };

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

        it('should generate an event of creation', async (done) => {
          const { payload: payloadString } = await app.inject({
            method: 'GET',
            url: '/change-events?isProcessed=true',
            headers: {
              authorization: 'Bearer ' + sapToken,
            },
          });
          const payload = JSON.parse(payloadString);
          console.log(payload);
          expect(payload).toHaveProperty('result');
          expect(payload).toHaveProperty('total', 1);
          expect(payload.result[0]).toHaveProperty('id');
          expect(payload.result[0]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[0]).toHaveProperty('operation', 'CREATE');
          expect(payload.result[0]).toHaveProperty('isProcessed', true);
          expect(payload.result[0]).toHaveProperty('createdAt');
          expect(payload.result[0]).toHaveProperty('updatedAt');
          done();
        });
      });

      describe('Request to SAP is failed', () => {
        beforeAll(async () => {
          verifiedUser = {
            email: 'anotherTestf@gmail1111.com',
            phoneNumber: '+38050034000',
            fullName: 'an test fullname',
          };

          apiService.post = failedPost;

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
          expect(payload).toHaveProperty('total', 1);
          expect(payload.result[0]).toHaveProperty('id');
          expect(payload.result[0]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[0]).toHaveProperty('operation', 'CREATE');
          expect(payload.result[0]).toHaveProperty('isProcessed', true);
          expect(payload.result[0]).toHaveProperty('createdAt');
          expect(payload.result[0]).toHaveProperty('updatedAt');
          done();
        });
      });
    });

    describe('Updating of the user by jwt token', () => {
      describe('Request to SAP is successful', () => {
        beforeAll(async () => {
          apiService.post = successfulPost;

          await app.inject({
            method: 'PUT',
            url: '/users/current',
            headers: {
              authorization: 'Bearer ' + userToken,
            },
            payload: {
              fullName: 'test fullname (updated)',
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
          expect(payload).toHaveProperty('total');
          expect(payload.result[1]).toHaveProperty('id');
          expect(payload.result[1]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[1]).toHaveProperty('operation', 'UPDATE');
          expect(payload.result[1]).toHaveProperty('isProcessed', true);
          expect(payload.result[1]).toHaveProperty('createdAt');
          expect(payload.result[1]).toHaveProperty('updatedAt');
        });
      });

      describe('Request to SAP is failed', () => {
        beforeAll(async () => {
          apiService.post = failedPost;

          await app.inject({
            method: 'PUT',
            url: '/users/current',
            headers: {
              authorization: 'Bearer ' + userToken,
            },
            payload: {
              fullName: 'test fullname (updated)',
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
          expect(payload.result[1]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[1]).toHaveProperty('operation', 'UPDATE');
          expect(payload.result[1]).toHaveProperty('isProcessed', false);
          expect(payload.result[1]).toHaveProperty('createdAt');
          expect(payload.result[1]).toHaveProperty('updatedAt');
        });
      });
    });

    describe('Updating of the user by id', () => {
      let userId: number;

      beforeAll(async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/users/current',
          headers: {
            authorization: 'Bearer ' + userToken,
          },
        });
        const payload = JSON.parse(payloadString);
        userId = payload.id;
      });

      describe('Request to SAP is successful', () => {
        beforeAll(async () => {
          apiService.post = successfulPost;
          await app.inject({
            method: 'PUT',
            url: `/users/${userId}`,
            headers: {
              authorization: 'Bearer ' + userToken,
            },
            payload: {
              email: 'test123@gmail.com',
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
          expect(payload.result[2]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[2]).toHaveProperty('operation', 'UPDATE');
          expect(payload.result[2]).toHaveProperty('isProcessed', true);
          expect(payload.result[2]).toHaveProperty('createdAt');
          expect(payload.result[2]).toHaveProperty('updatedAt');
        });
      });

      describe('Request to SAP is failed', () => {
        beforeAll(async () => {
          apiService.post = failedPost;

          await app.inject({
            method: 'PUT',
            url: `/users/${userId}`,
            headers: {
              authorization: 'Bearer ' + userToken,
            },
            payload: {
              email: 'anothertest123@gmail.com',
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
          expect(payload).toHaveProperty('total', 3);
          expect(payload.result[2]).toHaveProperty('id');
          expect(payload.result[2]).toHaveProperty('type', 'CUSTOMER');
          expect(payload.result[2]).toHaveProperty('operation', 'UPDATE');
          expect(payload.result[2]).toHaveProperty('isProcessed', false);
          expect(payload.result[2]).toHaveProperty('createdAt');
          expect(payload.result[2]).toHaveProperty('updatedAt');
        });
      });

      describe('Request to update from SAP', () => {
        beforeAll(async () => {
          apiService.post = failedPost;

          await app.inject({
            method: 'PUT',
            url: `/users/${userId}`,
            headers: {
              authorization: 'Bearer ' + sapToken,
            },
            payload: {
              email: 'anothertest@gmail.com',
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
  });

  describe('Operations from SAP', () => {
    const sapId = 'CD14570';

    describe('Create', () => {
      it('should create user by SAP request', async () => {
        const sapPayload = {
          SapId: sapId,
          Email: 'some-email@gmail.com',
          Phone: '+38000000',
          CustomerName: 'Some gy',
        };
        const { payload: registerPayloadString } = await app.inject({
          method: 'POST',
          url: `/sap/users`,
          payload: sapPayload,
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(registerPayloadString);
        expect(payload).toHaveProperty('SapId', sapId);
        expect(payload).toHaveProperty('Email', sapPayload.Email);
        expect(payload).toHaveProperty('Phone', sapPayload.Phone);
        expect(payload).toHaveProperty('CustomerName', sapPayload.CustomerName);

        console.log(payload);
      });
    });

    describe('Update', () => {
      it('should update user by SAP request', async () => {
        const sapUpdatePayload = {
          Email: 'some-email223@gmail.com',
          Phone: '+3800000000',
          CustomerName: 'Some gydsfdf',
        };
        const { payload: registerPayloadString } = await app.inject({
          method: 'PUT',
          url: `/sap/users/${sapId}`,
          payload: sapUpdatePayload,
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(registerPayloadString);
        expect(payload).toHaveProperty('SapId', sapId);
        expect(payload).toHaveProperty('Email', sapUpdatePayload.Email);
        expect(payload).toHaveProperty('Phone', sapUpdatePayload.Phone);
        expect(payload).toHaveProperty('CustomerName', sapUpdatePayload.CustomerName);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
