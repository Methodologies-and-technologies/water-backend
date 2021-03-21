import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryQuestionAnswerEntity } from './category-question-answer.entity';
import { CategoryEntity } from './category.entity';
import { CategoryQuestionAnswerService, QuestionCategoryService } from './services';
import { QuestionCategoryController } from './support.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, CategoryQuestionAnswerEntity])],
  providers: [QuestionCategoryService, CategoryQuestionAnswerService],
  controllers: [QuestionCategoryController],
  exports: [QuestionCategoryService],
})
export class SupportModule {}
