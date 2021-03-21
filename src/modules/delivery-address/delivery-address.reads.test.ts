import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { testImports } from 'src/common/helpers/test-imports.helpers';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { DeliveryAddressEntity } from './delivery-address.entity';

describe('delivery address reads test', () => {
  let app: NestFastifyApplication;

  interface UserData {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }
  let verifiedUser: UserData;
  let anotherUser: UserData;
  let token: string;
  let anotherToken: string;
  let fisrtDeliveryAddressId: string;
  let firstDeliveryAddress: Partial<DeliveryAddressEntity>;

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
  });

  beforeAll(async () => {
    firstDeliveryAddress = {
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

    const {
      id,
      type,
      addressName,
      governorate,
      area,
      block,
      street,
      avenue,
      houseNumber,
      buildingNumber,
      officeNumber,
      floorNumber,
      apartmentNumber,
      direction,
      user: usersDeliveryAddressOne,
    } = JSON.parse(newDeliveryAddress);

    fisrtDeliveryAddressId = id;

    expect(type).toEqual(firstDeliveryAddress.type);
    expect(addressName).toEqual(firstDeliveryAddress.addressName);
    expect(governorate).toEqual(firstDeliveryAddress.governorate);
    expect(area).toEqual(firstDeliveryAddress.area);
    expect(block).toEqual(firstDeliveryAddress.block);
    expect(street).toEqual(firstDeliveryAddress.street);
    expect(avenue).toEqual(firstDeliveryAddress.avenue);
    expect(houseNumber).toEqual(firstDeliveryAddress.houseNumber);
    expect(buildingNumber).toEqual(firstDeliveryAddress.buildingNumber);
    expect(officeNumber).toEqual(firstDeliveryAddress.officeNumber);
    expect(floorNumber).toEqual(firstDeliveryAddress.floorNumber);
    expect(apartmentNumber).toEqual(firstDeliveryAddress.apartmentNumber);
    expect(direction).toEqual(firstDeliveryAddress.direction);

    expect(usersDeliveryAddressOne.email).toEqual(anotherUser.email);
    expect(usersDeliveryAddressOne.fullName).toEqual(anotherUser.fullName);
    expect(usersDeliveryAddressOne.phoneNumber).toEqual(anotherUser.phoneNumber);

    const secondDeliveryAddress = {
      type: 'p11 123',
      addressName: ' is a test product12',
      governorate: '91119.11199',
      area: 12,
      block: 'str',
      street: 'street',
      avenue: 'ave',
      houseNumber: 3,
      buildingNumber: 4,
      floorNumber: 1,
      apartmentNumber: 4,
      officeNumber: 7,
      direction: 'direction 123',
    };

    await app.inject({
      method: 'POST',
      url: '/delivery-addresses',
      payload: {
        type: secondDeliveryAddress.type,
        addressName: secondDeliveryAddress.addressName,
        governorate: secondDeliveryAddress.governorate,
        area: secondDeliveryAddress.area,
        block: secondDeliveryAddress.block,
        street: secondDeliveryAddress.street,
        avenue: secondDeliveryAddress.avenue,
        houseNumber: secondDeliveryAddress.houseNumber,
        buildingNumber: secondDeliveryAddress.buildingNumber,
        floorNumber: secondDeliveryAddress.floorNumber,
        apartmentNumber: secondDeliveryAddress.apartmentNumber,
        officeNumber: secondDeliveryAddress.officeNumber,
        direction: secondDeliveryAddress.direction,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });
  });

  // *****************************************************************************************************************
  // GET /api/delivery-address
  // *****************************************************************************************************************

  it(`/GET delivery address, testing pagination`, async () => {
    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: '/delivery-addresses',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const { result, total } = JSON.parse(deliveryAddressPayload);

    expect(result).toBeDefined();
    expect(total).toEqual(2);
  });

  it(`/GET delivery address, testing query result: (type=undefined) - return all data without filter`, async () => {
    const { payload: deliveryAddressPayloadByFilter } = await app.inject({
      method: 'GET',
      url: '/delivery-addresses?type=',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: '/delivery-addresses',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(deliveryAddressPayload)).toEqual(JSON.parse(deliveryAddressPayloadByFilter));
  });

  // *****************************************************************************************************************
  // GET /api/delivery-address/id
  // *****************************************************************************************************************

  it(`/GET delivery address, validation failed`, async () => {
    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: '/delivery-addresses/a',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(deliveryAddressPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET delivery address, test get method`, async () => {
    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      type,
      addressName,
      governorate,
      area,
      block,
      street,
      avenue,
      houseNumber,
      buildingNumber,
      officeNumber,
      floorNumber,
      apartmentNumber,
      direction,
      user: usersDeliveryAddressOne,
    } = JSON.parse(deliveryAddressPayload);

    expect(type).toEqual(firstDeliveryAddress.type);
    expect(addressName).toEqual(firstDeliveryAddress.addressName);
    expect(governorate).toEqual(firstDeliveryAddress.governorate);
    expect(parseInt(area)).toEqual(firstDeliveryAddress.area);
    expect(block).toEqual(firstDeliveryAddress.block);
    expect(street).toEqual(firstDeliveryAddress.street);
    expect(avenue).toEqual(firstDeliveryAddress.avenue);
    expect(parseInt(houseNumber)).toEqual(firstDeliveryAddress.houseNumber);
    expect(parseInt(buildingNumber)).toEqual(firstDeliveryAddress.buildingNumber);
    expect(parseInt(officeNumber)).toEqual(firstDeliveryAddress.officeNumber);
    expect(parseInt(floorNumber)).toEqual(firstDeliveryAddress.floorNumber);
    expect(parseInt(apartmentNumber)).toEqual(firstDeliveryAddress.apartmentNumber);
    expect(direction).toEqual(firstDeliveryAddress.direction);

    expect(usersDeliveryAddressOne.email).toEqual(anotherUser.email);
    expect(usersDeliveryAddressOne.fullName).toEqual(anotherUser.fullName);
    expect(usersDeliveryAddressOne.phoneNumber).toEqual(anotherUser.phoneNumber);
  });

  it(`/GET delivery address, test get method, entity is not found`, async () => {
    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: `/delivery-addresses/${fisrtDeliveryAddressId + 4}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(deliveryAddressPayload)).toEqual({
      message: 'DELIVERY_ADDRESS_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
