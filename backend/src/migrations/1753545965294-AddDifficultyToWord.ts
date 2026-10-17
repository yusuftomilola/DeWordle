import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDifficultyToWord1753545965294 implements MigrationInterface {
  name = 'AddDifficultyToWord1753545965294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_38a98e41b6be0f379166dc2b58"',
    );
    await queryRunner.query(
      'ALTER TABLE "words" DROP CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d"',
    );
    // ALTER instead of DROP/ADD COLUMN so existing words are kept.
    await queryRunner.query(
      'ALTER TABLE "words" ALTER COLUMN "word" TYPE character varying(10)',
    );
    await queryRunner.query(
      'ALTER TABLE "words" ADD CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d" UNIQUE ("word")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_38a98e41b6be0f379166dc2b58" ON "words" ("word")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_38a98e41b6be0f379166dc2b58"',
    );
    await queryRunner.query(
      'ALTER TABLE "words" DROP CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d"',
    );
    await queryRunner.query(
      'ALTER TABLE "words" ALTER COLUMN "word" TYPE character varying(5)',
    );
    await queryRunner.query(
      'ALTER TABLE "words" ADD CONSTRAINT "UQ_38a98e41b6be0f379166dc2b58d" UNIQUE ("word")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_38a98e41b6be0f379166dc2b58" ON "words" ("word")',
    );
  }
}
