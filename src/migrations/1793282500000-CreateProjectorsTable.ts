import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProjectorsTable1793282500000 implements MigrationInterface {
  name = 'CreateProjectorsTable1793282500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projectors',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'high',
            type: 'int',
          },
          {
            name: 'width',
            type: 'int',
          },
          {
            name: 'theater_id',
            type: 'int',
            isNullable: true,
          },
        ],
        uniques: [
          {
            name: 'UQ_projectors_theater_id',
            columnNames: ['theater_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_projectors_theater_id',
            columnNames: ['theater_id'],
            referencedTableName: 'theaters',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projectors');
  }
}
