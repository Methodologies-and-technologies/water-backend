import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 *
 * @class
 */
@Entity({ name: 'mosque' })
export class MosqueEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly name: string;

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
