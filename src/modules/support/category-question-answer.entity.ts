import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from './category.entity';

/**
 *
 * @class
 */
@Entity({ name: 'category-question-answer' })
export class CategoryQuestionAnswerEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly questionName: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly answerName: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly answerContent: string;

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

  @ManyToOne(
    () => CategoryEntity,
    (category: CategoryEntity) => category.categoryQuestionsAnswers,
    { onDelete: 'CASCADE' },
  )
  category: CategoryEntity;

  @Check(`"categoryId" > 0`)
  @Column({ type: 'bigint', nullable: true })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly categoryId: number;
}
