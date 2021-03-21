import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { PaginationQuestionDto } from '../dto/pagination-question.dto';
import { QuestionEntity } from '../question.entity';
import { createError } from '../../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../../common/enums';
import { QueryParamsDto } from '../dto/query-question.dto';
import { QUERY_PARAMS } from '../question.constants';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
  ) {}

  public async getAllQuestions(options: QueryParamsDto): Promise<PaginationQuestionDto> {
    const optionsKeys: string[] = Object.keys(options || []);
    const data: [QuestionEntity[], number] = optionsKeys.includes(QUERY_PARAMS)
      ? await this.questionRepository.findAndCount({
          where: { userId: options.userId },
          take: 10,
          skip: 0,
        })
      : ((options = { take: 10, skip: 0 } as any),
        await this.questionRepository.findAndCount({
          ...options,
        }));

    return new PaginationQuestionDto(data);
  }

  public async createQuestion(
    question: Partial<QuestionEntity>,
    user: UserEntity,
  ): Promise<QuestionEntity> {
    const createdQuestion: QuestionEntity = this.questionRepository.create({
      ...question,
      user: user,
    });
    await this.questionRepository.save(createdQuestion);
    return await this.getQuestionById(createdQuestion.id);
  }

  public async getQuestionsByUserId(id: number): Promise<QuestionEntity[]> {
    const questions: QuestionEntity[] = await this.questionRepository.find({
      where: { userId: id },
    });
    return questions;
  }

  public async updateQuestion(id: number, data: Partial<QuestionEntity>): Promise<QuestionEntity> {
    let question: QuestionEntity = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(createError(ErrorTypeEnum.QUESTION_NOT_FOUND, 'id'));
    }
    await this.questionRepository.update(id, data);
    question = await this.questionRepository.findOne({ where: { id } });
    return question;
  }

  public async getQuestionById(id: number): Promise<QuestionEntity> {
    const question: QuestionEntity = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(createError(ErrorTypeEnum.QUESTION_NOT_FOUND, 'id'));
    }
    return question;
  }

  public async destroyQuestion(id: number): Promise<QuestionEntity> {
    const question: QuestionEntity = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(createError(ErrorTypeEnum.QUESTION_NOT_FOUND, 'id'));
    }
    await this.questionRepository.delete(id);
    return question;
  }
}
