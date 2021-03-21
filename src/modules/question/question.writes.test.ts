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

describe('question writes test', () => {
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
  // POST /api/question
  // *****************************************************************************************************************

  it(`/POST question`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'POST',
      url: '/question',
      payload: {
        fullName: 'name',
        email: 'email.com',
        phoneNumber: 123,
        question: '//QUESTION:',
      },
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { message, statusCode } = JSON.parse(questionPayload);
    expect(message).toEqual('Unauthorized');
    expect(statusCode).toEqual(401);
  });

  it(`/POST question, test get method, entity is found`, async () => {
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

  // *****************************************************************************************************************
  // PUT /api/question/id
  // *****************************************************************************************************************

  it(`/PUT question`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'PUT',
      url: '/question/a',
      payload: {
        question: 'question:',
      },
      headers: {
        authorization: 'Token ' + token,
      },
    });
    const { error, message, statusCode } = JSON.parse(questionPayload);
    expect(error).toEqual('Not Acceptable');
    expect(message).toEqual('Validation failed (numeric string is expected)');
    expect(statusCode).toEqual(406);
  });

  it(`/PUT question, test get method, put -> get`, async () => {
    const question = 'new question is set';

    const { payload: updatedQuestion } = await app.inject({
      method: 'PUT',
      url: `/question/${firstQuestionId}`,
      payload: {
        question: question,
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { user: theSameUser, question: questionUp } = JSON.parse(updatedQuestion);

    const { payload: questionPayload } = await app.inject({
      method: 'GET',
      url: `/question/${firstQuestionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { id, question: q } = JSON.parse(questionPayload);

    expect(id).toEqual(firstQuestionId);
    expect(questionUp).toEqual(q);
  });

  it(`/PUT question, test get method, entity is not found for update`, async () => {
    const question = 'new question is set';

    const { payload: questionPayload } = await app.inject({
      method: 'PUT',
      url: `/question/${firstQuestionId + 4}`,
      payload: {
        question: question.toUpperCase(),
      },
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(questionPayload)).toEqual({
      message: 'QUESTION_NOT_FOUND',
      property: 'id',
    });
  });

  // *****************************************************************************************************************
  // DELETE /api/question/id
  // *****************************************************************************************************************

  it(`/DELETE question`, async () => {
    const { payload: questionPayload } = await app.inject({
      method: 'DELETE',
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

  it(`/DELETE question, delete -> get`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/question/${firstQuestionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const { payload: searchData } = await app.inject({
      method: 'GET',
      url: `/question/${firstQuestionId}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(searchData)).toEqual({
      message: 'QUESTION_NOT_FOUND',
      property: 'id',
    });
  });

  it(`/DELETE question, get: no such entity`, async () => {
    const { payload } = await app.inject({
      method: 'DELETE',
      url: `/question/${firstQuestionId + 9}`,
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    expect(JSON.parse(payload)).toEqual({
      message: 'QUESTION_NOT_FOUND',
      property: 'id',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
