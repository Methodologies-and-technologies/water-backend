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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryItemDto } from './dto/update-category-item.dto';
import { QuestionCategoryService } from './services/support.service';

@ApiTags('question-categories')
@Controller('question-categories')
export class QuestionCategoryController {
  constructor(private readonly supportService: QuestionCategoryService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Category created with questions and answers successfully',
  })
  @UsePipes(new ValidationPipe())
  public async createCategory(
    @Body(new ValidationPipe()) categoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return await this.supportService.createCategory(categoryDto);
  }

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'Returned categories with relations: (questions and its answers).',
  })
  public async getAllCategories(): Promise<CategoryEntity[]> {
    return await this.supportService.getAllCategories();
  }

  @Put(':id')
  @ApiResponse({
    status: 204,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found category.',
  })
  @ApiBody({ type: UpdateCategoryItemDto })
  public async updateCategory(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateCategoryItemDto,
  ): Promise<CategoryEntity> {
    return await this.supportService.updateCategory(id, data);
  }

  @Get(':id')
  @ApiResponse({
    status: 204,
    description: 'Category returned by its successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found category.',
  })
  async getCategoryById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<CategoryEntity> {
    return await this.supportService.getCategoryById(id);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found category.',
  })
  public async destroyCategory(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<CategoryEntity> {
    return await this.supportService.destroyCategory(id);
  }
}
