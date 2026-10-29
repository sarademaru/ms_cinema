import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRedundantProjectorIndex1793282500002 implements MigrationInterface {
  name = 'RemoveRedundantProjectorIndex1793282500002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_39723a507706f581bc5928ff8f` ON `projectors`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_39723a507706f581bc5928ff8f` ON `projectors` (`theater_id`)',
    );
  }
}
