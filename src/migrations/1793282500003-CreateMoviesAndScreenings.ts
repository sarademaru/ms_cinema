import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMoviesAndScreenings1793282500003 implements MigrationInterface {
  name = 'CreateMoviesAndScreenings1793282500003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '180', isNullable: false },
          { name: 'duration', type: 'int', isNullable: false },
          { name: 'date', type: 'date', isNullable: false },
        ],
        engine: 'InnoDB',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'screenings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'scheduled_at',
            type: 'datetime',
            isNullable: false,
          },
          { name: 'theater_id', type: 'int', isNullable: false },
          { name: 'movie_id', type: 'int', isNullable: false },
        ],
        foreignKeys: [
          {
            name: 'FK_screenings_theater_id',
            columnNames: ['theater_id'],
            referencedTableName: 'theaters',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
          {
            name: 'FK_screenings_movie_id',
            columnNames: ['movie_id'],
            referencedTableName: 'movies',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
        ],
        engine: 'InnoDB',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('screenings');
    await queryRunner.dropTable('movies');
  }
}
