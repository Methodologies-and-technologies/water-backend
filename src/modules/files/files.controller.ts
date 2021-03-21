import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor, StorageService } from 'src/multipart';
import { FindManyOptionsDto, FindOneOptionsDto, ID } from 'src/common/dto';
import { User } from '../user/user.decorator';

import { UserEntity } from '../user/user.entity';

import { FileUploadDto, PaginationFilesDto } from './dto';
import { FileEntity } from './file.entity';

import { FilesService } from './files.service';
import { createError } from '../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../common/enums';

@ApiTags('files')
@Controller('files')
@UseInterceptors(ClassSerializerInterceptor)
export class FilesController {
  constructor(
    private readonly storageService: StorageService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor)
  public async createOne(
    @User() owner: UserEntity,
    @Body() { file }: FileUploadDto,
  ): Promise<FileEntity> {
    return this.filesService.createOne({ ...file });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  public async selectAll(
    @User() owner: UserEntity,
    @Query() options?: FindManyOptionsDto<FileEntity>,
  ): Promise<PaginationFilesDto> {
    return this.filesService.selectAll({ ...options /*, where: { owner }*/ });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  public async selectOne(
    @Param() conditions: ID,
    @Query() options?: FindOneOptionsDto<FileEntity>,
  ): Promise<FileEntity> {
    return this.filesService.selectOne(conditions, options);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  public async deleteOne(@Param() conditions: ID): Promise<FileEntity> {
    return this.filesService.deleteOne({ ...conditions });
  }

  @Get('download/:id')
  public async downloadOne(
    @Param() conditions: ID,
    @Res() rep: FastifyReply,
  ): Promise<FastifyReply> {
    const file = await this.filesService.selectOne(conditions);
    if (!file) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'id'));
    }
    return this.storageService.selectOne(file, rep);
  }
}
