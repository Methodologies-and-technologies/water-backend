import { Injectable } from '@nestjs/common';
import { ChangeEventService } from '../change-events/change-event.service';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { EntityOperationEnum } from '../../common/enums/entity-operation.enum';
import { SapApiResponse, SapApiService } from '../core/sap-api.service';
import { OrderEntity } from './order.entity';
import { OrderSapDto } from './dto/order-sap.dto';
import { CartEntity } from '../cart/cart.entity';

@Injectable()
export class OrderSapService {
  constructor(
    private readonly sapApiService: SapApiService,
    private readonly changeEventService: ChangeEventService,
  ) {}

  public async sendCreatedOrder(
    order: OrderEntity,
    cartItems: CartEntity[],
    amount: string,
    userSapId: string,
  ): Promise<SapApiResponse> {
    const orderDto: OrderSapDto = new OrderSapDto(order, cartItems, amount, userSapId);
    const sapOrderResponse = await this.sapApiService.post('/AddNewSalesOrder/', orderDto);
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.ORDER,
      EntityOperationEnum.CREATE,
      JSON.stringify(orderDto),
      sapOrderResponse.isSuccess,
    );
    return sapOrderResponse;
  }

  public async sendUpdatedOrder(orderDto: OrderEntity): Promise<void> {
    const { isSuccess } = await this.sapApiService.post('/UpdateSalesOrder', orderDto);
    await this.changeEventService.createChangeEvent(
      EntityTypeEnum.ORDER,
      EntityOperationEnum.UPDATE,
      JSON.stringify(orderDto),
      isSuccess,
    );
  }
}
