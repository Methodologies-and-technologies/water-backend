import { Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Multipart } from 'fastify-multipart';
import { FastifyReply } from 'fastify';

import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

import { ErrorTypeEnum } from 'src/common/enums';
import { ConfigService } from 'src/config';

import { UploadedFile } from './dto';

/**
 * [StorageService description]
 * @return [description]
 */
@Injectable()
export class StorageService {
  /**
   * [options description ]
   */
  private readonly options = {
    mode: parseInt('0700', 8),
  };

  /**
   * [allowedTypes description ]
   */
  private readonly allowedTypes: string[];

  /**
   * [destination description ]
   */
  private readonly destination: string;

  /**
   * [constructor description]
   * @param configService [description]
   */
  constructor(private readonly configService: ConfigService) {
    this.allowedTypes = this.configService.get('STORE_MIME_TYPE');
    this.destination = this.configService.getDest('STORE_DEST');

    if (!fs.existsSync(this.destination)) fs.mkdirSync(this.destination, this.options);
  }

  /**
   * [createOne description]
   *
   * @params multipart {Multipart}
   * @return [description]
   */
  public async createOne(data: Partial<Multipart>): Promise<UploadedFile> {
    if (!this.allowedTypes.includes(data.mimetype)) throw new UnsupportedMediaTypeException();

    const { file, encoding, mimetype } = data;
    const extname = path.extname(data.filename);
    const filename = crypto.randomBytes(16).toString('hex');
    const filePath = path.join(this.destination, filename);

    let fileSize = 0;

    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath, this.options);
      return file
        .on('data', (data) => (fileSize += data.length))
        .on('error', reject)
        .on('end', resolve)
        .pipe(stream);
    }).catch(() => this.deleteOne(filename));

    return new UploadedFile({
      extname,
      filename,
      mimetype,
      encoding,
      fileSize,
    });
  }

  /**
   * [createOne description]
   * @params file {FileEntity}
   * @return [description]
   */
  public selectOne({ filename, mimetype }: Partial<Multipart>, rep: FastifyReply): FastifyReply {
    const fileDest = path.join(this.destination, filename);
    try {
      const buffer = fs.readFileSync(fileDest);
      return rep.type(mimetype).send(buffer);
    } catch (e) {
      throw new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
    }
  }

  /**
   * [createOne description]
   * @param filename {string}
   * @return [description]
   */
  public deleteOne(filename: string): void {
    const fileDest = path.join(this.destination, filename);
    try {
      return fs.unlinkSync(fileDest);
    } catch (e) {
      throw new NotFoundException(ErrorTypeEnum.FILE_NOT_FOUND);
    }
  }
}
