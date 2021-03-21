import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Multipart } from 'fastify-multipart';
import { Expose } from 'class-transformer';
import {
  Check,
  Column,
  Entity,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('files')
export class FileEntity extends BaseEntity implements Partial<Multipart> {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('uuid')
  public readonly id: string;

  @Expose({ toClassOnly: true })
  @ApiProperty({ readOnly: true })
  get src(): string {
    return `${process.env.CDN}/${this.id}`;
  }

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly filename: string;

  @Check(`"fileSize" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly fileSize: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly mimetype: string;

  @Column({ type: 'varchar', length: 7 })
  @ApiProperty({ maxLength: 7, readOnly: true })
  public readonly encoding: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly extname: string;

  @ApiProperty({ readOnly: true })
  @CreateDateColumn({
    readonly: true,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public readonly createdAt: Date;

  @ApiProperty({ readOnly: true })
  @UpdateDateColumn({
    readonly: true,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public readonly updatedAt: Date;
}
