import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { testImports } from 'src/common/helpers/test-imports.helpers';
import { ConfigService } from 'src/config';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { v4 as uuid } from 'uuid';

describe('product writes test', () => {
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
  let firstProductId: number;
  let firstProduct: ProductPayload;
  let testFileForProducts: FilePayload;
  let anotherTestFileForProducts: FilePayload;
  let secondFile: FileEntity;
  let forUpdateFile: FileEntity;
  let firstFile: FileEntity;
  let lastUpdateFile: FileEntity;
  let secondFileId: string;
  let firstFileId: string;
  let forUpdateFileId: string;
  let lastUpdateFileId: string;

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
    lastUpdateFile = await filesService.createOne(anotherTestFileForProducts);

    firstFileId = firstFile.id;
    secondFileId = secondFile.id;
    forUpdateFileId = forUpdateFile.id;
    lastUpdateFileId = lastUpdateFile.id;
  });

  // *****************************************************************************************************************
  // POST /api/products
  // *****************************************************************************************************************

  it(`/POST products, test get method, entity is found`, async () => {
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

  it(`/POST products, file was not found: (no such imageId)`, async () => {
    const { payload: productsPayload } = await app.inject({
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
        imageId: uuid(),
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    expect(JSON.parse(productsPayload)).toEqual({
      message: 'FILE_NOT_FOUND',
      property: 'imageId',
    });
  });

  // *****************************************************************************************************************
  // PUT /api/products/{id}
  // *****************************************************************************************************************

  it(`/PUT products, entity was not found`, async () => {
    const { payload: productsPayload } = await app.inject({
      method: 'PUT',
      url: `/products/${firstProductId + 12}`,
      payload: {
        capacity: firstProduct.capacity,
        packCapacity: firstProduct.packCapacity,
        imageId: lastUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(productsPayload)).toEqual({
      message: 'PRODUCT_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/PUT products, file was not found`, async () => {
    const { payload: productsPayload } = await app.inject({
      method: 'PUT',
      url: `/products/${firstProductId}`,
      payload: {
        imageId: uuid(),
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(productsPayload)).toEqual({
      message: 'FILE_NOT_FOUND',
      property: 'imageId',
    });
  });

  it(`/PUT products, invalid product id passed`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'PUT',
      url: `/products/q`,
      payload: {
        question: 'question:',
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(questionPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT products, test get method, put -> get`, async () => {
    const newProductInfo = {
      type: 'hello, world',
      title: 'new title to test put',
    };

    const { payload: updatedQuestion } = await app.inject({
      method: 'PUT',
      url: `/products/${firstProductId}`,
      payload: {
        type: newProductInfo.type,
        title: newProductInfo.title,
        imageId: forUpdateFileId,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { type, title, imageUrl } = JSON.parse(updatedQuestion);

    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/products/${firstProductId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const updatedProduct = JSON.parse(questionPayload);

    expect(type).toEqual(updatedProduct.type);
    expect(title).toEqual(updatedProduct.title);
    expect(imageUrl).toEqual(String(configService.get('PATH_TO_DOWNLOAD')) + forUpdateFileId);
  });

  // *****************************************************************************************************************
  // DELETE /api/products/{id}
  // *****************************************************************************************************************

  it(`/DELETE products`, async () => {
    const { payload: productsPayload } = await app.inject({
      method: 'DELETE',
      url: '/products/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(productsPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it.skip(`/DELETE products, delete -> get`, async () => {
    await filesService.deleteOne({ id: firstFile.id });
    await filesService.deleteOne({ id: secondFile.id });
    await filesService.deleteOne({ id: forUpdateFile.id });
    await filesService.deleteOne({ id: lastUpdateFile.id });

    await app.inject({
      method: 'DELETE',
      url: `/products/${firstProductId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/products/${firstProductId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'PRODUCT_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/DELETE products, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/products/${firstProductId + 34}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'PRODUCT_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
