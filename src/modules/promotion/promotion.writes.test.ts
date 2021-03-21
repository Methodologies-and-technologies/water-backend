import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { ConfigService } from 'src/config/config.service';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { v4 as uuid } from 'uuid';

describe('promotion product writes test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;
  let configService: ConfigService;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface PromotionPayload {
    readonly paidPacks: number;
    readonly price: number;
    readonly freePacks: number;
    readonly imageId: string;
  }

  interface FilePayload {
    readonly title: string;
    readonly filename: string;
    readonly fileSize: number;
    readonly mimetype: string;
    readonly encoding: string;
    readonly extname: string;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;
  let firstPromotionId: number;
  let firstPromotion: PromotionPayload;
  let testFileForPromotions: FilePayload;
  let anotherTestFileForPromotions: FilePayload;
  let secondFile: FileEntity;
  let forUpdateFile: FileEntity;
  let firstFile: FileEntity;
  let lastUpdateFile: FileEntity;
  let secondFileId: string;
  let firstFileId: string;
  let forUpdateFileId: string;
  let lastUpdateFileId: string;

  const TEST_VALUE = 4;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    filesService = module.get<FilesService>(FilesService);
    configService = module.get<ConfigService>(ConfigService);

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
  });

  beforeAll(async () => {
    testFileForPromotions = {
      title: 'deploy',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    anotherTestFileForPromotions = {
      title: 'deploy123',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    firstFile = await filesService.createOne(testFileForPromotions);
    secondFile = await filesService.createOne(anotherTestFileForPromotions);
    forUpdateFile = await filesService.createOne(anotherTestFileForPromotions);
    lastUpdateFile = await filesService.createOne(anotherTestFileForPromotions);

    firstFileId = firstFile.id;
    secondFileId = secondFile.id;
    forUpdateFileId = forUpdateFile.id;
    lastUpdateFileId = lastUpdateFile.id;
  });

  // *****************************************************************************************************************
  // POST /api/promotions
  // *****************************************************************************************************************

  it(`/POST promotions, test get method, entity is found`, async () => {
    firstPromotion = {
      paidPacks: 3,
      price: 20,
      freePacks: 12,
      imageId: firstFileId,
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/promotions',
      payload: {
        paidPacks: firstPromotion.paidPacks,
        price: firstPromotion.price,
        freePacks: firstPromotion.freePacks,
        imageId: firstPromotion.imageId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstPromotionId = JSON.parse(payload).id;

    await app.inject({
      method: 'POST',
      url: '/promotions',
      payload: {
        paidPacks: firstPromotion.paidPacks + TEST_VALUE,
        price: firstPromotion.price + TEST_VALUE,
        freePacks: firstPromotion.freePacks + TEST_VALUE,
        imageId: secondFileId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { payload: promotionPayload } = await app.inject({
      method: 'GET',
      url: `/promotions/${firstPromotionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { paidPacks, price, freePacks, imageUrl } = JSON.parse(promotionPayload);

    expect(parseInt(paidPacks)).toEqual(firstPromotion.paidPacks);
    expect(parseInt(price)).toEqual(firstPromotion.price);
    expect(parseInt(freePacks)).toEqual(firstPromotion.freePacks);
    expect(imageUrl).toEqual(String(configService.get('PATH_TO_DOWNLOAD')) + firstFileId);
  });

  it(`/POST promotions, file was not found: (no such imageId)`, async () => {
    const { payload } = await app.inject({
      method: 'POST',
      url: '/promotions',
      payload: {
        paidPacks: firstPromotion.paidPacks,
        price: firstPromotion.price,
        freePacks: firstPromotion.freePacks,
        imageId: uuid(),
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    console.log(JSON.parse(payload));
    expect(JSON.parse(payload)).toEqual({
      message: 'FILE_NOT_FOUND',
      property: 'imageId',
    });
  });

  // *****************************************************************************************************************
  // PUT /api/promotions/{id}
  // *****************************************************************************************************************

  it(`/PUT promotions, entity was not found`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/promotions/${firstPromotionId + 12}`,
      payload: {
        price: firstPromotion.price,
        freePacks: firstPromotion.freePacks,
        imageId: lastUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'PROMOTION_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/PUT promotions, file was not found`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/promotions/${firstPromotionId}`,
      payload: {
        imageId: uuid(),
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'FILE_NOT_FOUND',
      property: 'imageId',
    });
  });

  it(`/PUT promotions, invalid product id passed`, async () => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/promotions/q`,
      payload: {
        question: 'question:',
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(payload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT promotions, test get method, put -> get`, async () => {
    const { payload: updated } = await app.inject({
      method: 'PUT',
      url: `/promotions/${firstPromotionId}`,
      payload: {
        imageId: forUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { imageUrl } = JSON.parse(updated);

    await app.inject({
      method: 'GET',
      url: `/promotions/${firstPromotionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(imageUrl).toEqual(String(configService.get('PATH_TO_DOWNLOAD')) + forUpdateFileId);
  });

  // *****************************************************************************************************************
  // DELETE /api/promotions/{id}
  // *****************************************************************************************************************

  it(`/DELETE promotions`, async () => {
    const { payload: productsPayload } = await app.inject({
      method: 'DELETE',
      url: '/promotions/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(productsPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/DELETE promotions, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/promotions/${firstPromotionId + 34}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'PROMOTION_NOT_FOUND',
      property: 'id',
    });
  });

  it.skip(`/DELETE promotions, delete -> get`, async () => {
    await filesService.deleteOne({ id: firstFile.id });
    await filesService.deleteOne({ id: secondFile.id });
    await filesService.deleteOne({ id: forUpdateFile.id });
    await filesService.deleteOne({ id: lastUpdateFile.id });

    await app.inject({
      method: 'DELETE',
      url: `/products/${firstPromotionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/products/${firstPromotionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'PROMOTION_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
