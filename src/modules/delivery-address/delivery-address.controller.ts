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
import { DeliveryAddressEntity } from './delivery-address.entity';
import { CreateDeliveryAddressDto } from './dto/create-delivery-address.dto';
import { PaginationDeliveryAddressDto } from './dto/pagination-delivery-address.dto';
import { QueryParamsDeliveryAddressDto } from './dto/query-delivery-address.dto';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto';
import { DeliveryAddressService } from './services';

@ApiTags('delivery-addresses')
@Controller('delivery-addresses')
export class DeliveryAddressController {
  constructor(private readonly deliveryAddressService: DeliveryAddressService) {}

  @Get()
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned all delivery address using pagination, query params.',
  })
  public async getAllDeliveryAddress(
    @Query() options?: QueryParamsDeliveryAddressDto,
  ): Promise<PaginationDeliveryAddressDto> {
    return this.deliveryAddressService.getAllDeliveryAddress(options);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returned a delivery address via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found delivery address.',
  })
  public async getDeliveryAddressById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<DeliveryAddressEntity> {
    return await this.deliveryAddressService.getDeliveryAddressById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Delivery address updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found delivery address.',
  })
  @ApiBody({ type: UpdateDeliveryAddressDto })
  public async updateDeliveryAddress(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateDeliveryAddressDto,
  ): Promise<DeliveryAddressEntity> {
    return await this.deliveryAddressService.updateDeliveryAddress(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Delivery address deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found delivery address.',
  })
  public async destroyDeliveryAddress(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<DeliveryAddressEntity> {
    return await this.deliveryAddressService.destroyDeliveryAddress(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Delivery address created successfully',
  })
  @ApiBody({ type: CreateDeliveryAddressDto })
  public async createOneDeliveryAddress(
    @Body(new ValidationPipe()) delivery: CreateDeliveryAddressDto,
    @User() user: UserEntity,
  ): Promise<DeliveryAddressEntity> {
    return await this.deliveryAddressService.createDeliveryAddress(delivery, user);
  }
}
