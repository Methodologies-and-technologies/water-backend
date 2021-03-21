import { TermsConditionsEntity } from 'src/modules/terms-conditions/terms-conditions.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 *
 * @initial data
 */
const termsConditions: Partial<TermsConditionsEntity>[] = [
  {
    title: 'terms and conditions',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
];

export class termsConditions1610615992884 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(TermsConditionsEntity).save(termsConditions);
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(TermsConditionsEntity).delete({});
  }
}
