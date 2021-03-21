import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { MultipartModule } from 'src/multipart';

import { FileEntity } from './file.entity';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([FileEntity]),
    MultipartModule.register(),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
