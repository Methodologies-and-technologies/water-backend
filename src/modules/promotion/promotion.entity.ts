import { ApiProperty } from '@nestjs/swagger';
import {
  Check,
  Column,
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { FileEntity } from '../files/file.entity';
import { ProductPromotionEntity } from '../product/product-promotion.entity';

/**
 *
 * @class
 */
@Entity('promotions')
export class PromotionEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'varchar', nullable: true })
  public readonly sapId: string;

  @Check(`"paidPacks" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly paidPacks: number;

  @Check(`"price" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly price: number;

  @Check(`"freePacks" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly freePacks: number;

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

  @Column({ type: 'varchar', length: 25611, nullable: true })
  @ApiProperty({ maxLength: 25611 })
  public imageUrl: string;

  @OneToOne(() => FileEntity)
  @JoinColumn()
  public image: FileEntity;

  @OneToMany(() => ProductPromotionEntity, (productPromotion) => productPromotion.promotion)
  public productPromotions: ProductPromotionEntity[];
}
