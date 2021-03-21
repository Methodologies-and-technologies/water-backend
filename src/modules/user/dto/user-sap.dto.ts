import { UserEntity } from '../user.entity';

export class UserSapDto {
  public readonly CustomerName: string = '';

  public readonly CustomerForeignName: string = '';

  public readonly Phone: string = '';

  public readonly Email: string = '';

  public readonly Cellular: string = '';

  public readonly ContactPerson: string = '';

  public readonly HouseBank: string = '';

  public readonly HouseBankAccount: string = '';

  public readonly HouseBankBranch: string = '';

  public readonly DefaultBillToAddress: string = '';

  public readonly DefaultShipToAddress: string = '';

  public readonly message: string = '';

  constructor(entity: UserEntity) {
    this.CustomerName = entity.fullName;
    this.Phone = entity.phoneNumber;
    this.Email = entity.email;
  }
}
