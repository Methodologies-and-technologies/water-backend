import { UserEntity } from '../user.entity';

export class SapUserResponseDto {
  public readonly SapId: string = '';

  public readonly CustomerName: string = '';

  public readonly Phone: string = '';

  public readonly Email: string = '';

  constructor(entity: UserEntity) {
    this.SapId = entity.sapId;
    this.CustomerName = entity.fullName;
    this.Phone = entity.phoneNumber;
    this.Email = entity.email;
  }
}
