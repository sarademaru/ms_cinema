import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignProjectorRelation1793282500001 implements MigrationInterface {
  name = 'AlignProjectorRelation1793282500001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projectors\` DROP FOREIGN KEY \`FK_projectors_theater_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_projectors_theater_id\` ON \`projectors\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`projectors\` ADD UNIQUE INDEX \`IDX_39723a507706f581bc5928ff8f\` (\`theater_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_39723a507706f581bc5928ff8f\` ON \`projectors\` (\`theater_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projectors\` ADD CONSTRAINT \`FK_39723a507706f581bc5928ff8f3\` FOREIGN KEY (\`theater_id\`) REFERENCES \`theaters\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`projectors\` DROP FOREIGN KEY \`FK_39723a507706f581bc5928ff8f3\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_39723a507706f581bc5928ff8f\` ON \`projectors\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`projectors\` DROP INDEX \`IDX_39723a507706f581bc5928ff8f\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_projectors_theater_id\` ON \`projectors\` (\`theater_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`projectors\` ADD CONSTRAINT \`FK_projectors_theater_id\` FOREIGN KEY (\`theater_id\`) REFERENCES \`theaters\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
