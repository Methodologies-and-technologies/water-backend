import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { ProductEntity } from 'src/modules/product/product.entity';
import { ProductService } from 'src/modules/product/product.service';
import { UserService } from 'src/modules/user';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { CartEntity } from '../cart.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { PaginationCartItemsDto } from '../dto/pagination-cart-item.dto';
import { QueryParamsDto } from '../dto/query-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity) private readonly cartRepository: Repository<CartEntity>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  public async addProductToCart(id: number, payload: AddToCartDto): Promise<CartEntity> {
    const product: ProductEntity = await this.productService.getProductById(payload.productId);
    if (!product) {
      throw new NotFoundException(createError(ErrorTypeEnum.PRODUCT_NOT_FOUND, 'id'));
    }
    const user: UserEntity = await this.userService.getUserById(id);
    const cartItem: CartEntity = this.cartRepository.create({
      user,
      product,
      quantity: payload.quantity,
    });
    await this.cartRepository.save(cartItem);
    return await this.getCartItemByItsId(cartItem.id);
  }

  public async getCartItemByItsId(id: number): Promise<CartEntity> {
    return await this.cartRepository.findOne({
      where: { id },
      relations: ['product', 'order'],
    });
  }

  public async getAllCartItems(options: QueryParamsDto): Promise<PaginationCartItemsDto> {
    const cartItemsByQuery: [CartEntity[], number] = await this.cartRepository.findAndCount({
      ...options,
      relations: ['product', 'order'],
      take: 10,
      skip: 0,
    });
    if (cartItemsByQuery.length) new PaginationCartItemsDto(cartItemsByQuery);
    options = { take: 10, skip: 0 } as any;
    const data: [CartEntity[], number] = await this.cartRepository.findAndCount({
      ...options,
      relations: ['product', 'order'],
    });
    return new PaginationCartItemsDto(data);
  }

  public async updateCartItem(id: number, data: UpdateCartItemDto): Promise<CartEntity> {
    const cartItem: CartEntity = await this.cartRepository.findOne({ where: { id } });
    if (!cartItem) {
      throw new NotFoundException(createError(ErrorTypeEnum.CART_ITEM_NOT_FOUND, 'cartItem id'));
    }
    await this.cartRepository.update(id, data);
    return await this.getCartItemByItsId(cartItem.id);
  }

  public async destroyCartItem(id: number): Promise<CartEntity> {
    const cartItem: CartEntity = await this.cartRepository.findOne({ where: { id } });
    if (!cartItem) {
      throw new NotFoundException(createError(ErrorTypeEnum.CART_ITEM_NOT_FOUND, 'cartItem id'));
    }
    await this.cartRepository.delete(id);
    return cartItem;
  }
}
