import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyOptionsDto } from 'src/common/dto';
import { PaginationMosqueDto } from './dto/pagination-mosque.dto';
import { MosqueEntity } from './mosque.entity';
import { MosqueService } from './services/mosque.service';

@ApiTags('mosque')
@Controller('mosque')
export class MosqueController {
  constructor(private readonly mosqueService: MosqueService) {}

  @Get()
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned all mosque.',
  })
  public async getAllMosque(
    @Query() options?: FindManyOptionsDto<MosqueEntity>,
  ): Promise<PaginationMosqueDto> {
    return await this.mosqueService.getAllMosque(options);
  }
}
