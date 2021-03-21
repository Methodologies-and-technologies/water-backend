import { MosqueEntity } from 'src/modules/mosque/mosque.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
/**
 *
 * @initial data
 */
const mosque: Partial<MosqueEntity>[] = [
  {
    name: 'first mosque',
  },
  {
    name: 'second mosque',
  },
  {
    name: 'last mosque',
  },
];

export class mosque1610451663263 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(MosqueEntity).save(mosque);
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(MosqueEntity).delete({});
  }
}
