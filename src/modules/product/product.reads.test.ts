import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { testImports } from 'src/common/helpers/test-imports.helpers';
import { ConfigService } from 'src/config';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';

describe('product reads test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;
  let configService: ConfigService;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface ProductPayload {
    readonly type: string;
    readonly title: string;
    readonly capacity: number;
    readonly packCapacity: number;
    readonly pricePerItem: number;
    readonly totalPrice: number;
    readonly about: string;
    readonly minOrder: number;
    readonly maxOrder: number;
    readonly promotions: string;
    readonly freeProducts: number;
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
  let firstProductId: string;
  let firstProduct: ProductPayload;
  let testFileForProducts: FilePayload;
  let anotherTestFileForProducts: FilePayload;
  let secondFile: FileEntity;
  let forUpdateFile: FileEntity;
  let firstFile: FileEntity;
  let secondFileId: string;
  let firstFileId: string;
  let forUpdateFileId: string;

  const FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION = 10;

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
    testFileForProducts = {
      title: 'deploy',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    anotherTestFileForProducts = {
      title: 'deploy123',
      filename: '3d27a5b1aa47b47d534273e13a4e9e06',
      fileSize: 1116886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    firstFile = await filesService.createOne(testFileForProducts);
    secondFile = await filesService.createOne(anotherTestFileForProducts);
    forUpdateFile = await filesService.createOne(anotherTestFileForProducts);

    firstFileId = firstFile.id;
    secondFileId = secondFile.id;
    forUpdateFileId = forUpdateFile.id;
  });

  beforeAll(async () => {
    firstProduct = {
      type: 'first special type',
      title: 'title',
      capacity: 7,
      packCapacity: 8,
      pricePerItem: 6,
      totalPrice: 5,
      about: 'about',
      minOrder: 5,
      maxOrder: 6,
      promotions: 'promotions',
      freeProducts: 6,
      imageId: firstFileId,
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/products',
      payload: {
        type: firstProduct.type,
        title: firstProduct.title,
        capacity: firstProduct.capacity,
        packCapacity: firstProduct.packCapacity,
        pricePerItem: firstProduct.pricePerItem,
        totalPrice: firstProduct.totalPrice,
        about: firstProduct.about,
        minOrder: firstProduct.minOrder,
        maxOrder: firstProduct.maxOrder,
        promotions: firstProduct.promotions,
        freeProducts: firstProduct.freeProducts,
        imageId: firstProduct.imageId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstProductId = JSON.parse(payload).id;

    await app.inject({
      method: 'POST',
      url: '/products',
      payload: {
        type: firstProduct.type.toUpperCase(),
        title: firstProduct.title.toUpperCase(),
        capacity: firstProduct.capacity,
        packCapacity: firstProduct.packCapacity,
        pricePerItem: firstProduct.pricePerItem,
        totalPrice: firstProduct.totalPrice,
        about: firstProduct.about,
        minOrder: firstProduct.minOrder,
        maxOrder: firstProduct.maxOrder,
        promotions: firstProduct.promotions,
        freeProducts: firstProduct.freeProducts,
        imageId: secondFileId,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });
  });

  // *****************************************************************************************************************
  // GET /api/products
  // *****************************************************************************************************************

  it.skip(`/GET products, testing pagination result: (result and total)`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/products',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(productPayload);
    expect(result).toBeDefined();
    expect(total).toEqual(12);
  });

  // *****************************************************************************************************************
  // GET /api/products/{id}
  // *****************************************************************************************************************

  it(`/GET product, failed case`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: '/products/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(productPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET products, test get method, entity is not found`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: `/products/${firstProductId + 14}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(productPayload)).toEqual({
      message: 'PRODUCT_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/GET products, test get method, entity is found by query: (type)`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: `/products?type=${firstProduct.type}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      result: [firstRecord],
    } = JSON.parse(productPayload);

    expect(firstRecord.type).toEqual(firstProduct.type);
    expect(firstRecord.title).toEqual(firstProduct.title);
    expect(firstRecord.imageUrl).toEqual(
      String(configService.get('PATH_TO_DOWNLOAD')) + firstFileId,
    );
    expect(parseInt(firstRecord.capacity)).toEqual(firstProduct.capacity);
    expect(parseInt(firstRecord.packCapacity)).toEqual(firstProduct.packCapacity);
    expect(parseInt(firstRecord.pricePerItem)).toEqual(firstProduct.pricePerItem);
    expect(parseInt(firstRecord.totalPrice)).toEqual(firstProduct.totalPrice);
    expect(firstRecord.about).toEqual(firstProduct.about);
    expect(parseInt(firstRecord.minOrder)).toEqual(firstProduct.minOrder);
    expect(parseInt(firstRecord.maxOrder)).toEqual(firstProduct.maxOrder);
    expect(firstRecord.promotions).toEqual('gelll');
    expect(parseInt(firstRecord.freeProducts)).toEqual(firstProduct.freeProducts);
  });

  it(`/GET products, test get method, entity is not found by query: (no such type for products)`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: `/products?type=test type&title=new title`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(productPayload)).toEqual({
      result: [],
      total: 0,
    });
  });

  it(`/GET products, test get method, entity is found`, async () => {
    const { payload: productPayload } = await app.inject({
      method: 'GET',
      url: `/products/${firstProductId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      type,
      title,
      imageUrl,
      capacity,
      packCapacity,
      pricePerItem,
      totalPrice,
      about,
      minOrder,
      maxOrder,
      promotions,
      freeProducts,
    } = JSON.parse(productPayload);

    expect(type).toEqual(firstProduct.type);
    expect(title).toEqual(firstProduct.title);
    expect(imageUrl).toEqual(String(configService.get('PATH_TO_DOWNLOAD')) + firstFileId);
    expect(parseInt(capacity)).toEqual(firstProduct.capacity);
    expect(parseInt(packCapacity)).toEqual(firstProduct.packCapacity);
    expect(parseInt(pricePerItem)).toEqual(firstProduct.pricePerItem);
    expect(parseInt(totalPrice)).toEqual(firstProduct.totalPrice);
    expect(about).toEqual(firstProduct.about);
    expect(parseInt(minOrder)).toEqual(firstProduct.minOrder);
    expect(parseInt(maxOrder)).toEqual(firstProduct.maxOrder);
    expect(promotions).toEqual('gelll');
    expect(parseInt(freeProducts)).toEqual(firstProduct.freeProducts);
  });

  afterAll(async () => {
    await app.close();
  });
});
