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
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { PaginationPromotionDto } from './dto/pagination-promotion.dto';
import { QueryParamsPromotionDto } from './dto/query-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionEntity } from './promotion.entity';
import { PromotionService } from './promotion.service';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all promotions using pagination or query params.',
  })
  @ApiResponse({ status: 200, description: 'Returned all products using pagination.' })
  public async getAllPromotions(
    @Query() options?: QueryParamsPromotionDto,
  ): Promise<PaginationPromotionDto> {
    return this.promotionService.getAllPromotions(options);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned promotions via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not such promotions.',
  })
  public async getPromotionById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<PromotionEntity> {
    return await this.promotionService.getPromotionById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Promotions created successfully',
  })
  @ApiBody({ type: CreatePromotionDto })
  public async createPromotion(
    @Body(new ValidationPipe()) productDto: CreatePromotionDto,
  ): Promise<PromotionEntity> {
    return await this.promotionService.createPromotion(productDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Promotions updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found promotions.',
  })
  @ApiBody({ type: UpdatePromotionDto })
  public async updatePromotion(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdatePromotionDto,
  ): Promise<PromotionEntity> {
    return await this.promotionService.updatePromotion(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Promotions deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found promotions.',
  })
  public async destroyPromotion(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<PromotionEntity> {
    return await this.promotionService.destroyPromotion(id);
  }
}
