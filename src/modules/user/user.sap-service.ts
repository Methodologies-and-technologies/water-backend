import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UserSapDto } from './dto/user-sap.dto';
import { ChangeEventService } from '../change-events/change-event.service';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { EntityOperationEnum } from '../../common/enums/entity-operation.enum';
import { SapApiResponse, SapApiService } from '../core/sap-api.service';
import { UpdateUserSapDto } from './dto/update-user-sap.dto';

@Injectable()
export class UserSapService {
  constructor(
    private sapApiService: SapApiService,
    private readonly changeEventService: ChangeEventService,
  ) {}

  public async sendCreatedUser(user: UserEntity): Promise<SapApiResponse> {
    const userDto: UserSapDto = new UserSapDto(user);
    const sapUserResponse: SapApiResponse = await this.sapApiService.post(
      '/AddNewCustomer/',
      userDto,
    );
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.CUSTOMER,
      EntityOperationEnum.CREATE,
      JSON.stringify(userDto),
      sapUserResponse.isSuccess,
    );
    return sapUserResponse;
  }

  public async sendUpdatedUser(user: UserEntity): Promise<SapApiResponse> {
    const userDto: UpdateUserSapDto = new UpdateUserSapDto(user);
    const sapUserResponse: SapApiResponse = await this.sapApiService.post(
      '/UpdateCustomer',
      userDto,
    );
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.CUSTOMER,
      EntityOperationEnum.UPDATE,
      JSON.stringify(userDto),
      sapUserResponse.isSuccess,
    );
    return sapUserResponse;
  }
}
