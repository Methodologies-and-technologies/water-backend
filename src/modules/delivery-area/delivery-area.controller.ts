import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyOptionsDto } from 'src/common/dto';
import { DeliveryAreaEntity } from './delivery-area.entity';
import { PaginationDeliveryAreaDto } from './dto/pagination-delivery-area.dto';
import { DeliveryAreaService } from './services/delivery-area.service';

@ApiTags('delivery-area')
@Controller('delivery-area')
export class DeliveryAreaController {
  constructor(private readonly deliveryAreaService: DeliveryAreaService) {}

  @Get('/')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned all delivery areas using pagination.',
  })
  @ApiBearerAuth()
  public async getAllDeliveryAreas(
    @Query() options?: FindManyOptionsDto<DeliveryAreaEntity>,
  ): Promise<PaginationDeliveryAreaDto> {
    return await this.deliveryAreaService.getAllDeliveryAreas(options);
  }
}
