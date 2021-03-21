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
  TableUnique,
} from 'typeorm';
import { OrderEntity } from '../order/order.entity';
import { UserEntity } from '../user/user.entity';

@Entity('delivery-address')
export class DeliveryAddressEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public readonly sapId: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256 })
  public readonly type: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly addressName: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly governorate: string;

  @Check(`"area" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly area: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly block: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly street: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly avenue: string;

  @Check(`"houseNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807, nullable: true })
  public readonly houseNumber: number;

  @Check(`"buildingNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807, nullable: true })
  public readonly buildingNumber: number;

  @Check(`"floorNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807, nullable: true })
  public readonly floorNumber: number;

  @Check(`"apartmentNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807, nullable: true })
  public readonly apartmentNumber: number;

  @Check(`"officeNumber" > 0`)
  @Column({ type: 'bigint' })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807, nullable: true })
  public readonly officeNumber: number;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly direction: string;

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

  @OneToMany(() => OrderEntity, (order: OrderEntity) => order.deliveryAddress)
  public orders: OrderEntity[];

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.deliveryAddresses)
  public user: UserEntity;

  @Check(`"userId" > 0`)
  @Column({ type: 'bigint', nullable: true })
  @ApiProperty({ readOnly: true, minimum: 1, maximum: 9223372036854775807 })
  public readonly userId: number;
}
