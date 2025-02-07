import { MigrationInterface, QueryRunner } from 'typeorm';

export class Postgres1719822147448 implements MigrationInterface {
  name = 'Postgres1719822147448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9d1eb1efc32a63b22188c9de14" ON "payment"."transaction_status" ("source") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "payment"."IDX_9d1eb1efc32a63b22188c9de14"`);
  }
}
