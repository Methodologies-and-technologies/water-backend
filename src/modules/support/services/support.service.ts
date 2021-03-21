import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryItemDto } from '../dto/update-category-item.dto';
import { CategoryQuestionAnswerService } from './category-question-answer.service';

@Injectable()
export class QuestionCategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryEntityRepository: Repository<CategoryEntity>,
    private readonly categoryQuestionAnswerService: CategoryQuestionAnswerService,
  ) {}

  public async getAllCategories() {
    return await this.categoryEntityRepository.find({
      relations: ['categoryQuestionsAnswers'],
    });
  }

  public async createCategory(dataPayload: CreateCategoryDto): Promise<CategoryEntity> {
    const category: CategoryEntity = this.categoryEntityRepository.create({
      name: dataPayload.name,
    });
    await this.categoryEntityRepository.save(category);
    const questionAnswers = [];

    dataPayload.categoryElements.forEach((categoryElement) => {
      questionAnswers.push({
        questionName: categoryElement.question.name,
        answerName: categoryElement.answer.name,
        answerContent: categoryElement.answer.name,
      });
    });

    await this.categoryQuestionAnswerService.createCategoryQuestionAnswer(
      questionAnswers,
      category,
    );
    return await this.categoryEntityRepository.findOne({
      where: { id: category.id },
      relations: ['categoryQuestionsAnswers'],
    });
  }

  public async getCategoryById(id: number): Promise<CategoryEntity> {
    const category: CategoryEntity = await this.categoryEntityRepository.findOne({
      where: { id },
      relations: ['categoryQuestionsAnswers'],
    });

    if (!category) {
      throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_NOT_FOUND, 'id'));
    }
    return category;
  }

  public async updateCategory(id: number, data: UpdateCategoryItemDto): Promise<CategoryEntity> {
    const category: CategoryEntity = await this.getCategoryById(id);

    if (data.categoryItemId) {
      if (
        !(await this.categoryQuestionAnswerService.getCategoryQuestionAnswerById(
          data.categoryItemId,
        ))
      ) {
        throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_ELEMENT_NOT_FOUND, 'id'));
      } else {
        const { categoryItemId, name, ...dataToUpdate } = data;
        await this.categoryQuestionAnswerService.updateCategoryQuestionAnswer(
          data.categoryItemId,
          dataToUpdate,
        );
      }
    }
    if (!category) {
      throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_NOT_FOUND, 'id'));
    }
    await this.categoryEntityRepository.update(id, { name: data.name || category.name });
    return await this.getCategoryById(id);
  }

  public async destroyCategory(id: number): Promise<CategoryEntity> {
    const category: CategoryEntity = await this.getCategoryById(id);
    if (!category) {
      throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_NOT_FOUND, 'id'));
    }
    await this.categoryEntityRepository.delete(id);
    return category;
  }
}
