import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { QuestionEntity } from '../question/question.entity';
import { NotificationEntity } from '../notifications/notification.entity';
import { DeliveryAddressEntity } from '../delivery-address/delivery-address.entity';
import { DeliveryAreaEntity } from '../delivery-area/delivery-area.entity';
import { FileEntity } from '../files/file.entity';

import { ServiceRatingEntity } from '../service-rating/service-rating.entity';
import { CartEntity } from '../cart/cart.entity';
import { Exclude } from 'class-transformer';
import { OrderEntity } from '../order/order.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn('increment')
  public readonly id: number;

  @ApiProperty({ readOnly: true })
  @Column({ type: 'varchar', nullable: true })
  public readonly sapId: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @ApiProperty({ maxLength: 256 })
  public readonly email: string;

  @Column({ type: 'varchar', length: 256, unique: true })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public readonly fullName: string;

  @Column({ type: 'varchar', length: 256 })
  @ApiProperty({ maxLength: 256, readOnly: true })
  public phoneNumber: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({ type: 'varchar', length: 25611, nullable: true })
  @ApiProperty({ maxLength: 25611 })
  public imageUrl: string;

  @OneToOne(() => FileEntity)
  @JoinColumn()
  avatar: FileEntity;

  @OneToOne(() => DeliveryAreaEntity)
  @JoinColumn()
  deliveryArea: DeliveryAreaEntity;

  @OneToOne(() => ServiceRatingEntity)
  @JoinColumn()
  rating: ServiceRatingEntity;

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

  @OneToMany(() => QuestionEntity, (question: QuestionEntity) => question.user)
  questions: QuestionEntity[];

  @OneToMany(() => OrderEntity, (order: OrderEntity) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => NotificationEntity, (notification: NotificationEntity) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.user)
  public cartItems: CartEntity[];

  @OneToMany(
    () => DeliveryAddressEntity,
    (deliveryAddress: DeliveryAddressEntity) => deliveryAddress.user,
  )
  deliveryAddresses: DeliveryAddressEntity[];
}
