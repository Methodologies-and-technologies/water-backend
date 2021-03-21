import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { CategoryQuestionAnswerEntity } from './category-question-answer.entity';
import { CategoryEntity } from './category.entity';
import { CategoryQuestionAnswerService } from './services/category-question-answer.service';
import { QuestionCategoryService } from './services/support.service';
import { QuestionCategoryController } from './support.controller';

describe('support writes test', () => {
  let app: NestFastifyApplication;
  let categoryQuestionAnswerService: CategoryQuestionAnswerService;

  interface UserPayload {
    email: string;
    phoneNumber: string;
    fullName: string;
  }

  interface CategoryPayload {
    name: string;
    categoryElements: Array<{
      question: {
        name: string;
      };
      answer: {
        name: string;
        content: string;
      };
    }>;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;
  let firstCategoryId: string;
  let firstCategory: CategoryPayload;
  let categoryElements;
  let userId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([CategoryEntity, CategoryQuestionAnswerEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [QuestionCategoryController],
      providers: [QuestionCategoryService, CategoryQuestionAnswerService],
    }).compile();

    categoryQuestionAnswerService = module.get<CategoryQuestionAnswerService>(
      CategoryQuestionAnswerService,
    );
    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();

    verifiedUser = {
      email: 'nfe123@gmail1111.com',
      phoneNumber: '+380990373954',
      fullName: 'nfe-ncs123',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: verifiedUser.email,
        phoneNumber: verifiedUser.phoneNumber,
        fullName: verifiedUser.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: verifiedUser.phoneNumber,
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: verifiedUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const registratedUser = JSON.parse(userPayload);
    token = registratedUser.accessToken;
  });

  beforeAll(async () => {
    anotherUser = {
      email: 'nse113@gmail1111.com',
      phoneNumber: '+380992373914',
      fullName: 'nfen+cs123',
    };

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: anotherUser.email,
        phoneNumber: anotherUser.phoneNumber,
        fullName: anotherUser.fullName,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/auth/send-confirmation-code',
      payload: {
        phoneNumber: anotherUser.phoneNumber,
      },
    });

    const { payload: userPayload } = await app.inject({
      method: 'POST',
      url: '/auth/verify-confirmation-code',
      payload: {
        phoneNumber: anotherUser.phoneNumber,
        confirmationCode: TEST_VALID_CONFIRMATION_CODE,
      },
    });

    const user = JSON.parse(userPayload);
    anotherToken = user.accessToken;
  });

  // *****************************************************************************************************************
  // POST /api/question-categories
  // *****************************************************************************************************************

  it(`/POST question-categories`, async () => {
    firstCategory = {
      name: 'category 123',
      categoryElements: [
        {
          question: {
            name: '122 question',
          },
          answer: {
            name: '122 answer',
            content: '122 content',
          },
        },
        {
          question: {
            name: '222 question',
          },
          answer: {
            name: '222 answer',
            content: '222 content',
          },
        },
      ],
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/question-categories',
      payload: {
        name: firstCategory.name,
        categoryElements: firstCategory.categoryElements,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstCategoryId = JSON.parse(payload).id;

    const { payload: data } = await app.inject({
      method: 'GET',
      url: `/question-categories/${firstCategoryId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { name, categoryQuestionsAnswers } = JSON.parse(data);
    expect(name).toEqual(firstCategory.name);
    expect(categoryQuestionsAnswers).toBeDefined();
  });

  // *****************************************************************************************************************
  // PUT /api/question-categories/{id}
  // *****************************************************************************************************************

  it(`/PUT question-categories`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'PUT',
      url: '/question-categories/a',
      payload: {
        name: firstCategory.name.toUpperCase(),
        content: firstCategory.categoryElements,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { error, message, statusCode } = JSON.parse(notificationPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT question-categories, test get method, put -> get`, async () => {
    const dataForUpdate = {
      questionName: 'updated name for question 111 (updated)',
      answerContent: 'hello world (updated)',
      categoryItemId: 2,
      name: 'new name for category 123 (updated)',
    };

    const { payload: updatedNotifications } = await app.inject({
      method: 'PUT',
      url: `/question-categories/${firstCategoryId}`,
      payload: {
        questionName: dataForUpdate.questionName,
        answerContent: dataForUpdate.answerContent,
        categoryItemId: dataForUpdate.categoryItemId,
        name: dataForUpdate.name,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { name: newName, categoryQuestionsAnswers: newCategoryQuestionsAnswers } = JSON.parse(
      updatedNotifications,
    );

    const { payload: notificationPayload } = await app.inject({
      method: 'GET',
      url: `/question-categories/${firstCategoryId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      name: updatedName,
      categoryQuestionsAnswers: updatedCategoryQuestionsAnswers,
    } = JSON.parse(notificationPayload);

    expect(newName).toEqual(updatedName);
    expect(newCategoryQuestionsAnswers).toEqual(updatedCategoryQuestionsAnswers);
  });

  it(`/PUT question-categories, test get method, entity is not found for update`, async () => {
    const dataForUpdate = {
      questionName: 'updated name for question 111 (updated)',
      answerContent: 'hello world (updated)',
      categoryItemId: 2,
      name: 'new name for category 123 (updated)',
    };

    const { payload } = await app.inject({
      method: 'PUT',
      url: `/question-categories/${firstCategoryId + 39}`,
      payload: {
        questionName: dataForUpdate.questionName,
        answerContent: dataForUpdate.answerContent,
        categoryItemId: dataForUpdate.categoryItemId,
        name: dataForUpdate.name,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'CATEGORY_NOT_FOUND',
      property: 'id',
    });
  });

  // *****************************************************************************************************************
  // DELETE /api/question-categories/{id}
  // *****************************************************************************************************************

  it(`/DELETE question-categories`, async () => {
    const { payload: notificationPayload } = await app.inject({
      method: 'DELETE',
      url: '/question-categories/a',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(notificationPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/DELETE question-categories, delete -> get`, async () => {
    await app.inject({
      method: 'DELETE',
      url: `/question-categories/${firstCategoryId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/question-categories/${firstCategoryId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'CATEGORY_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/DELETE question-categories, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/question-categories/${firstCategoryId + 9}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'CATEGORY_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
