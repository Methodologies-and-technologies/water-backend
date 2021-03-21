import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { ALL_NOTIFICATIONS_SENT } from './notification.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe('notifications writes test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
    readonly token?: string;
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
    userId = user.id;
    anotherToken = user.accessToken;
  });

  // *****************************************************************************************************************
  // POST /api/notifications
  // *****************************************************************************************************************

  it(`/POST notifications`, async () => {
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

    const { payload: notificationPayload } = await app.inject({
      method: 'POST',
      url: '/notifications',
      payload: {
        name: 'notification 2',
        content: 100000000,
      },
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(notificationPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  it(`/POST notifications, test get method, entity is found`, async () => {
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

  // *****************************************************************************************************************
  // PUT /api/notifications/{id}
  // *****************************************************************************************************************

  it(`/PUT notifications`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'PUT',
      url: '/notifications/a',
      payload: {
        name: firstNotification.name.toUpperCase(),
        content: firstNotification.content.toUpperCase(),
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(notificationPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT notifications, test get method, put -> get`, async () => {
    const notification = {
      name: 'test name: (updated)',
      content: 'test content: (updated)',
    };

    const { payload: updatedNotifications } = await app.inject({
      method: 'PUT',
      url: `/notifications/${firstNotificationId}`,
      payload: {
        name: notification.name,
        content: notification.content,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { name: updatedName, content: updatedContent } = JSON.parse(updatedNotifications);

    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/notifications/${firstNotificationId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { name, content } = JSON.parse(notificationPayload);

    expect(content).toEqual(updatedContent);
    expect(name).toEqual(updatedName);
  });

  it(`/PUT notifications, test get method, entity is not found for update`, async () => {
    const notification = {
      name: 'test name: (updated)',
      content: 'test content: (updated)',
    };

    const { payload: notificationPayload } = await app.inject({
      method: 'PUT',
      url: `/notifications/${firstNotificationId + 4}`,
      payload: {
        name: notification.name,
        content: notification.content,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(notificationPayload)).toEqual({
      message: 'NOTIFICATION_NOT_FOUND',
      property: 'id',
    });
  });

  // *****************************************************************************************************************
  // POST /api/notifications/send
  // *****************************************************************************************************************

  it(`/POST notifications, test send route, failure case to ensure that if sending sms fails`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'POST',
      url: `/notifications/send`,
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(notificationPayload)).toEqual({
      result: ALL_NOTIFICATIONS_SENT,
    });
  });

  // *****************************************************************************************************************
  // DELETE /api/notifications/{id}
  // *****************************************************************************************************************

  it(`/DELETE notifications`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'DELETE',
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

  it(`/DELETE notifications, delete -> get`, async () => {
    await app.inject({
      method: 'DELETE',
      url: `/notifications/${firstNotificationId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/notifications/${firstNotificationId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'NOTIFICATION_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/DELETE notifications, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/notifications/${firstNotificationId + 9}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'NOTIFICATION_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
