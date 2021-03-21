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
import { CreateQuestionDto } from './dto/create-question.dto';
import { PaginationQuestionDto } from './dto/pagination-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionEntity } from './question.entity';
import { QuestionService } from './services/question.service';
import { QueryParamsDto } from './dto/query-question.dto';

@ApiTags('question')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Returned all questions using pagination or query params.',
  })
  public async getAllQuestions(
    @Query(new ValidationPipe()) options?: QueryParamsDto,
  ): Promise<PaginationQuestionDto> {
    return this.questionService.getAllQuestions(options);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returned one questions via its id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not question send by user.',
  })
  public async getQuestionById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<QuestionEntity> {
    return await this.questionService.getQuestionById(id);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returned questions via user id.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not questions send by user.',
  })
  public async getQuestionsByUserId(@User() user: UserEntity): Promise<QuestionEntity[]> {
    return await this.questionService.getQuestionsByUserId(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
  })
  @ApiBody({ type: CreateQuestionDto })
  public async createQuestion(
    @Body(new ValidationPipe()) questionDto: CreateQuestionDto,
    @User() user: UserEntity,
  ): Promise<QuestionEntity> {
    return await this.questionService.createQuestion(questionDto, user);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Question updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found product.',
  })
  @ApiBody({ type: UpdateQuestionDto })
  public async updateQuestion(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body(new ValidationPipe()) data: UpdateQuestionDto,
  ): Promise<QuestionEntity> {
    return await this.questionService.updateQuestion(id, data);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'Question deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found question.',
  })
  public async destroyQuestion(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<QuestionEntity> {
    return await this.questionService.destroyQuestion(id);
  }
}
