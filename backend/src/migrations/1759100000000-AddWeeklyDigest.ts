import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWeeklyDigest1759100000000 implements MigrationInterface {
  name = 'AddWeeklyDigest1759100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "digestOptIn" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `CREATE TABLE "digest_templates" ("id" integer NOT NULL, "subject" character varying(200) NOT NULL, "bodyHtml" text NOT NULL, "updatedBy" character varying(255), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_digest_templates_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "digest_deliveries" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" integer NOT NULL, "weekStart" date NOT NULL, "status" character varying(16) NOT NULL, "error" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_digest_deliveries_user_week" UNIQUE ("userId", "weekStart"), CONSTRAINT "PK_digest_deliveries_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_digest_deliveries_userId" ON "digest_deliveries" ("userId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_digest_deliveries_userId"');
    await queryRunner.query('DROP TABLE "digest_deliveries"');
    await queryRunner.query('DROP TABLE "digest_templates"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "digestOptIn"');
  }
}
