import { DeliveryAreaEntity } from 'src/modules/delivery-area/delivery-area.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 *
 * @initial data
 */
export const deliveryAreas: Partial<DeliveryAreaEntity>[] = [
  {
    name: 'Abu Dhabi City',
  },
  {
    name: 'Abu al Abyad',
  },
  {
    name: 'AI-Aryam Island',
  },
  {
    name: 'AI Bandar',
  },
  {
    name: 'AI-Bahiyah',
  },
  {
    name: 'AI Lulu Island',
  },
  {
    name: 'AI Maryah Island',
  },
  {
    name: 'AI Rahah',
  },
  {
    name: 'AI Reem Island',
  },
  {
    name: 'AI-Shahamah',
  },
];

export class deliveryArea161062201158123 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(DeliveryAreaEntity).save(deliveryAreas);
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(DeliveryAreaEntity).delete({});
  }
}
