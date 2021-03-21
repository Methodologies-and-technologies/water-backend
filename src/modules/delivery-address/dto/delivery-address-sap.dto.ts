import { DeliveryAddressEntity } from '../delivery-address.entity';

export class DeliveryAddressSapDto {
  public readonly CustomerID: string = '';

  public readonly AddressID: string = '';

  public readonly AddressType: string = '';

  public readonly AddressName: string = '';

  public readonly Governorate: string = '';

  public readonly Area: string = '';

  public readonly Block: string = '';

  public readonly Street: string = '';

  public readonly Avenue: string = '';

  public readonly HouseBuildingNumber: string = '';

  public readonly Floor: string = '';

  public readonly FlatNumber: string = '';

  public readonly OfficeNumber: string = '';

  public readonly Direction: string = '';

  public readonly Latitude: string = '';

  public readonly Longitutde: string = '';

  public readonly message: string = '';

  constructor(entity: DeliveryAddressEntity, userSapId: string) {
    this.CustomerID = userSapId;
    this.AddressID = String(entity.id);
    this.Area = String(entity.area);
    this.HouseBuildingNumber = String(entity.houseNumber);
    this.Floor = String(entity.floorNumber);
    this.FlatNumber = String(entity.apartmentNumber);
    this.OfficeNumber = String(entity.officeNumber);
    this.AddressType = entity.type;
    this.AddressName = entity.addressName;
    this.Governorate = entity.governorate;
    this.Block = entity.block;
    this.Street = entity.street;
    this.Avenue = entity.avenue;
    this.Direction = entity.direction;
    this.Avenue = entity.avenue;
  }
}
