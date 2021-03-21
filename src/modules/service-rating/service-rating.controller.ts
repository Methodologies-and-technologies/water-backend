import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyOptionsDto } from 'src/common/dto';
import { PaginationServiceRatingDto } from './dto/pagination-service-rating.dto';
import { ServiceRatingEntity } from './service-rating.entity';
import { ServiceRatingService } from './services/service-rating.service';

@ApiTags('service-rating')
@Controller('service-rating')
export class ServiceRatingController {
  constructor(private readonly enjoyServiceInst: ServiceRatingService) {}

  @Get('/')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned ratings estimated by users using pagination.',
  })
  @UseGuards(AuthGuard())
  public async getAllRatings(
    @Query() options?: FindManyOptionsDto<ServiceRatingEntity>,
  ): Promise<PaginationServiceRatingDto> {
    return await this.enjoyServiceInst.getAllRatings(options);
  }
}
