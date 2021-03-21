import { UserSapDto } from './user-sap.dto';
import { UserEntity } from '../user.entity';

export class UpdateUserSapDto extends UserSapDto {
  public readonly CustomerCode: string;

  constructor(user: UserEntity) {
    super(user);
    this.CustomerCode = user.sapId;
  }
}
