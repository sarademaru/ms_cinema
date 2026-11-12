import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Theater } from '../theaters/entities/theater.entity';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { ScreeningResponseDto } from './dto/screening-response.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { Screening } from './entities/screening.entity';
import { ScreeningMapper } from './mappers/screening.mapper';
import { ScreeningsRepository } from './repositories/screenings.repository';
import { NotificationsGateway } from '../gateways/notifications/notifications.gateway';

@Injectable()
export class ScreeningsService {
  constructor(
    @InjectRepository(Screening)
    private readonly screeningsRepository: Repository<Screening>,
    @InjectRepository(Theater)
    private readonly theatersRepository: Repository<Theater>,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly customScreeningsRepository: ScreeningsRepository,
    private readonly notificationsGateway: NotificationsGateway, //hacemos la inyeccion de notifications
  ) {}

  async create(dto: CreateScreeningDto): Promise<ScreeningResponseDto> {
    const theater = await this.findTheater(dto.theaterId);
    const movie = await this.findMovie(dto.movieId);
    const saved = await this.screeningsRepository.save(
      ScreeningMapper.toEntity(dto, theater, movie),
    );
    const response = await this.findOne(saved.id);

    this.notificationsGateway.broadcastNotification({
      event: 'new_notification', //nombre del evento que se va a emitir podria ser un numero de telefono, un correo electronico, un id de usuario, etc
      data: {
        message: 'Nueva función creada', //mensaje que se va a enviar en la notificacion
        screening: response,
      },
    });

    return response;
  }

  async findAll(): Promise<ScreeningResponseDto[]> {
    const screenings = await this.screeningsRepository.find({
      relations: { theater: true, movie: true },
    });
    return ScreeningMapper.toResponseDtoList(screenings);
  }

  async findOne(id: number): Promise<ScreeningResponseDto> {
    return ScreeningMapper.toResponseDto(await this.findScreening(id));
  }

  async update(
    id: number,
    dto: UpdateScreeningDto,
  ): Promise<ScreeningResponseDto> {
    const screening = await this.findScreening(id);
    if (dto.theaterId !== undefined) {
      screening.theater = await this.findTheater(dto.theaterId);
    }
    if (dto.movieId !== undefined) {
      screening.movie = await this.findMovie(dto.movieId);
    }

    const saved = await this.screeningsRepository.save(
      ScreeningMapper.mergeEntity(screening, dto),
    );
    return this.findOne(saved.id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const screening = await this.findScreening(id);
    await this.screeningsRepository.remove(screening);
    return { message: `Screening #${id} deleted successfully` };
  }

  async getNextThree(): Promise<ScreeningResponseDto[]> {
    const rows = await this.customScreeningsRepository.findNextThree();
    return Promise.all(rows.map((row) => this.findOne(Number(row.id))));
  }

  private async findScreening(id: number): Promise<Screening> {
    const screening = await this.screeningsRepository.findOne({
      where: { id },
      relations: { theater: true, movie: true },
    });
    if (!screening) {
      throw new NotFoundException(`Screening with id ${id} not found`);
    }
    return screening;
  }

  private async findTheater(id: number): Promise<Theater> {
    const theater = await this.theatersRepository.findOneBy({ id });
    if (!theater)
      throw new NotFoundException(`Theater with id ${id} not found`);
    return theater;
  }

  private async findMovie(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOneBy({ id });
    if (!movie) throw new NotFoundException(`Movie with id ${id} not found`);
    return movie;
  }
}
