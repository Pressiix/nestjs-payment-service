import { MigrationInterface, QueryRunner } from 'typeorm';

export class Postgres1720413288695 implements MigrationInterface {
  name = 'Postgres1720413288695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_0629e99309f0c7e45c56028246" ON "payment"."transaction_status" ("product_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "payment"."IDX_0629e99309f0c7e45c56028246"`);
  }
}
