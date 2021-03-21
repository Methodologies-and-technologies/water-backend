import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe('users reads test', () => {
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
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

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

    registratedUser = JSON.parse(userPayload);
    token = registratedUser.accessToken;

    expect(JSON.parse(registerPayload)).toEqual({ result: SUCCESS });
    expect(JSON.parse(loginPayload)).toEqual({ result: SUCCESS });
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
        email: anotherUser.email,
        phoneNumber: anotherUser.phoneNumber,
        fullName: anotherUser.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: anotherUser.phoneNumber,
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: anotherUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const user = JSON.parse(userPayload);
    anotherToken = user.accessToken;
  });

  // *****************************************************************************************************************
  // GET /users
  // *****************************************************************************************************************

  it.skip(`/GET test pagination result`, async (done) => {
    const newUser = {
      email: 't1@gmail1111.com',
      phoneNumber: '+38000000023',
      fullName: 'test full',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        fullName: newUser.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: newUser.phoneNumber,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { payload: usersPayload } = await app.inject({
      method: 'GET',
      url: 'users',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(usersPayload);
    expect(result.length).toEqual(3);
    expect(total).toEqual(3);
    const [firstRecord, secondRecord] = result;
    expect(firstRecord).toHaveProperty('email');
    expect(firstRecord).toHaveProperty('phoneNumber');
    expect(firstRecord).toHaveProperty('fullName');

    expect(secondRecord).toHaveProperty('email');
    expect(secondRecord).toHaveProperty('phoneNumber');
    expect(secondRecord).toHaveProperty('fullName');
    done();
  });

  // *****************************************************************************************************************
  // GET /users
  // *****************************************************************************************************************

  it.skip(`/GET test search result`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users?fullName=${verifiedUser.fullName} + name`,
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { email, phoneNumber, fullName } = JSON.parse(usersSearchPayload).shift();

    expect(email).toEqual(verifiedUser.email);
    expect(phoneNumber).toEqual(verifiedUser.phoneNumber);
    expect(fullName).toEqual(verifiedUser.fullName);
    expect(JSON.parse(usersSearchPayload).length).toEqual(1);
    done();
  });

  it(`/GET test search result: failed(invalid jwt token)`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users?fullName=${verifiedUser.fullName} + name`,
      headers: {
        authorization: 'Bearer ' + token + 'token',
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
    done();
  });

  it(`/GET test search result: SUCCESS - data is returned by search`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users?fullName=${verifiedUser.fullName}&phoneNumber=${verifiedUser.phoneNumber}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { email, phoneNumber, fullName } = JSON.parse(usersSearchPayload).result.shift();

    expect(email).toEqual(verifiedUser.email);
    expect(phoneNumber).toEqual(verifiedUser.phoneNumber);
    expect(fullName).toEqual(verifiedUser.fullName);
    expect(JSON.parse(usersSearchPayload).total).toEqual(1);
    done();
  });

  // *****************************************************************************************************************
  // GET /users/id
  // *****************************************************************************************************************

  it(`/GET test search result by id`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/${registratedUser.id}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { email, fullName, phoneNumber } = JSON.parse(usersSearchPayload);
    expect(verifiedUser.email).toEqual(email);
    expect(verifiedUser.phoneNumber).toEqual(phoneNumber);
    expect(verifiedUser.fullName).toEqual(fullName);
    done();
  });

  it(`/GET test search result by id: failed(invalid id type)`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/a`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      statusCode: 406,
      message: 'Validation failed (numeric string is expected)',
      error: 'Not Acceptable',
    });
    done();
  });

  it(`/GET test search result by id: no such user`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/${registratedUser.id + 11}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      message: 'USER_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  it(`/GET test search result by id: failed(invalid jwt token)`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/${registratedUser.id + 1}`,
      headers: {
        authorization: 'Bearer ',
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
    done();
  });

  // *****************************************************************************************************************
  // GET /users/current
  // *****************************************************************************************************************

  it(`/GET test search result by id`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/current`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { email, fullName, phoneNumber } = JSON.parse(usersSearchPayload);
    expect(verifiedUser.email).toEqual(email);
    expect(verifiedUser.phoneNumber).toEqual(phoneNumber);
    expect(verifiedUser.fullName).toEqual(fullName);
    done();
  });

  it(`/GET test search result by id: failed(invalid jwt token)`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/current`,
      headers: {
        authorization: 'Bearer ',
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
    done();
  });

  it(`/GET test search result by id: failed(invalid jwt token)`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'GET',
      url: `users/current`,
      headers: {
        authorization: 'Bearer ' + token.slice(0, -1) + 'q',
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
