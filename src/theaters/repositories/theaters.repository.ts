import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Theater } from '../entities/theater.entity';

@Injectable()
export class TheatersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {} //datasource es la conexion a la base de datos, es un objeto que nos permite ejecutar consultas y transacciones en la base de datos

  async findLargeTheatersReport(minCapacity: number): Promise<Theater[]> { //async es una palabra clave que se utiliza para declarar una función asincrónica, es decir, una función que puede contener operaciones que tardan un tiempo en completarse, como consultas a bases de datos o llamadas a APIs externas. La función devuelve una promesa que se resuelve con un valor de tipo Theater[] (un arreglo de objetos Theater) cuando la operación asincrónica se completa. El parámetro minCapacity es un número que representa la capacidad mínima de los teatros que queremos buscar en la base de datos.
    const rows: Array<Pick<Theater, 'id' | 'location' | 'capacity'>> =
      await this.dataSource.query(
        `SELECT id, location, capacity
         FROM theaters
         WHERE capacity >= ?
         ORDER BY capacity DESC`,
        [minCapacity],
      );
    return rows.map((row) => Object.assign(new Theater(), row));
  }
}
