import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { AuthService } from '../auth';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../user/user.entity';
import { DeliveryAddressEntity } from './delivery-address.entity';
import { DeliveryAddressModule } from './delivery-address.module';
import { DeliveryAddressService } from './services';
import { testImports } from '../../common/helpers/test-imports.helpers';

describe('delivery address writes test', () => {
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
  });

  // *****************************************************************************************************************
  // POST /api/delivery-addresses
  // *****************************************************************************************************************

  it(`/POST delivery address, post -> get`, async (done) => {
    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'GET',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const deliveryAddress = JSON.parse(deliveryAddressPayload);

    expect(deliveryAddress.type).toEqual(firstDeliveryAddress.type);
    expect(deliveryAddress.addressName).toEqual(firstDeliveryAddress.addressName);
    expect(deliveryAddress.governorate).toEqual(firstDeliveryAddress.governorate);
    expect(parseInt(deliveryAddress.area)).toEqual(firstDeliveryAddress.area);
    expect(deliveryAddress.block).toEqual(firstDeliveryAddress.block);
    expect(deliveryAddress.street).toEqual(firstDeliveryAddress.street);
    expect(deliveryAddress.avenue).toEqual(firstDeliveryAddress.avenue);
    expect(parseInt(deliveryAddress.houseNumber)).toEqual(firstDeliveryAddress.houseNumber);
    expect(parseInt(deliveryAddress.buildingNumber)).toEqual(firstDeliveryAddress.buildingNumber);
    expect(parseInt(deliveryAddress.officeNumber)).toEqual(firstDeliveryAddress.officeNumber);
    expect(parseInt(deliveryAddress.floorNumber)).toEqual(firstDeliveryAddress.floorNumber);
    expect(parseInt(deliveryAddress.apartmentNumber)).toEqual(firstDeliveryAddress.apartmentNumber);
    expect(deliveryAddress.direction).toEqual(firstDeliveryAddress.direction);

    expect(deliveryAddress.user.email).toEqual(anotherUser.email);
    expect(deliveryAddress.user.fullName).toEqual(anotherUser.fullName);
    expect(deliveryAddress.user.phoneNumber).toEqual(anotherUser.phoneNumber);
    done();
  });

  // *****************************************************************************************************************
  // PUT /api/delivery-addresses
  // *****************************************************************************************************************

  it(`/PUT delivery address, put -> get`, async (done) => {
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

    const { payload: deliveryAddressPayload } = await app.inject({
      method: 'PUT',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
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
    } = JSON.parse(deliveryAddressPayload);

    expect(type).toEqual(secondDeliveryAddress.type);
    expect(addressName).toEqual(secondDeliveryAddress.addressName);
    expect(governorate).toEqual(secondDeliveryAddress.governorate);
    expect(parseInt(area)).toEqual(secondDeliveryAddress.area);
    expect(block).toEqual(secondDeliveryAddress.block);
    expect(street).toEqual(secondDeliveryAddress.street);
    expect(avenue).toEqual(secondDeliveryAddress.avenue);
    expect(parseInt(houseNumber)).toEqual(secondDeliveryAddress.houseNumber);
    expect(parseInt(buildingNumber)).toEqual(secondDeliveryAddress.buildingNumber);
    expect(parseInt(officeNumber)).toEqual(secondDeliveryAddress.officeNumber);
    expect(parseInt(floorNumber)).toEqual(secondDeliveryAddress.floorNumber);
    expect(parseInt(apartmentNumber)).toEqual(secondDeliveryAddress.apartmentNumber);
    expect(direction).toEqual(secondDeliveryAddress.direction);

    await app.inject({
      method: 'GET',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const deliveryAddress = JSON.parse(deliveryAddressPayload);

    expect(deliveryAddress.type).toEqual(secondDeliveryAddress.type);
    expect(deliveryAddress.addressName).toEqual(secondDeliveryAddress.addressName);
    expect(deliveryAddress.governorate).toEqual(secondDeliveryAddress.governorate);
    expect(parseInt(deliveryAddress.area)).toEqual(secondDeliveryAddress.area);
    expect(deliveryAddress.block).toEqual(secondDeliveryAddress.block);
    expect(deliveryAddress.street).toEqual(secondDeliveryAddress.street);
    expect(deliveryAddress.avenue).toEqual(secondDeliveryAddress.avenue);
    expect(parseInt(deliveryAddress.houseNumber)).toEqual(secondDeliveryAddress.houseNumber);
    expect(parseInt(deliveryAddress.buildingNumber)).toEqual(secondDeliveryAddress.buildingNumber);
    expect(parseInt(deliveryAddress.officeNumber)).toEqual(secondDeliveryAddress.officeNumber);
    expect(parseInt(deliveryAddress.floorNumber)).toEqual(secondDeliveryAddress.floorNumber);
    expect(parseInt(deliveryAddress.apartmentNumber)).toEqual(
      secondDeliveryAddress.apartmentNumber,
    );
    expect(deliveryAddress.direction).toEqual(secondDeliveryAddress.direction);

    expect(deliveryAddress.user.email).toEqual(anotherUser.email);
    expect(deliveryAddress.user.fullName).toEqual(anotherUser.fullName);
    expect(deliveryAddress.user.phoneNumber).toEqual(anotherUser.phoneNumber);
    done();
  });

  it(`/PUT delivery addresses, put entity that does not exist`, async (done) => {
    const { payload } = await app.inject({
      method: 'PUT',
      url: `/delivery-addresses/${fisrtDeliveryAddressId + 7}`,
      payload: {
        area: firstDeliveryAddress.area,
        block: firstDeliveryAddress.block,
        street: firstDeliveryAddress.street,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'DELIVERY_ADDRESS_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  // *****************************************************************************************************************
  // DELETE /api/delivery-addresses
  // *****************************************************************************************************************

  it(`/DELETE delivery addresses, delete -> get`, async (done) => {
    await app.inject({
      method: 'DELETE',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/delivery-addresses/${fisrtDeliveryAddressId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'DELIVERY_ADDRESS_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  it(`/DELETE delivery addresses, delete delivery address that does not exist`, async (done) => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/delivery-addresses/${fisrtDeliveryAddressId + 6}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'DELIVERY_ADDRESS_NOT_FOUND',
      property: 'id',
    });
    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
