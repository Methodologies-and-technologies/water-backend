import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { UploadedFile } from 'src/multipart';

export class FileUploadDto {
  /**
   * Fastify multipart instance
   */
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'binary',
    description: 'multipart file field',
  })
  public readonly file: UploadedFile;
}
