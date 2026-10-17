import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRefreshTokenRotationColumns1759000000000
  implements MigrationInterface
{
  name = 'AddRefreshTokenRotationColumns1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ADD "usedAt" TIMESTAMP',
    );
    await queryRunner.query('ALTER TABLE "refresh_tokens" ADD "familyId" uuid');
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ADD "depth" integer NOT NULL DEFAULT 0',
    );
    // Pre-existing tokens each become the root of their own family.
    await queryRunner.query('UPDATE "refresh_tokens" SET "familyId" = "id"');
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ALTER COLUMN "familyId" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_refresh_tokens_familyId" ON "refresh_tokens" ("familyId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_refresh_tokens_familyId"');
    await queryRunner.query('ALTER TABLE "refresh_tokens" DROP COLUMN "depth"');
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" DROP COLUMN "familyId"',
    );
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" DROP COLUMN "usedAt"',
    );
  }
}
