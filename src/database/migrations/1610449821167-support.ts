import { CreateCategoryDto, CreateCategoryElementDto } from 'src/modules/support';
import { CategoryQuestionAnswerEntity } from 'src/modules/support/category-question-answer.entity';
import { CategoryEntity } from 'src/modules/support/category.entity';
import { MigrationInterface, QueryRunner, Repository } from 'typeorm';

/**
 *
 * @initial data
 */
const supportInputPayload: CreateCategoryDto = {
  name: 'category 1',
  categoryElements: [
    {
      question: {
        name: 'first question',
      },
      answer: {
        name: 'first answer',
        content: 'first content',
      },
    },
    {
      question: {
        name: 'second question',
      },
      answer: {
        name: 'second answer',
        content: 'second content',
      },
    },
  ],
};

export class support1610449821167 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void[]> {
    const categoryEntityRepository: Repository<CategoryEntity> = connection.getRepository(
      CategoryEntity,
    );
    const category: CategoryEntity = categoryEntityRepository.create({
      name: supportInputPayload.name,
    });
    await categoryEntityRepository.save(category);
    const questionAnswers = [];

    supportInputPayload.categoryElements.forEach((categoryElement: CreateCategoryElementDto) => {
      questionAnswers.push({
        questionName: categoryElement.question.name,
        answerName: categoryElement.answer.name,
        answerContent: categoryElement.answer.name,
      });
    });

    const categoryQuestionAnswerEntityRepository: Repository<CategoryQuestionAnswerEntity> = connection.getRepository(
      CategoryQuestionAnswerEntity,
    );

    return await Promise.all(
      questionAnswers.map(async (categoryQuestionAnswer: CategoryQuestionAnswerEntity) => {
        const createdCategoryQuestionAnswer: CategoryQuestionAnswerEntity = categoryQuestionAnswerEntityRepository.create(
          {
            ...categoryQuestionAnswer,
            category,
          },
        );
        await categoryQuestionAnswerEntityRepository.save(createdCategoryQuestionAnswer);
      }),
    );
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(CategoryQuestionAnswerEntity).delete({});
    await connection.getRepository(CategoryEntity).delete({});
  }
}
