import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Theater } from './src/theaters/entities/theater.entity';
import { Projector } from './src/projectors/entities/projector.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ?? 'cinema_db',
  entities: [Theater, Projector],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
});
