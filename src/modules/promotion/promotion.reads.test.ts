import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { DatabaseModule } from 'src/database/database.module';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { ProductPromotionEntity } from '../product/product-promotion.entity';
import { PromotionController } from './promotion.controller';
import { PromotionEntity } from './promotion.entity';
import { PromotionService } from './promotion.service';
import { testImports } from '../../common/helpers/test-imports.helpers';

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

  beforeAll(async () => {
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
  });

  // *****************************************************************************************************************
  // GET /api/promotions
  // *****************************************************************************************************************

  it(`/GET promotions, testing pagination result: (result and total)`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/promotions',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(productPayload);
    expect(result).toBeDefined();
    expect(total).toEqual(4);
  });

  // *****************************************************************************************************************
  // GET /api/promotions/{id}
  // *****************************************************************************************************************

  it(`/GET promotions, failed case`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/promotions/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(productPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET promotions, test get method, entity is not found`, async () => {
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

  it(`/GET promotions, test get method, entity is not found`, async () => {
    const { payload } = await app.inject({
      method: 'GET',
      url: `/promotions/${firstPromotionId + 14}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'PROMOTION_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
