import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import {
  Repository,
  SaveOptions,
  RemoveOptions,
  FindConditions,
  FindOneOptions,
  FindManyOptions,
} from 'typeorm';

import { ErrorTypeEnum } from 'src/common/enums';

import { PaginationFilesDto } from './dto';
import { FileEntity } from './file.entity';

import { StorageService } from 'src/multipart';
import { createError } from '../../common/helpers/error-handling.helpers';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileEntityRepository: Repository<FileEntity>,
    private readonly storageService: StorageService,
  ) {}

  public async createOne(
    entityLike: Partial<FileEntity>,
    options: SaveOptions = { transaction: false },
  ): Promise<FileEntity> {
    return this.fileEntityRepository.manager.transaction(async () => {
      const entity = this.fileEntityRepository.create(entityLike);
      return this.fileEntityRepository.save(entity, options).catch(() => {
        this.storageService.deleteOne(entityLike.filename);
        throw new ConflictException(ErrorTypeEnum.FILE_ALREADY_EXIST);
      });
    });
  }

  public async selectAll(options?: FindManyOptions<FileEntity>): Promise<PaginationFilesDto> {
    return this.fileEntityRepository
      .findAndCount(classToPlain(options))
      .then((data) => new PaginationFilesDto(data))
      .catch(() => {
        throw new NotFoundException(ErrorTypeEnum.FILES_NOT_FOUND);
      });
  }

  public async selectOne(
    conditions: FindConditions<FileEntity>,
    options: FindOneOptions<FileEntity> = { loadEagerRelations: false },
  ): Promise<FileEntity> {
    return this.fileEntityRepository.findOne(conditions, options);
  }

  public async deleteOne(
    conditions: FindConditions<FileEntity>,
    options: RemoveOptions = { transaction: false },
  ): Promise<FileEntity> {
    return this.fileEntityRepository.manager.transaction(async () => {
      const entity = await this.selectOne(conditions);
      if (!entity) {
        throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'id'));
      }
      this.storageService.deleteOne(entity.filename);
      return this.fileEntityRepository.remove(entity, options).catch(() => {
        throw new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
      });
    });
  }
}
