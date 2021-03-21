import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { ConfigService } from '../../config/config.service';

describe.skip('order reads test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;
  let configService: ConfigService;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface OrderPayload {
    readonly deliveryAddressId: number;
    readonly deliveryTimeSlotId: number;
    readonly deliveryDate: string;
    readonly comment: string;
    readonly promocode: string;
    readonly paymentMethod: string;
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

  interface CartElementPayload {
    readonly productId: number;
    readonly quantity: number;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;
  let firstOrderId: string;
  let firstDeliveryAddressId: number;
  let firstOrder: OrderPayload;
  let firstCartElement: CartElementPayload;
  let firstCartElementId: string;
  let firstProductId: string;
  let firstProduct: ProductPayload;
  let testFileForProducts: FilePayload;
  let firstFile: FileEntity;
  let firstFileId: string;

  const FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION = 15;

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
      title: 'deploy=615',
      filename: '3d27a5b1aa47b47d534273e13a119e06',
      fileSize: 1036886,
      mimetype: 'image/png',
      encoding: '7bit',
      extname: '.png',
    };

    firstFile = await filesService.createOne(testFileForProducts);

    firstFileId = firstFile.id;
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
  });

  beforeAll(async () => {
    firstCartElement = {
      productId: parseInt(firstProductId),
      quantity: parseInt(firstProductId) ** parseInt(firstProductId),
    };

    const { payload: cartPayload } = await app.inject({
      method: 'POST',
      url: '/cart',
      payload: {
        productId: firstCartElement.productId,
        quantity: firstCartElement.quantity,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstCartElementId = JSON.parse(cartPayload).id;
  });

  beforeAll(async () => {
    const firstDeliveryAddress = {
      type: 'test p11',
      addressName: ' is a test product',
      governorate: '91119.11199',
      area: 1,
      block: 'str',
      street: 'street',
      avenue: 'ave',
      houseNumber: 1,
      buildingNumber: 1,
      floorNumber: 1,
      apartmentNumber: 2,
      officeNumber: 2,
      direction: 'direction',
    };

    const { payload: newDeliveryAddress } = await app.inject({
      method: 'POST',
      url: '/delivery-addresses',
      payload: {
        type: firstDeliveryAddress.type,
        addressName: firstDeliveryAddress.addressName,
        governorate: firstDeliveryAddress.governorate,
        area: firstDeliveryAddress.area,
        block: firstDeliveryAddress.block,
        street: firstDeliveryAddress.street,
        avenue: firstDeliveryAddress.avenue,
        houseNumber: firstDeliveryAddress.houseNumber,
        buildingNumber: firstDeliveryAddress.buildingNumber,
        floorNumber: firstDeliveryAddress.floorNumber,
        apartmentNumber: firstDeliveryAddress.apartmentNumber,
        officeNumber: firstDeliveryAddress.officeNumber,
        direction: firstDeliveryAddress.direction,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstDeliveryAddressId = parseInt(JSON.parse(newDeliveryAddress).id);
  });

  beforeAll(async () => {
    const order = {
      deliveryAddressId: firstDeliveryAddressId,
      deliveryTimeSlotId: 3,
      deliveryDate: 'today',
      comment: 'my comment here',
      promocode: 'my promocode here',
      paymentMethod: 'my paymentMethod here',
    };

    firstOrder = {
      deliveryAddressId: order.deliveryAddressId,
      deliveryTimeSlotId: order.deliveryTimeSlotId,
      deliveryDate: order.deliveryDate,
      comment: order.comment,
      promocode: order.promocode,
      paymentMethod: order.paymentMethod,
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/order',
      payload: {
        deliveryAddressId: firstOrder.deliveryAddressId,
        deliveryTimeSlotId: firstOrder.deliveryTimeSlotId,
        deliveryDate: firstOrder.deliveryDate,
        comment: firstOrder.comment,
        promocode: firstOrder.promocode,
        paymentMethod: firstOrder.paymentMethod,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstOrderId = JSON.parse(payload).id;
  });

  // *****************************************************************************************************************
  // GET /api/order
  // *****************************************************************************************************************

  it(`/GET orders`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: '/order',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(orderPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  it(`/GET orders, testing pagination result: (result and total)`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: '/order',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(orderPayload);
    expect(result).toBeDefined();
    expect(total).toEqual(1);
  });

  // *****************************************************************************************************************
  // GET /api/order/{id}
  // *****************************************************************************************************************

  it(`/GET order, failed case`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: '/order/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(orderPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET order, test get method, entity is not found`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: `/order/${firstOrderId + 4}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(orderPayload)).toEqual({
      message: 'ORDER_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/GET order, test get method, entity is found by query: (userId)`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: '/notifications?status=new order',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(orderPayload);

    expect(result).toBeDefined();
    expect(total).toEqual(0);
  });

  it(`/GET order, test get method, entity is not found`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: `/order/${firstOrderId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      deliveryAddressId,
      deliveryTimeSlotId,
      deliveryDate,
      comment,
      promocode,
      paymentMethod,
    } = JSON.parse(orderPayload);

    expect(parseInt(deliveryAddressId)).toEqual(firstOrder.deliveryAddressId);
    expect(parseInt(deliveryTimeSlotId)).toEqual(firstOrder.deliveryTimeSlotId);
    expect(deliveryDate).toEqual(firstOrder.deliveryDate);
    expect(comment).toEqual(firstOrder.comment);
    expect(promocode).toEqual(firstOrder.promocode);
    expect(paymentMethod).toEqual(firstOrder.paymentMethod);
  });
});
