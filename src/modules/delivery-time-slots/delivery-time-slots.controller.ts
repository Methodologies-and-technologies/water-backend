import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyOptionsDto } from 'src/common/dto';
import { DeliveryTimeSlotsEntity } from './delivery-time-slots.entity';
import { PaginationDeliveryTimeSlotsDto } from './dto/pagination-delivery-time-slots.dto';
import { DeliveryTimeSlotsService } from './services/delivery-time-slots.service';

@ApiTags('delivery-time-slots')
@Controller('delivery-time-slots')
export class DeliveryTimeSlotsController {
  constructor(private readonly deliveryTimeSlotsService: DeliveryTimeSlotsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returned all deliveryTimeSlots.',
  })
  public async getAllDeliveryTimeSlots(
    @Query() options?: FindManyOptionsDto<DeliveryTimeSlotsEntity>,
  ): Promise<PaginationDeliveryTimeSlotsDto> {
    return await this.deliveryTimeSlotsService.getAllDeliveryTimeSlots(options);
  }
}
