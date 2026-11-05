import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Screening } from '../entities/screening.entity';

@Injectable()
export class ScreeningsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findNextThree(): Promise<Array<Pick<Screening, 'id'>>> {
    const rows: Array<Pick<Screening, 'id'>> = await this.dataSource.query(
      `SELECT id
       FROM screenings
       WHERE scheduled_at >= NOW()
       ORDER BY scheduled_at ASC, id ASC
       LIMIT 3`,
    );
    return rows;
  }
}
