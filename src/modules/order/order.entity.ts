import { ApiProperty } from '@nestjs/swagger';
import {
  Check,
  Column,
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CartEntity } from '../cart/cart.entity';
import { DeliveryAddressEntity } from '../delivery-address/delivery-address.entity';
import { UserEntity } from '../user/user.entity';

/**
 *
 * @class
 */
@Entity('orders')
export class OrderEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public status: string;

  @Check(`"orderNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public orderNumber: number;

  @Check(`"discount" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public discount: number;

  @Check(`"deliveryCost" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public deliveryCost: number;

  @Check(`"totalAmount" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public totalAmount: number;

  @Check(`"transactionId" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public transactionId: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public deliveryDate: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public comment: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public promocode: string;

  @Column({ type: 'bool', nullable: false, default: false })
  public createdFromSap: boolean;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public paymentMethod: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public deliveryTimeSlot: string;

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

  @OneToMany(() => CartEntity, (cart: CartEntity) => cart.order)
  public carts: CartEntity[];

  @ManyToOne(
    () => DeliveryAddressEntity,
    (deliveryAddress: DeliveryAddressEntity) => deliveryAddress.orders,
    { onDelete: 'CASCADE' },
  )
  public deliveryAddress: DeliveryAddressEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.orders, { onDelete: 'CASCADE' })
  public user: UserEntity;

  @Check(`"userId" > 0`)
  @Column({ type: 'bigint', nullable: true })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly userId: number;

  @Check(`"deliveryAddressId" > 0`)
  @Column({ type: 'bigint', nullable: true })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryAddressId: number;

  @Check(`"deliveryTimeSlotId" > 0`)
  @Column({ type: 'bigint', nullable: true })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly deliveryTimeSlotId: number;
}
