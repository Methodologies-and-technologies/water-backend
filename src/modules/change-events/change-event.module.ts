import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ChangeEventEntity } from './change-event.entity';
import { ChangeEventController } from './change-event.controller';
import { ChangeEventService } from './change-event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChangeEventEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ChangeEventController],
  providers: [ChangeEventService],
  exports: [ChangeEventService],
})
export class ChangeEventModule {}
