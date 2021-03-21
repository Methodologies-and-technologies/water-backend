import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe('service rating reads test', () => {
  let app: NestFastifyApplication;

  interface UserData {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }
  let verifiedUser: UserData;
  let anotherUser: UserData;
  let token: string;
  let anotherToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    verifiedUser = {
      email: 'nfe123@gmail1111.com',
      phoneNumber: '+380990373954',
      fullName: 'nfe-ncs123',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: verifiedUser.email,
        phoneNumber: verifiedUser.phoneNumber,
        fullName: verifiedUser.fullName,
      },
    });

    await app.inject({
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

    const registratedUser = JSON.parse(userPayload);
    token = registratedUser.accessToken;
  });

  beforeAll(async () => {
    anotherUser = {
      email: 'nse113@gmail1111.com',
      phoneNumber: '+380992373914',
      fullName: 'nfen+cs123',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: verifiedUser.email,
        phoneNumber: verifiedUser.phoneNumber,
        fullName: verifiedUser.fullName,
      },
    });

    await app.inject({
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

    const user = JSON.parse(userPayload);
    anotherToken = user.accessToken;

    const rating = 5;
    const anotherRating = 3;

    const { payload: ratingPayloadFirst } = await app.inject({
      method: 'POST',
      url: '/users/estimate-application',
      payload: {
        rating: rating,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(ratingPayloadFirst)).toEqual({
      result: SUCCESS,
    });

    const { payload: ratingPayloadSecond } = await app.inject({
      method: 'POST',
      url: '/users/estimate-application',
      payload: {
        rating: anotherRating,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(ratingPayloadSecond)).toEqual({
      result: SUCCESS,
    });
  });

  // *****************************************************************************************************************
  // GET /service-rating
  // *****************************************************************************************************************

  it(`/GET service rating`, async () => {
    const { payload: ratingPayload } = await app.inject({
      method: 'GET',
      url: '/service-rating',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(ratingPayload);
    expect(total).toEqual(2);
    expect(result).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
