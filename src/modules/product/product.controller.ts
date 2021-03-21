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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationProductsDto } from './dto/pagination-product.dto';
import { QueryParamsDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard())
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    description: 'Returned all products using pagination or query params.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returned all products using pagination.',
  })
  public async getAllProducts(@Query() options?: QueryParamsDto): Promise<PaginationProductsDto> {
    return this.productService.getAllProducts(options);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned product via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not such product.',
  })
  public async getProductById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<ProductEntity> {
    return await this.productService.getProductById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiBody({ type: CreateProductDto })
  public async createProduct(
    @Body(new ValidationPipe()) productDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return await this.productService.createProduct(productDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found product.',
  })
  @ApiBody({ type: UpdateProductDto })
  public async updateProduct(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateProductDto,
  ): Promise<ProductEntity> {
    return await this.productService.updateProduct(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found product.',
  })
  public async destroyProduct(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<ProductEntity> {
    return await this.productService.destroyProduct(id);
  }
}
