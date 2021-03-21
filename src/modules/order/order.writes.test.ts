import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { OrderTypeEnum } from '../../common/enums/order-type.enum';

describe.skip('order writes test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;

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

    await app.inject({
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

  // *****************************************************************************************************************
  // POST /api/order
  // *****************************************************************************************************************

  it(`/POST orders, test get method, entity is found`, async () => {
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

  // *****************************************************************************************************************
  // PUT /api/order/{id}
  // *****************************************************************************************************************

  it(`/PUT order, entity was not found`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'PUT',
      url: `/order/${firstOrderId + 12}`,
      payload: {
        deliveryAddressId:
          firstProduct.packCapacity -
          FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(orderPayload)).toEqual({
      message: 'ORDER_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/PUT order, file was not found`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'PUT',
      url: `/order/${firstOrderId}`,
      payload: {
        deliveryAddressId:
          firstProduct.packCapacity -
          FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(orderPayload)).toEqual({
      message: 'DELIVERY_ADDRESS_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/PUT order, invalid product id passed`, async () => {
    const { payload: orderPayload } = await app.inject({
      method: 'PUT',
      url: `/order/q`,
      payload: {
        question: 'question:',
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(orderPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT products, test get method, put -> get`, async () => {
    const { payload: updateOrderPayload } = await app.inject({
      method: 'PUT',
      url: `/order/${firstOrderId}`,
      payload: {
        deliveryDate: firstOrder.deliveryDate.toUpperCase(),
        comment: firstOrder.comment.toUpperCase(),
        promocode: firstOrder.promocode.toUpperCase(),
        paymentMethod: firstOrder.paymentMethod.toUpperCase(),
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { deliveryDate, comment, promocode, paymentMethod } = JSON.parse(updateOrderPayload);

    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: `/order/${firstOrderId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const updatedOrder = JSON.parse(orderPayload);

    expect(deliveryDate).toEqual(updatedOrder.deliveryDate);
    expect(comment).toEqual(updatedOrder.comment);
    expect(promocode).toEqual(updatedOrder.promocode);
    expect(paymentMethod).toEqual(updatedOrder.paymentMethod);
  });

  // *****************************************************************************************************************
  // DELETE /api/order/{id}
  // *****************************************************************************************************************

  it(`/DELETE order`, async () => {
    const { payload: productsPayload } = await app.inject({
      method: 'DELETE',
      url: '/order/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(productsPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/DELETE order, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/order/${firstOrderId + 34}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'ORDER_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/DELETE products, get: (status is not 'deleted' - error)`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/products/${firstOrderId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'CANNOT_DELETE_ORDER',
      property: 'order id, status not deleted',
    });
  });

  it(`/DELETE products, get: (status is 'deleted' - SUCCESS)`, async () => {
    await app.inject({
      method: 'PUT',
      url: `/order/${firstOrderId}`,
      payload: {
        status: OrderTypeEnum.DELETED,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    const { payload: orderPayload } = await app.inject({
      method: 'GET',
      url: `/order/${firstOrderId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const updatedOrder = JSON.parse(orderPayload);
    expect(updatedOrder.status).toEqual(OrderTypeEnum.DELETED);

    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/products/${firstOrderId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).not.toEqual({
      message: 'CANNOT_DELETE_ORDER',
      property: 'order id, status not deleted',
    });
  });
});
