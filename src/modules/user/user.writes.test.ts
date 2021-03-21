import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'src/config';
import { DatabaseModule } from 'src/database';
import { AuthService } from '../auth';
import { SUCCESS, TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { DeliveryAreaModule, DeliveryAreaService } from '../delivery-area';
import { DeliveryAreaEntity } from '../delivery-area/delivery-area.entity';
import { DraftUserService } from '../draft-user';
import { DraftUserEntity } from '../draft-user/draft-user.entity';
import { FilesService } from '../files/files.service';
import { FilesModule } from '../files/files.module';
import { FileEntity } from '../files/file.entity';
import { ServiceRatingService } from '../service-rating';
import { ServiceRatingEntity } from '../service-rating/service-rating.entity';
import { UserService } from './services/user.service';
import { UserEntity } from './user.entity';
import { UserModule } from './user.module';

describe.skip('users writes test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;
  let configService: ConfigService;

  interface UserData {
    id?: number;
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface FilePayload {
    readonly title: string;
    readonly filename: string;
    readonly fileSize: number;
    readonly mimetype: string;
    readonly encoding: string;
    readonly extname: string;
  }

  let verifiedUser: UserData;
  let anotherUser: UserData;
  let newUser: UserData;
  let token: string;
  let anotherToken: string;
  let rating: number;
  let secondFile: FileEntity;
  let forUpdateFile: FileEntity;
  let firstFile: FileEntity;
  let lastUpdateFile: FileEntity;
  let testFileForUserAvatar: FilePayload;
  let anotherTestFileForUserAvatar: FilePayload;
  let secondFileId: string;
  let firstFileId: string;
  let forUpdateFileId: string;
  let lastUpdateFileId: string;

  const FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION = 10;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
        ConfigModule,
        DatabaseModule,
        DeliveryAreaModule,
        FilesModule,
        TypeOrmModule.forFeature([
          UserEntity,
          DeliveryAreaEntity,
          DraftUserEntity,
          FileEntity,
          ServiceRatingEntity,
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      providers: [
        UserService,
        AuthService,
        DeliveryAreaService,
        DraftUserService,
        FilesService,
        ServiceRatingService,
        ConfigService,
      ],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
    configService = module.get<ConfigService>(ConfigService);

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    verifiedUser = {
      email: '221estf@gmail1111.com',
      phoneNumber: '+38000000011',
      fullName: 'test name',
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

    const registratedUser = JSON.parse(userPayload);
    token = registratedUser.accessToken;

    expect(JSON.parse(registerPayload)).toEqual({ result: SUCCESS });
    expect(JSON.parse(loginPayload)).toEqual({ result: SUCCESS });
  });

  beforeAll(async () => {
    rating = 5;

    anotherUser = {
      fullName: 'name2',
      phoneNumber: '+381997363957',
      email: 'name@2gmail.com',
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

    const { payload: newUserPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: anotherUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { accessToken: newToken, id: userId } = JSON.parse(newUserPayload);
    anotherToken = newToken;
    anotherUser.id = userId;
  });

  beforeAll(async () => {
    testFileForUserAvatar = {
      title: 'deploy',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    anotherTestFileForUserAvatar = {
      title: 'deploy123',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    firstFile = await filesService.createOne(testFileForUserAvatar);
    secondFile = await filesService.createOne(anotherTestFileForUserAvatar);
    forUpdateFile = await filesService.createOne(anotherTestFileForUserAvatar);
    lastUpdateFile = await filesService.createOne(anotherTestFileForUserAvatar);

    firstFileId = firstFile.id;
    secondFileId = secondFile.id;
    forUpdateFileId = forUpdateFile.id;
    lastUpdateFileId = lastUpdateFile.id;
  });

  // *****************************************************************************************************************
  // PUT /users/id
  // *****************************************************************************************************************

  it(`/PUT update user info`, async (done) => {
    const newUserInfo = {
      id: 1,
      fullName: 'bobil',
      phoneNumber: '+380997363950',
      email: 'test@gmail.com',
    };

    const { payload: beforeUpdateData } = await app.inject({
      method: 'GET',
      url: `users/${newUserInfo.id}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      id: userId,
      email: emailBefore,
      fullName: fullNameBefore,
      phoneNumber: phoneNumberBefore,
    } = JSON.parse(beforeUpdateData);

    const { payload: updatedUserData } = await app.inject({
      method: 'PUT',
      url: `users/${userId}`,
      payload: {
        fullName: newUserInfo.fullName,
        phoneNumber: newUserInfo.phoneNumber,
        email: newUserInfo.email,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { email, fullName, phoneNumber } = JSON.parse(updatedUserData);
    expect(email).toEqual(newUserInfo.email);
    expect(fullName).toEqual(newUserInfo.fullName);
    expect(phoneNumber).toEqual(newUserInfo.phoneNumber);

    expect(email).not.toEqual(emailBefore);
    expect(fullName).not.toEqual(fullNameBefore);
    expect(phoneNumber).not.toEqual(phoneNumberBefore);
    done();
  });

  it(`/PUT update user info, should fail`, async (done) => {
    const newUserInfo = {
      id: 1,
      fullName: 'bobil',
      phoneNumber: '+380997363950',
      email: 'test@gmail.com',
    };

    const { payload: updatedUserData } = await app.inject({
      method: 'PUT',
      url: `users/${newUserInfo.id}`,
      payload: {
        fullName: newUserInfo.fullName,
        phoneNumber: newUserInfo.phoneNumber,
        email: newUserInfo.email,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { message: messageUp, property: propertyUp } = JSON.parse(updatedUserData);
    expect(propertyUp).toEqual('authorization');
    expect(messageUp).toEqual('INVALID_JWT_TOKEN');

    const { payload: beforeUpdateData } = await app.inject({
      method: 'GET',
      url: `users/${newUserInfo.id}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { message: messageAf, property: propertyAf } = JSON.parse(beforeUpdateData);
    expect(propertyAf).toEqual('authorization');
    expect(messageAf).toEqual('INVALID_JWT_TOKEN');
    done();
  });

  it(`/PUT update user info, USER_NOT_FOUND`, async (done) => {
    const newUserInfo = {
      id: 1,
      fullName: 'bobil123',
      phoneNumber: '+380997363912',
      email: 't123t@gmail.com',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUserInfo.email,
        phoneNumber: newUserInfo.phoneNumber,
        fullName: newUserInfo.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
      },
    });

    const { payload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { payload: updatedUserData } = await app.inject({
      method: 'PUT',
      url: `users/${newUserInfo.id + 7}`,
      payload: {
        fullName: newUserInfo.fullName,
        phoneNumber: newUserInfo.phoneNumber,
        email: newUserInfo.email,
      },
      headers: {
        authorization: 'Bearer ' + JSON.parse(payload).accessToken,
      },
    });

    expect(JSON.parse(updatedUserData)).toEqual({
      message: 'USER_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  it(`/PUT update user info, check update`, async (done) => {
    const newUserInfo = {
      fullName: 'userbobil123',
      phoneNumber: '+380991163912',
      email: 'newt123t@gmail.com',
    };

    const anotherUserInfo = {
      fullName: 'user123',
      phoneNumber: '+380991163977',
      email: 'newt456t@gmail.com',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUserInfo.email,
        phoneNumber: newUserInfo.phoneNumber,
        fullName: newUserInfo.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: anotherUserInfo.email,
        phoneNumber: anotherUserInfo.phoneNumber,
        fullName: anotherUserInfo.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: anotherUserInfo.phoneNumber,
      },
    });

    const { payload: firstUser } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { payload: secondUser } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: anotherUserInfo.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const user = JSON.parse(firstUser);
    const anotherUser = JSON.parse(secondUser);

    const { payload: updatedUserData } = await app.inject({
      method: 'PUT',
      url: `users/${user.id}`,
      payload: {
        fullName: newUserInfo.fullName + '123',
        phoneNumber: newUserInfo.phoneNumber,
        email: 'test' + newUserInfo.email,
      },
      headers: {
        authorization: 'Bearer ' + user.accessToken,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/users/${user.id}`,
      headers: {
        authorization: 'Bearer ' + anotherUser.accessToken,
      },
    });

    const { email: emailUp, phoneNumber: phoneNumberUp, fullName: fullNameUp } = JSON.parse(
      updatedUserData,
    );
    const { email, phoneNumber, fullName } = JSON.parse(searchData);

    expect(email).toEqual(emailUp);
    expect(fullName).toEqual(fullNameUp);
    expect(phoneNumber).toEqual(phoneNumberUp);
    done();
  });

  // *****************************************************************************************************************
  // DELETE /api/users/id
  // *****************************************************************************************************************

  it(`/DELETE users, no such user, check - delete, get`, async (done) => {
    const newUserInfo = {
      fullName: 'naming-here',
      phoneNumber: '+381997363332',
      email: 'nameing-here@1gmail.com',
    };

    const newUserInfoSecond = {
      fullName: 'my fullName',
      phoneNumber: '+381923363332',
      email: 'mysecretemail@1gmail.com',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUserInfo.email,
        phoneNumber: newUserInfo.phoneNumber,
        fullName: newUserInfo.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUserInfoSecond.email,
        phoneNumber: newUserInfoSecond.phoneNumber,
        fullName: newUserInfoSecond.fullName,
      },
    });

    const { payload: newUserPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { payload: newUserPayloadSecond } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUserInfoSecond.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { accessToken: newToken, id: userId } = JSON.parse(newUserPayload);
    const { accessToken: anotherToken } = JSON.parse(newUserPayloadSecond);

    await app.inject({
      method: 'DELETE',
      url: `/users/${userId}`,
      headers: {
        authorization: 'Bearer ' + newToken,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/users/${userId}`,
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'USER_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  it(`/DELETE users, invalid id type, invalid jwt token`, async (done) => {
    const { payload: usersSearchPayload } = await app.inject({
      method: 'DELETE',
      url: '/users/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      message: 'INVALID_JWT_TOKEN',
      property: 'authorization',
    });
    done();
  });

  it(`/DELETE users, no such user`, async (done) => {
    const newUserInfo = {
      fullName: 'name1',
      phoneNumber: '+381997363952',
      email: 'name@1gmail.com',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: newUserInfo.email,
        phoneNumber: newUserInfo.phoneNumber,
        fullName: newUserInfo.fullName,
      },
    });

    const { payload: newUserPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: newUserInfo.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const { accessToken: newToken, id: userId } = JSON.parse(newUserPayload);

    const { payload: usersSearchPayload } = await app.inject({
      method: 'DELETE',
      url: `/users/${userId + 1}`,
      headers: {
        authorization: 'Bearer ' + newToken,
      },
    });

    expect(JSON.parse(usersSearchPayload)).toEqual({
      message: 'USER_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  // *****************************************************************************************************************
  // POST /api/users/estimate-application
  // *****************************************************************************************************************

  it(`/POST service-application, set rating: post, get`, async (done) => {
    const { payload: ratingPayload } = await app.inject({
      method: 'POST',
      url: '/users/estimate-application',
      payload: {
        rating: rating,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(ratingPayload)).toEqual({
      result: SUCCESS,
    });

    const { payload: userPayload } = await app.inject({
      method: 'GET',
      url: `/users/${anotherUser.id}`,
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { rating: r } = JSON.parse(userPayload);
    expect(parseInt(r.rating)).toEqual(rating);
    done();
  });

  // *****************************************************************************************************************
  // PUT /api/users/current
  // *****************************************************************************************************************

  it(`/PUT user profile, invalid jwt token`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/users/current`,
      payload: {
        avatarId: lastUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + String(configService.get('PATH_TO_DOWNLOAD')),
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it(`/PUT user profile, file to upload was not found`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/users/current`,
      payload: {
        avatarId: lastUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'FILE_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/PUT user profile, file to upload was not found`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/users/current`,
      payload: {
        avatarId: lastUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { imageUrl } = JSON.parse(payload);

    await app.inject({
      method: 'GET',
      url: `/users/current`,
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(imageUrl).toEqual(String(configService.get('PATH_TO_DOWNLOAD')) + lastUpdateFileId);
  });

  afterAll(async () => {
    await app.close();
  });
});
