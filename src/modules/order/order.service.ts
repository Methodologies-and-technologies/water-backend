import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum, OrderTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { Like, Repository } from 'typeorm';
import { CartEntity } from '../cart/cart.entity';
import { PaginationCartItemsDto } from '../cart/dto/pagination-cart-item.dto';
import { CartService } from '../cart/services';
import { SapApiResponse } from '../core/sap-api.service';
import { DeliveryAddressSapService } from '../delivery-address/delivery-address-sap.service';
import { DeliveryAddressEntity } from '../delivery-address/delivery-address.entity';
import { DeliveryAddressService } from '../delivery-address/services';
import { DeliveryTimeSlotsService } from '../delivery-time-slots';
import { DeliveryTimeSlotsEntity } from '../delivery-time-slots/delivery-time-slots.entity';
import { UserEntity } from '../user/user.entity';
import { CalculateOrderResponse } from './calculate-order.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationOrdersDto } from './dto/pagination-order.dto';
import { QueryParamsOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './order.entity';
import { OrderSapService } from './order.sap-service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly deliveryAddressService: DeliveryAddressService,
    private readonly deliveryTimeSlotsService: DeliveryTimeSlotsService,
    private readonly cartService: CartService,
    private readonly orderSapService: OrderSapService,
    private readonly deliveryAddressSapService: DeliveryAddressSapService,
  ) {}

  public async createOrder(
    orderPayload: CreateOrderDto,
    user: UserEntity,
  ): Promise<OrderEntity | CalculateOrderResponse> {
    const deliveryAddress: DeliveryAddressEntity = await this.deliveryAddressService.getDeliveryAddressById(
      orderPayload.deliveryAddressId,
    );
    const deliveryTimeSlot: DeliveryTimeSlotsEntity = await this.deliveryTimeSlotsService.getDeliveryTimeSlotById(
      orderPayload.deliveryTimeSlotId,
    );
    const { result: cartItems }: PaginationCartItemsDto = await this.cartService.getAllCartItems({
      userId: user.id,
    });
    const totalAmount: number = cartItems.reduce(
      (acc: number, value: CartEntity) => (acc += +value.quantity * +value.product.totalPrice),
      0,
    );

    if (!deliveryAddress) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_ADDRESS_NOT_FOUND, 'id'));
    }
    if (!deliveryTimeSlot) {
      throw new NotFoundException(createError(ErrorTypeEnum.DELIVERY_TIME_SLOT_NOT_FOUND, 'id'));
    }

    if (!orderPayload.paymentMethod) {
      return {
        amount: cartItems.length,
        discount: 0,
        deliveryCost: 0,
        totalSum: totalAmount,
      } as CalculateOrderResponse;
    }

    const { deliveryAddressId, deliveryTimeSlotId, ...payloadForCreate } = orderPayload;
    const order: Partial<OrderEntity> = {
      ...payloadForCreate,
      deliveryAddress,
      user,
      carts: cartItems,
      deliveryTimeSlot: deliveryTimeSlot.value,
      discount: 20,
      deliveryCost: 30,
      totalAmount: totalAmount,
      transactionId: 1,
      orderNumber: 1,
    };

    const sapDeliveryAddress: SapApiResponse = await this.deliveryAddressSapService.sendCreatedUserDeliveryAddress(
      deliveryAddress,
      user.sapId,
    );
    const createdOrder: OrderEntity = this.orderRepository.create({ ...order });
    const sapOrder: SapApiResponse = await this.orderSapService.sendCreatedOrder(
      createdOrder,
      cartItems,
      totalAmount.toString(),
      user.sapId,
    );
    await this.orderRepository.save(createdOrder);
    return createdOrder;
  }

  public async getAllOrders(options: QueryParamsOrderDto): Promise<PaginationOrdersDto> {
    return new PaginationOrdersDto(
      (Array.from(Object.keys(options)) as Array<string>).length
        ? await this.orderRepository.findAndCount({
            where: { status: Like(`${options.status}%`) },
            relations: ['carts', 'carts.product', 'deliveryAddress', 'user'],
            take: 10,
            skip: 0,
          })
        : ((options = { take: 10, skip: 0 } as any),
          await this.orderRepository.findAndCount({
            ...options,
            relations: ['carts', 'carts.product', 'deliveryAddress', 'user'],
          })),
    );
  }

  public async getOrderById(id: number): Promise<OrderEntity> {
    const order: OrderEntity = await this.orderRepository.findOne({
      where: { id },
      relations: ['carts', 'carts.product', 'deliveryAddress', 'user'],
    });
    if (!order) {
      throw new NotFoundException(createError(ErrorTypeEnum.ORDER_NOT_FOUND, 'id'));
    }
    return order;
  }

  public async destroyOrder(id: number): Promise<OrderEntity> {
    const order: OrderEntity = await this.getOrderById(id);
    if (order.status === OrderTypeEnum.DELETED) {
      await this.orderRepository.delete(id);
      return order;
    } else {
      throw new NotFoundException(
        createError(ErrorTypeEnum.CANNOT_DELETE_ORDER, 'order id, status not deleted'),
      );
    }
  }

  public async updateOrder(id: number, data: UpdateOrderDto): Promise<OrderEntity> {
    const order: OrderEntity = await this.getOrderById(id);
    let deliveryAddress: DeliveryAddressEntity;
    let deliveryTimeSlot: string;

    if (data.deliveryAddressId && data.deliveryTimeSlotId) {
      deliveryAddress = await this.deliveryAddressService.getDeliveryAddressById(
        data.deliveryAddressId,
      );
      deliveryTimeSlot = (
        await this.deliveryTimeSlotsService.getDeliveryTimeSlotById(data.deliveryTimeSlotId)
      ).value;
    } else if (data.deliveryAddressId && !data.deliveryTimeSlotId) {
      deliveryAddress = await this.deliveryAddressService.getDeliveryAddressById(
        data.deliveryAddressId,
      );
      deliveryTimeSlot = order.deliveryTimeSlot;
    } else if (!data.deliveryAddressId && data.deliveryTimeSlotId) {
      deliveryAddress = order.deliveryAddress;
      deliveryTimeSlot = (
        await this.deliveryTimeSlotsService.getDeliveryTimeSlotById(data.deliveryTimeSlotId)
      ).value;
    } else {
      deliveryAddress = order.deliveryAddress;
      deliveryTimeSlot = order.deliveryTimeSlot;
    }

    const { deliveryAddressId, deliveryTimeSlotId, ...newOrderPayload } = data;
    await this.orderRepository.update(id, {
      ...newOrderPayload,
      deliveryAddress,
      deliveryTimeSlot,
    });
    const updatedOrder: OrderEntity = await this.getOrderById(order.id);
    await this.orderSapService.sendUpdatedOrder(updatedOrder);
    return updatedOrder;
  }
}
