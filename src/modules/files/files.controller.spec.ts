import { ConflictException, NotFoundException } from '@nestjs/common';
import { classToClass, plainToClass } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify';

import * as utils from 'test/utils';
import { v4 as uuid } from 'uuid';

import { ErrorTypeEnum } from 'src/common/enums';
import { StorageService } from 'src/multipart';
import { DatabaseModule } from 'src/database';
import { ConfigModule } from 'src/config';

import { UserEntity } from '../user/user.entity';

import { FileEntity } from './file.entity';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let storageService: StorageService;

  const owner = plainToClass(UserEntity, { id: '067f2f3e-b936-4029-93d6-b2f58ae4f489' });
  const expected = plainToClass(FileEntity, {
    id: '548e456e-807e-41be-a8ee-bbca79f7c790',
    filename: 'eb8898d6-3927-4b17-9fea-7805eb8f5a1c',
    fileSize: '150',
    mimetype: 'image/jpg',
    encoding: '7bit',
    extname: '.jpg',
    createdAt: new Date('2021-01-15T05:43:30.034Z'),
    updatedAt: new Date('2021-01-15T05:43:30.034Z'),
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([FileEntity]), DatabaseModule, ConfigModule],
      controllers: [FilesController],
      providers: [
        FilesService,
        {
          provide: StorageService,
          useValue: {
            selectOne: ({ mimetype }: Partial<FileEntity>, rep: FastifyReply) =>
              rep.type(mimetype).send,
            createOne: () => expected,
            deleteOne: () => void 0,
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    it('should be return file entity', async () => {
      const received = await controller.createOne(owner, { file: expected }).then(classToClass);
      expect(received).toBeInstanceOf(FileEntity);
      expect(received).toEqual({ ...expected });
    });

    it('should be return conflict error', async () => {
      const error = new ConflictException(ErrorTypeEnum.FILE_ALREADY_EXIST);

      jest
        .spyOn(storageService, 'createOne')
        .mockImplementation(async () => ({ ...expected, fileSize: 0 }));

      return controller.createOne(owner, { file: undefined }).catch((err) => {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectAll', () => {
    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.FILES_NOT_FOUND);
      return controller.selectAll({ skip: -1 } as any).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('selectOne', () => {
    const conditions = { id: expected.id };

    it('should be return file entity', async () => {
      const received = await controller.selectOne(conditions);
      expect(received).toBeInstanceOf(FileEntity);
      expect(received).toEqual(expected);
    });
  });

  describe('downloadOne', () => {
    const conditions = { id: expected.id };

    it('should be return file stream', async () => {
      const { mimetype, buffer } = utils.createMockFileMeta(expected);
      const repMock = utils.createRepMock(mimetype, buffer);
      return controller.downloadOne(conditions, repMock);
    });

    it('should be return not found error', async () => {
      const { mimetype, buffer } = utils.createMockFileMeta();
      const repMock = utils.createRepMock(mimetype, buffer);
      const error = new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
      return controller.downloadOne({ id: uuid() }, repMock).catch((err) => {
        console.log(err);
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });

  describe('deleteOne', () => {
    const conditions = { id: expected.id };

    it('should be return file entity', async () => {
      const received = await controller.deleteOne(conditions);
      expect(received).toBeInstanceOf(FileEntity);
      expect(received.id).toBe(undefined);

      const error = new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
      return controller.deleteOne(conditions).catch((err) => {
        console.log(err);
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });

    it('should be return not found error', async () => {
      const error = new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
      return controller.deleteOne({ id: uuid() }).catch((err) => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err).toStrictEqual(error);
      });
    });
  });
});
