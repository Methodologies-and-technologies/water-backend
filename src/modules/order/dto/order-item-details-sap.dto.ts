import { CartEntity } from 'src/modules/cart/cart.entity';

export class ItemDetailsSapDto {
  public readonly SKUCode: string;

  public readonly Qty: number;

  public readonly PromotionID: string;

  public readonly DiscountPerc: string;

  public readonly SalesPrice: number;

  public readonly LineTotal: number;

  public readonly DiscountAmount: string;

  public readonly PromotionType: string;

  constructor(entity: CartEntity) {
    this.SKUCode = entity.product.sapId;
    this.Qty = entity.quantity;
    this.SalesPrice = entity.product.pricePerItem;
    this.LineTotal = this.Qty * this.SalesPrice;
    this.DiscountAmount = '25';
    this.DiscountPerc = '25';
    this.PromotionType = 'type';
    this.PromotionID = 'C189065';
  }
}
