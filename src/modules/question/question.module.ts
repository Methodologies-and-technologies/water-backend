import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './question.controller';
import { QuestionEntity } from './question.entity';
import { QuestionService } from './services/question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
