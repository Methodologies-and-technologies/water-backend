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
import { OrderEntity } from '../order/order.entity';
import { ProductEntity } from '../product/product.entity';
import { UserEntity } from '../user/user.entity';

@Entity('cart')
export class CartEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Check(`"userId" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly userId: number;

  @Check(`"productId" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly productId: number;

  @Check(`"quantity" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public quantity: number;

  @ManyToOne(() => UserEntity, (user) => user.cartItems, { onDelete: 'CASCADE' })
  public user: UserEntity;

  @ManyToOne(() => ProductEntity, (product) => product.cartItems, { onDelete: 'CASCADE' })
  public product: ProductEntity;

  @ManyToOne(() => OrderEntity, (order: OrderEntity) => order.carts, { onDelete: 'CASCADE' })
  public order: OrderEntity;

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
