import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDateTimestamptz1720695877542 implements MigrationInterface {
  name = 'ChangeDateTimestamptz1720695877542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "payment"."transaction_status" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ADD "updated_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "payment"."transaction_log" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" ADD "updated_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" ADD "updated_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" ADD "created_at" TIMESTAMP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ADD "updated_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ADD "created_at" TIMESTAMP NOT NULL`);
    await queryRunner.query(`DROP TABLE "payment"."foo"`);
  }
}
