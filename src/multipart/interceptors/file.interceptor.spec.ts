import { CallHandler, NestInterceptor, PayloadTooLargeException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Multipart } from 'fastify-multipart';
import { of } from 'rxjs';

import * as utils from 'test/utils';

import { StorageService } from '../storage.service';
import { FileInterceptor } from './file.interceptor';

describe('FileInterceptor', () => {
  let interceptor: NestInterceptor;
  let next: CallHandler;

  beforeEach(async () => {
    interceptor = new FileInterceptor({
      createOne: (data: Partial<Multipart>) => data,
    } as StorageService);

    next = {
      handle: () => of('test'),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should be return mock file', async () => {
    const file = utils.createMockFileMeta();
    const data = [
      { fieldname: 'file', ...file },
      { fieldname: 'title', value: 'value' },
    ];

    const parts = async function* () {
      for (const part of data) yield part;
    };

    const context = new ExecutionContextHost([{ parts, body: undefined }]);
    await interceptor.intercept(context, next);
    expect(context.switchToHttp().getRequest().body.file.filename).toBe(file.filename);
    expect(context.switchToHttp().getRequest().body.title).toBe('value');
  });

  it('should be return http error', async () => {
    const data = [Promise.reject()];
    const parts = async function* () {
      for (const part of data) yield part;
    };

    const context = new ExecutionContextHost([{ parts }]);
    try {
      await interceptor.intercept(context, next);
    } catch (e) {
      expect(e).toEqual(new PayloadTooLargeException());
    }
  });
});
