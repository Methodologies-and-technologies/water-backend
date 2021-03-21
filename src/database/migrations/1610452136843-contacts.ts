import { ContactEntity } from 'src/modules/contact/contact.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
/**
 *
 * @initial data
 */
const contacts: Partial<ContactEntity>[] = [
  {
    address: 'Shuwaikh Port, WH12 State of Kuwait',
    phone: '1844666',
    whatsApp: '+9651844666',
    instagram: 'https://instagram.com/abraajwater?igshid=wrq37sw9e6if',
    twitter: 'https://twitter.com/AbraajWater?s=09',
  },
];

export class contacts1610452136843 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(ContactEntity).save(contacts);
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(ContactEntity).delete({});
  }
}
