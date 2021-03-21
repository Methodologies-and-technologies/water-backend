import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryParamsDto } from './dto/query-cart-item.dto';
import { User } from '../user/user.decorator';
import { UserEntity } from '../user/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartService } from './services';
import { CartEntity } from './cart.entity';
import { PaginationCartItemsDto } from './dto/pagination-cart-item.dto';
import { UpdateCartItemDto } from '.';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all cartItems using pagination or query params.',
  })
  public async getAllCartItems(
    @Query() options?: QueryParamsDto,
  ): Promise<PaginationCartItemsDto | CartEntity[]> {
    return this.cartService.getAllCartItems(options);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'CartItem was added to card successfully',
  })
  @ApiBody({ type: AddToCartDto })
  public async addProductToCart(
    @Body(new ValidationPipe()) payload: AddToCartDto,
    @User() user: UserEntity,
  ): Promise<CartEntity> {
    return await this.cartService.addProductToCart(user.id, payload);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'CartItem updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found CartItem.',
  })
  @ApiBody({ type: UpdateCartItemDto })
  public async updateCartItem(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateCartItemDto,
  ): Promise<CartEntity> {
    return await this.cartService.updateCartItem(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'CartItem deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found CartItem.',
  })
  public async destroyCartItem(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<CartEntity> {
    return await this.cartService.destroyCartItem(id);
  }
}
