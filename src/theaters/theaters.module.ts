import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from './entities/theater.entity';
import { TheaterMapper } from './mappers/theater.mapper';
import { TheatersRepository } from './repositories/theaters.repository';
import { TheatersController } from './theaters.controller';
import { TheatersService } from './theaters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Theater])],
  controllers: [TheatersController],
  providers: [TheatersService, TheaterMapper, TheatersRepository],
  exports: [TheatersService],
})
export class TheatersModule {}
