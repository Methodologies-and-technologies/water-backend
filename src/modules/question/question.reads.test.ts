import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { TEST_VALID_CONFIRMATION_CODE } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { QuestionController } from './question.controller';
import { QuestionEntity } from './question.entity';
import { QuestionService } from './services';

describe('question reads test', () => {
  let app: NestFastifyApplication;

  interface UserPayload {
    readonly email: string;
    readonly phoneNumber: string;
    readonly fullName: string;
  }

  interface QuestionPayload extends UserPayload {
    readonly question: string;
  }

  let verifiedUser: UserPayload;
  let anotherUser: UserPayload;
  let token: string;
  let anotherToken: string;
  let firstQuestionId: string;
  let firstQuestion: QuestionPayload;
  let userId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([QuestionEntity]),
        DatabaseModule,
        ConfigModule,
        AuthModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
      ],
      controllers: [QuestionController],
      providers: [QuestionService],
    }).compile();

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
    userId = user.id;
  });

  beforeAll(async () => {
    const question = 'some question';

    firstQuestion = {
      question: question,
      email: anotherUser.email,
      phoneNumber: anotherUser.phoneNumber,
      fullName: anotherUser.fullName,
    };

    const { payload } = await app.inject({
      method: 'POST',
      url: '/question',
      payload: {
        question: question,
        email: anotherUser.email,
        phoneNumber: anotherUser.phoneNumber,
        fullName: anotherUser.fullName,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });

    firstQuestionId = JSON.parse(payload).id;

    await app.inject({
      method: 'POST',
      url: '/question',
      payload: {
        question: question.toUpperCase(),
        email: anotherUser.email,
        phoneNumber: anotherUser.phoneNumber,
        fullName: anotherUser.fullName,
      },
      headers: {
        authorization: 'Bearer ' + anotherToken,
      },
    });
  });

  // *****************************************************************************************************************
  // GET /api/questions
  // *****************************************************************************************************************

  it(`/GET questions, testing pagination result: (result and total)`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: '/question',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { result, total } = JSON.parse(questionPayload);
    expect(result).toBeDefined();
    expect(total).toEqual(2);
  });

  // *****************************************************************************************************************
  // GET /api/questions/id
  // *****************************************************************************************************************

  it(`/GET questions, failed case`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: '/question/a',
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(questionPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/GET question, test get method, entity is not found`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/question/${firstQuestionId + 4}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(questionPayload)).toEqual({
      message: 'QUESTION_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/GET question, test get method, entity is found by query: (userId)`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/question?userId=${userId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const {
      result: [firstRecord, secondRecord],
      total,
    } = JSON.parse(questionPayload);

    expect(userId).toEqual(firstRecord.userId);
    expect(userId).toEqual(secondRecord.userId);
    expect(total).toEqual(2);
  });

  it(`/GET question, test get method, entity is not found by query: (userId is not valid)`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/question?userId=invalid userId`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(questionPayload)).toEqual({
      statusCode: 400,
      message: ['userId must be an integer number'],
      error: 'Bad Request',
    });
  });

  it(`/GET question, test get method, entity is found`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/question/${firstQuestionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { id, question } = JSON.parse(questionPayload);

    expect(id).toEqual(firstQuestionId);
    expect(question).toEqual(firstQuestion.question);
  });

  afterAll(async () => {
    await app.close();
  });
});
