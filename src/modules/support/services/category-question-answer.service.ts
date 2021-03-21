import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { createError } from 'src/common/helpers/error-handling.helpers';
import { Repository } from 'typeorm';
import { CategoryQuestionAnswerEntity } from '../category-question-answer.entity';
import { CategoryEntity } from '../category.entity';
import { CreateCategoryQuestionAnswerDto } from '../dto/create-category-question-answer.dto';
import { UpdateCategoryQuestionAnswerDto } from '../dto/update-category-question-answer.dto';

@Injectable()
export class CategoryQuestionAnswerService {
  constructor(
    @InjectRepository(CategoryQuestionAnswerEntity)
    private readonly categoryQuestionAnswerEntityRepository: Repository<
      CategoryQuestionAnswerEntity
    >,
  ) {}

  public async createCategoryQuestionAnswer(
    categoryQuestionAnswers: CreateCategoryQuestionAnswerDto[],
    category: CategoryEntity,
  ): Promise<CategoryQuestionAnswerEntity[]> {
    return await Promise.all(
      categoryQuestionAnswers.map(async (categoryQuestionAnswer: CategoryQuestionAnswerEntity) => {
        const createdCategoryQuestionAnswer: CategoryQuestionAnswerEntity = this.categoryQuestionAnswerEntityRepository.create(
          {
            ...categoryQuestionAnswer,
            category,
          },
        );
        return await this.categoryQuestionAnswerEntityRepository.save(
          createdCategoryQuestionAnswer,
        );
      }),
    );
  }

  public async getAllCategoryQuestionAnswers(): Promise<CategoryQuestionAnswerEntity[]> {
    return await this.categoryQuestionAnswerEntityRepository.find({ relations: ['category'] });
  }

  public async getCategoryQuestionAnswerById(id: number): Promise<CategoryQuestionAnswerEntity> {
    return await this.categoryQuestionAnswerEntityRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  public async updateCategoryQuestionAnswer(
    id: number,
    data: UpdateCategoryQuestionAnswerDto,
  ): Promise<CategoryQuestionAnswerEntity> {
    const categoryQuestionAnswer: CategoryQuestionAnswerEntity = await this.categoryQuestionAnswerEntityRepository.findOne(
      {
        where: { id },
      },
    );
    if (!categoryQuestionAnswer) {
      throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_ELEMENT_NOT_FOUND, 'id'));
    }
    await this.categoryQuestionAnswerEntityRepository.update(id, data);
    return await this.getCategoryQuestionAnswerById(id);
  }

  public async destroyCategoryQuestionAnswer(id: number): Promise<CategoryQuestionAnswerEntity> {
    const categoryQuestionAnswer: CategoryQuestionAnswerEntity = await this.categoryQuestionAnswerEntityRepository.findOne(
      {
        where: { id },
        relations: ['category'],
      },
    );
    if (!categoryQuestionAnswer) {
      throw new NotFoundException(createError(ErrorTypeEnum.CATEGORY_ELEMENT_NOT_FOUND, 'id'));
    }
    await this.categoryQuestionAnswerEntityRepository.delete(id);
    return categoryQuestionAnswer;
  }
}
