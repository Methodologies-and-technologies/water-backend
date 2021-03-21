import { FastifyMultipartOptions } from 'fastify-multipart';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';

export type MultipartModuleOptions = FastifyMultipartOptions;

export interface MultipartOptionsFactory {
  createMultipartOptions(): Promise<MultipartModuleOptions> | MultipartModuleOptions;
}

export interface MultipartModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MultipartOptionsFactory>;
  useClass?: Type<MultipartOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MultipartModuleOptions> | MultipartModuleOptions;
  inject?: any[];
}
