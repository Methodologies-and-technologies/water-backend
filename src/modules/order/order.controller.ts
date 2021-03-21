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
import { User } from '../user/user.decorator';
import { UserEntity } from '../user/user.entity';
import { CalculateOrderResponse } from './calculate-order.interface';
import { PaginationOrdersDto, QueryParamsOrderDto, UpdateOrderDto } from './dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './order.entity';
import { OrderService } from './order.service';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiBody({ type: CreateOrderDto })
  public async createOrder(
    @Body(new ValidationPipe()) orderDto: CreateOrderDto,
    @User() user: UserEntity,
  ): Promise<OrderEntity | CalculateOrderResponse> {
    return await this.orderService.createOrder(orderDto, user);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all orders using pagination or query params.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returned all orders using pagination.',
  })
  public async getAllOrders(@Query() options?: QueryParamsOrderDto): Promise<PaginationOrdersDto> {
    return this.orderService.getAllOrders(options);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned order via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not such order.',
  })
  public async getOrderById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<OrderEntity> {
    return await this.orderService.getOrderById(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found order.',
  })
  public async destroyOrder(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<OrderEntity> {
    return await this.orderService.destroyOrder(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Order updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found order.',
  })
  @ApiBody({ type: UpdateOrderDto })
  public async updateOrder(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateOrderDto,
  ): Promise<OrderEntity> {
    return await this.orderService.updateOrder(id, data);
  }
}
