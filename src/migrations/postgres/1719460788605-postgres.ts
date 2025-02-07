import { MigrationInterface, QueryRunner } from 'typeorm';

export class Postgres1719460788605 implements MigrationInterface {
  name = 'Postgres1719460788605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment"."transaction_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(10) NOT NULL, "channel" character varying(10), "event_key" character varying(20), "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP, "transaction_status_id" uuid, CONSTRAINT "PK_c31d1e77795e3bd9d5f6399f988" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment"."transaction_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_type" character varying(50) NOT NULL, "amount" integer NOT NULL, "currency" character varying(5) NOT NULL, "source" character varying(50) NOT NULL, "description" character varying(255), "user_ref_id" character varying(50) NOT NULL, "provider" character varying(10) NOT NULL, "provider_ref_id" character varying(50) NOT NULL, "status" character varying(10) NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP, CONSTRAINT "PK_05fbbdf6bc1db819f47975c8c0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment"."transaction_log" ADD CONSTRAINT "FK_fba443a1ae6ffc525c79fdc4851" FOREIGN KEY ("transaction_status_id") REFERENCES "payment"."transaction_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment"."transaction_log" DROP CONSTRAINT "FK_fba443a1ae6ffc525c79fdc4851"`);
    await queryRunner.query(`DROP TABLE "payment"."transaction_status"`);
    await queryRunner.query(`DROP TABLE "payment"."transaction_log"`);
  }
}
