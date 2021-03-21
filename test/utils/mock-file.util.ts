import * as crypto from 'crypto';
import * as stream from 'stream';
import * as uuid from 'uuid';
import * as fs from 'fs';

import { FileEntity } from 'src/modules/files/file.entity';
import { UploadedFile } from 'src/multipart/dto/uploaded-file.dto';
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

export const createMockUploadedFile = (data?: Partial<FileEntity>): UploadedFile => ({
  filename: uuid.v4(),
  fileSize: 150,
  mimetype: 'image/jpg',
  encoding: '7bit',
  extname: '.jpg',
  ...data,
});

export function createMockFileMeta(data?: Partial<CreateMockFileReturn>): CreateMockFileReturn {
  const filename = crypto.randomBytes(8).toString('hex') + '.png';
  const filePath = configService.getDest('STORE_DEST', filename);
  const encoding = '7bit';
  const mimetype = 'image/png';
  const buffer = crypto.randomBytes(64);
  const file = stream.Readable.from(buffer.toString());
  return Object.assign({ filename, encoding, mimetype, filePath, file, buffer }, data);
}

export function createMockFile(data?: Partial<CreateMockFileReturn>): CreateMockFileReturn {
  const { filename, encoding, mimetype, filePath, buffer } = createMockFileMeta();
  fs.writeFileSync(filePath, buffer);
  expect(fs.existsSync(filePath)).toEqual(true);
  return Object.assign({ filename, encoding, mimetype, filePath, buffer }, data);
}
