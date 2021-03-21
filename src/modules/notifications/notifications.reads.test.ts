import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe('notifications reads test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface NotificationPayload {
    readonly name: string;
    readonly content: string;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;
  let firstNotificationId: string;
  let firstNotification: NotificationPayload;
  let userId: string;

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
    userId = user.id;
  });

  beforeAll(async () => {
    const notification = {
      name: 'test name',
      content: 'test content',
    };

    firstNotification = {
      name: notification.name,
      content: notification.content,
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/notifications',
      payload: {
        name: notification.name,
        content: notification.content,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstNotificationId = JSON.parse(payload).id;

    await app.inject({
      method: 'POST',
      url: '/notifications',
      payload: {
        name: notification.name.toUpperCase(),
        content: notification.content.toUpperCase(),
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });
  });

  // *****************************************************************************************************************
  // GET /api/notifications
  // *****************************************************************************************************************

  it(`/GET notifications`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: '/notifications',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(notificationPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  it(`/GET notifications, testing pagination result: (result and total)`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: '/notifications',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(notificationPayload);
    expect(result).toBeDefined();
    expect(total).toEqual(2);
  });

  // *****************************************************************************************************************
  // GET /api/notifications/{id}
  // *****************************************************************************************************************

  it(`/GET notification, failed case`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: '/notifications/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(notificationPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET notifications, test get method, entity is not found`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/notifications/${firstNotificationId + 4}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(notificationPayload)).toEqual({
      message: 'NOTIFICATION_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/GET notifications, test get method, entity is found by query: (userId)`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/notifications?userId=${userId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      result: [firstRecord, secondRecord],
    } = JSON.parse(notificationPayload);

    expect(userId).toEqual(firstRecord.userId);
    expect(userId).toEqual(secondRecord.userId);
  });

  it(`/GET notifications, test get method, entity is not found by query: (userId is not valid)`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/notifications?userId=invalid userId`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(notificationPayload)).toEqual({
      statusCode: 400,
      message: ['userId must be an integer number'],
      error: 'Bad Request',
    });
  });

  it(`/GET notifications, test get method, entity is found`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/notifications/${firstNotificationId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { name, content } = JSON.parse(notificationPayload);

    expect(name).toEqual(firstNotification.name);
    expect(content).toEqual(firstNotification.content);
  });

  afterAll(async () => {
    await app.close();
  });
});
