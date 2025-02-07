import { MigrationInterface, QueryRunner } from 'typeorm';

export class Postgres1724207660951 implements MigrationInterface {
  name = 'Postgres1724207660951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_e4fe30c19369a91399934b3ae4" ON "payment"."transaction_status" ("user_ref_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "payment"."IDX_e4fe30c19369a91399934b3ae4"`);
  }
}
