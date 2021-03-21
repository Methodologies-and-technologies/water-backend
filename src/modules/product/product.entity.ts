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
import { CartEntity } from '../cart/cart.entity';
import { FileEntity } from '../files/file.entity';
import { ProductPromotionEntity } from './product-promotion.entity';

/**
 *
 * @class
 */
@Entity('products')
export class ProductEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'varchar', nullable: true })
  public readonly sapId: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public type: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public title: string;

  @Check(`"capacity" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public capacity: number;

  @Check(`"packCapacity" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public packCapacity: number;

  @Check(`"pricePerItem" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public pricePerItem: number;

  @Check(`"totalPrice" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public totalPrice: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public about: string;

  @Check(`"minOrder" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public minOrder: number;

  @Check(`"maxOrder" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public maxOrder: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public promotions: string;

  @Check(`"freeProducts" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public freeProducts: number;

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

  @OneToMany(() => CartEntity, (cart) => cart.product)
  public cartItems: CartEntity[];

  @OneToMany(() => ProductPromotionEntity, (productPromotion) => productPromotion.product)
  public productPromotions: ProductPromotionEntity[];
}
