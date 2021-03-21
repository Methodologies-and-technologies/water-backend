import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { testImports } from '../../common/helpers/test-imports.helpers';
import { FileEntity } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { ConfigService } from '../../config/config.service';
import { SapApiService } from '../core/sap-api.service';

describe.skip('order integrations test', () => {
  let app: NestFastifyApplication;
  let filesService: FilesService;
  let configService: ConfigService;
  let apiService: SapApiService;

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
  let sapToken: string;

  const FILE_ID_OFFSET_NEEDS_TO_AVOID_UNIQUE_CONSTRAINT_ONE_TO_ONE_RELATION = 15;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: testImports,
    }).compile();

    filesService = module.get<FilesService>(FilesService);
    configService = module.get<ConfigService>(ConfigService);
    apiService = module.get(SapApiService);

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });

  beforeAll(async () => {
    const { payload } = await app.inject({
      method: 'POST',
      url: '/auth/sap/login',
      payload: {
        clientId: process.env.SAP_CLIENT_ID,
        clientSecret: process.env.SAP_CLIENT_SECRET,
      },
    });
    sapToken = JSON.parse(payload).token;
  });

  beforeAll(async () => {
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

  // *****************************************************************************************************************
  // GET /order
  // *****************************************************************************************************************

  describe('Creation of the order', () => {
    describe('Request to SAP is successful', () => {
      beforeAll(async () => {
        jest.spyOn(apiService, 'post').mockImplementation(async () => {
          console.log('Mocked method');
          return { isSuccess: true, data: { id: '40' } };
        });
      });

      it('should generate an event of creation', async (done) => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 1);
        expect(payload.result[2]).toHaveProperty('id');
        expect(payload.result[2]).toHaveProperty('type', 'ORDER');
        expect(payload.result[2]).toHaveProperty('operation', 'CREATE');
        expect(payload.result[2]).toHaveProperty('isProcessed', true);
        expect(payload.result[2]).toHaveProperty('createdAt');
        expect(payload.result[2]).toHaveProperty('updatedAt');
        done();
      });
    });

    describe('Request to SAP is failed', () => {
      beforeAll(async () => {
        jest.spyOn(apiService, 'post').mockImplementation(async () => {
          console.log('Mocked method');
          return { isSuccess: false };
        });
      });

      it('should generate an event of creation', async (done) => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total', 1);
        expect(payload.result[2]).toHaveProperty('id');
        expect(payload.result[2]).toHaveProperty('type', 'ORDER');
        expect(payload.result[2]).toHaveProperty('operation', 'CREATE');
        expect(payload.result[2]).toHaveProperty('isProcessed', true);
        expect(payload.result[2]).toHaveProperty('createdAt');
        expect(payload.result[2]).toHaveProperty('updatedAt');
        done();
      });
    });
  });

  describe('Updating of the order by its id', () => {
    describe('Request to SAP is successful', () => {
      beforeAll(async () => {
        jest.spyOn(apiService, 'post').mockImplementation(async () => {
          console.log('Mocked method');
          return { isSuccess: true, data: { id: '20' } };
        });

        await app.inject({
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
      });

      it('should generate an event of update', async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total');
        expect(payload.result[3]).toHaveProperty('id');
        expect(payload.result[3]).toHaveProperty('type', 'ORDER');
        expect(payload.result[3]).toHaveProperty('operation', 'UPDATE');
        expect(payload.result[3]).toHaveProperty('isProcessed', true);
        expect(payload.result[3]).toHaveProperty('createdAt');
        expect(payload.result[3]).toHaveProperty('updatedAt');
      });
    });

    describe('Request to SAP is successful', () => {
      beforeAll(async () => {
        jest.spyOn(apiService, 'post').mockImplementation(async () => {
          console.log('Mocked method');
          return { isSuccess: false };
        });

        await app.inject({
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
      });

      it('should generate an event of update', async () => {
        const { payload: payloadString } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload = JSON.parse(payloadString);
        expect(payload).toHaveProperty('result');
        expect(payload).toHaveProperty('total');
        expect(payload.result[3]).toHaveProperty('id');
        expect(payload.result[3]).toHaveProperty('type', 'ORDER');
        expect(payload.result[3]).toHaveProperty('operation', 'UPDATE');
        expect(payload.result[3]).toHaveProperty('isProcessed', false);
        expect(payload.result[3]).toHaveProperty('createdAt');
        expect(payload.result[3]).toHaveProperty('updatedAt');
      });
    });

    describe('Request to update from SAP', () => {
      beforeAll(async () => {
        jest.spyOn(apiService, 'post').mockImplementation(async () => {
          console.log('Mocked method');
          return { isSuccess: false };
        });

        await app.inject({
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
      });

      it('should not generate an event of update', async () => {
        const { payload: payloadString1 } = await app.inject({
          method: 'GET',
          url: '/change-events',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload1 = JSON.parse(payloadString1);
        expect(payload1).toHaveProperty('result');
        expect(payload1).toHaveProperty('total', 3);

        const { payload: payloadString2 } = await app.inject({
          method: 'GET',
          url: '/change-events?isProcessed=true',
          headers: {
            authorization: 'Bearer ' + sapToken,
          },
        });
        const payload2 = JSON.parse(payloadString2);
        expect(payload2).toHaveProperty('result');
        expect(payload2).toHaveProperty('total', 3);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
