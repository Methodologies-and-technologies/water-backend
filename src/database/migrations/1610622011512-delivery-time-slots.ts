import { DeliveryTimeSlotsEntity } from 'src/modules/delivery-time-slots/delivery-time-slots.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 *
 * @initial data
 */
export const deliveryTimeSlots: Partial<DeliveryTimeSlotsEntity>[] = [
  {
    value: '13:00-14:00',
  },
  {
    value: '14:00-15:00',
  },
  {
    value: '15:00-16:00',
  },
  {
    value: '17:00-18:00',
  },
  {
    value: '19:00-20:00',
  },
];

export class DeliveryTimeSlots1610622011704 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(DeliveryTimeSlotsEntity).save(deliveryTimeSlots);
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(DeliveryTimeSlotsEntity).delete({});
  }
}
