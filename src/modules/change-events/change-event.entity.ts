import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { EntityOperationEnum } from '../../common/enums/entity-operation.enum';

@Entity('change_event')
export class ChangeEventEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'varchar', nullable: false })
  public type: EntityTypeEnum;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'varchar', nullable: false })
  public operation: EntityOperationEnum;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'json', nullable: false })
  public data: string;

  @ApiProperty()
  @Column({ type: 'bool', nullable: false })
  public isProcessed: boolean;

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
