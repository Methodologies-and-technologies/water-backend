import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
} from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { PromotionEntity } from '../promotion/promotion.entity';

@Entity('product-promotion')
export class ProductPromotionEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Check(`"promotionId" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly promotionId: number;

  @Check(`"productId" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly productId: number;

  @ManyToOne(() => PromotionEntity, (promotion) => promotion.productPromotions, {
    onDelete: 'CASCADE',
  })
  public promotion: PromotionEntity;

  @ManyToOne(() => ProductEntity, (product) => product.productPromotions, { onDelete: 'CASCADE' })
  public product: ProductEntity;

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
