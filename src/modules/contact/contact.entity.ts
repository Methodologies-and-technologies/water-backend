import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

/**
 *
 * @class
 */
@Entity('contact')
export class ContactEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public address: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public phone: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public whatsApp: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public instagram: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public twitter: string;

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
