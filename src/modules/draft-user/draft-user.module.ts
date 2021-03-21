import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftUserEntity } from './draft-user.entity';
import { DraftUserService } from './draft-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([DraftUserEntity])],
  providers: [DraftUserService],
  exports: [DraftUserService],
})
export class DraftUserModule {}
