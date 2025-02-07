import { MigrationInterface, QueryRunner } from "typeorm";

export class Postgres1724727455862 implements MigrationInterface {
    name = 'Postgres1724727455862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ALTER COLUMN "source" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ALTER COLUMN "provider_ref_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ALTER COLUMN "provider_ref_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment"."transaction_status" ALTER COLUMN "source" SET NOT NULL`);
    }

}
