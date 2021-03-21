import { Module } from '@nestjs/common';
import { MosqueService } from './services/mosque.service';
import { MosqueController } from './mosque.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MosqueEntity } from './mosque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MosqueEntity])],
  providers: [MosqueService],
  controllers: [MosqueController],
  exports: [MosqueService],
})
export class MosqueModule {}
