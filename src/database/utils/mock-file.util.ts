import * as crypto from 'crypto';
import * as stream from 'stream';

import { ConfigService } from 'src/config';

const configService = new ConfigService();

export interface CreateMockFileReturn {
  filename: string;
  encoding: string;
  mimetype: string;
  filePath: string;
  buffer: Buffer;
  file?: stream.Readable;
}

export function createMockFileMeta(data?: Partial<CreateMockFileReturn>): CreateMockFileReturn {
  const filename = crypto.randomBytes(8).toString('hex') + '.png';
  const filePath = configService.getDest('STORE_DEST', filename);
  const encoding = '7bit';
  const mimetype = 'image/png';
  const buffer = crypto.randomBytes(64);
  const file = stream.Readable.from(buffer.toString());
  return Object.assign({ filename, encoding, mimetype, filePath, file, buffer }, data);
}
