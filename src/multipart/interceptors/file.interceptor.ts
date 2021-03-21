import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import {
  Inject,
  Optional,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
  PayloadTooLargeException,
} from '@nestjs/common';
import { BusboyConfig } from 'busboy';

import { MULTIPART_MODULE_OPTIONS } from '../multipart.constants';

import { StorageService } from '../storage.service';

export class FileInterceptor implements NestInterceptor {
  /**
   * [constructor description]
   * @param options [description]
   * @param storageService [description]
   */
  constructor(
    public readonly storageService: StorageService,

    @Optional()
    @Inject(MULTIPART_MODULE_OPTIONS)
    public readonly options?: BusboyConfig,
  ) {}

  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    request.body = {};

    try {
      for await (const part of request.parts(this.options)) {
        request.body[part.fieldname] = part.file
          ? await this.storageService.createOne(part)
          : part['value'];
      }
    } catch {
      throw new PayloadTooLargeException();
    }

    return next.handle();
  }
}
