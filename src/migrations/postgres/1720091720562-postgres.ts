import { MigrationInterface, QueryRunner } from 'typeorm';

export class Postgres1720091720562 implements MigrationInterface {
  name = 'Postgres1720091720562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment"."transaction_status" ADD "product_id" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" DROP COLUMN "product_id"`);
  }
}
