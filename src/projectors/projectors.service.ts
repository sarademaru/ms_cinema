import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Theater } from '../theaters/entities/theater.entity';
import { CreateProjectorDto } from './dto/create-projector.dto';
import { ProjectorResponseDto } from './dto/projector-response.dto';
import { UpdateProjectorDto } from './dto/update-projector.dto';
import { Projector } from './entities/projector.entity';
import { ProjectorMapper } from './mappers/projector.mapper';

@Injectable()
export class ProjectorsService {
  constructor(
    @InjectRepository(Projector)
    private readonly projectorsRepository: Repository<Projector>,
    @InjectRepository(Theater)
    private readonly theatersRepository: Repository<Theater>,
  ) {}

  async create(dto: CreateProjectorDto): Promise<ProjectorResponseDto> {
    const theater = // si el id del teatro está definido, buscamos el teatro disponible
      dto.theaterId === undefined
        ? undefined
        : await this.getAvailableTheater(dto.theaterId);
    const projector = ProjectorMapper.toEntity(dto, theater);

    try {
      const saved = await this.projectorsRepository.save(projector);
      return this.findOne(saved.id);
    } catch (error) {
      if (this.isDuplicateTheaterAssociation(error)) {
        throw new ConflictException(
          `Theater with id ${dto.theaterId} already has a projector`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<ProjectorResponseDto[]> {
    const projectors = await this.projectorsRepository.find({
      relations: { theater: true }, // buscamos todos los proyectores y sus teatros asociados
    });
    return projectors.map((projector) =>
      ProjectorMapper.toResponseDto(projector),
    );
  }

  async findOne(id: number): Promise<ProjectorResponseDto> {
    const projector = await this.findProjector(id);
    return ProjectorMapper.toResponseDto(projector);
  }

  async update(
    id: number,
    dto: UpdateProjectorDto,
  ): Promise<ProjectorResponseDto> {
    const projector = await this.findProjector(id);
    if (dto.theaterId !== undefined) {
      projector.theater = await this.getAvailableTheater(dto.theaterId, id);
    }

    try {
      const saved = await this.projectorsRepository.save(
        ProjectorMapper.mergeEntity(projector, dto),
      );
      return ProjectorMapper.toResponseDto(saved);
    } catch (error) {
      if (this.isDuplicateTheaterAssociation(error)) {
        throw new ConflictException(
          `Theater with id ${dto.theaterId} already has a projector`,
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const projector = await this.findProjector(id);
    await this.projectorsRepository.remove(projector);
    return { message: `Projector #${id} deleted successfully` };
  }

  private async findProjector(id: number): Promise<Projector> {
    const projector = await this.projectorsRepository.findOne({
      where: { id },
      relations: { theater: true },
    });
    if (!projector) {
      throw new NotFoundException(`Projector with id ${id} not found`);
    }
    return projector;
  }

  private async getAvailableTheater(
    theaterId: number,
    currentProjectorId?: number,
  ): Promise<Theater> {
    const theater = await this.theatersRepository.findOne({
      where: { id: theaterId },
      relations: { projector: true },
    });
    if (!theater) {
      throw new NotFoundException(`Theater with id ${theaterId} not found`);
    }
    if (theater.projector && theater.projector.id !== currentProjectorId) {
      throw new ConflictException(
        `Theater with id ${theaterId} already has a projector`,
      );
    }
    return theater;
  }

  private isDuplicateTheaterAssociation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      'code' in error.driverError &&
      error.driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
