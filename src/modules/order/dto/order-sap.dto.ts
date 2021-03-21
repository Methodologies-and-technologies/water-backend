import { CartEntity } from 'src/modules/cart/cart.entity';
import { OrderEntity } from '../order.entity';
import { ItemDetailsSapDto } from './order-item-details-sap.dto';

export class OrderSapDto {
  public readonly CustomerID: string = '';

  public readonly MosqueOrder: boolean;

  public readonly SubTotal: number;

  public readonly MosqueID: string;

  public readonly DeliveryAddressID: string;

  public readonly NetAmount: string;

  public readonly DeliveryCost: number;

  public readonly PaidAmount: string;

  public readonly OrderDiscountPromotions: string;

  public readonly OrderDiscount: string;

  public readonly PaymentType: string;

  public readonly DeliveryAddressType: string;

  public readonly OrderDiscountPercentage: string;

  public readonly PaymentCardType: string;

  public readonly PaymentConfirmation: string;

  public readonly ScheduledDeliveryDate: string;

  public readonly ScheduledDeliverySlot: string;

  public readonly ItemDetails: ItemDetailsSapDto[];

  constructor(entity: OrderEntity, cartItems: CartEntity[], amount: string, userSapId: string) {
    this.CustomerID = userSapId;
    this.SubTotal = entity.carts.length;
    this.ScheduledDeliveryDate = entity.deliveryDate;
    this.ScheduledDeliverySlot = entity.deliveryTimeSlot;
    this.DeliveryCost = 0;
    this.MosqueID = 'T189065';
    this.DeliveryAddressID = 'C189065';
    this.NetAmount = amount;
    this.PaidAmount = this.NetAmount;
    this.MosqueOrder = false;
    this.OrderDiscountPromotions = '25';
    this.OrderDiscount = '25';
    this.PaymentType = 'PaymentType';
    this.OrderDiscountPercentage = '25';
    this.PaymentCardType = 'Visa';
    this.PaymentConfirmation = 'normal';
    this.DeliveryAddressType = 'type';
    this.ItemDetails = cartItems.map((cartItem) => new ItemDetailsSapDto(cartItem));
  }
}
