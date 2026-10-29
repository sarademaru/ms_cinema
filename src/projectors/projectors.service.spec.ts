import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Theater } from '../theaters/entities/theater.entity';
import { CreateProjectorDto } from './dto/create-projector.dto';
import { Projector } from './entities/projector.entity';
import { ProjectorsService } from './projectors.service';

describe('ProjectorsService', () => {
  let service: ProjectorsService;
  const projectorsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const theatersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectorsService,
        {
          provide: getRepositoryToken(Projector),
          useValue: projectorsRepository,
        },
        {
          provide: getRepositoryToken(Theater),
          useValue: theatersRepository,
        },
      ],
    }).compile();

    service = module.get(ProjectorsService);
  });

  it('creates a projector without a theater', async () => {
    const dto: CreateProjectorDto = {
      brand: 'Epson',
      high: 1080,
      width: 1920,
    };
    const projector = Object.assign(new Projector(), {
      id: 1,
      brand: dto.brand,
      high: dto.high,
      width: dto.width,
    });
    projectorsRepository.save.mockResolvedValue(projector);
    projectorsRepository.findOne.mockResolvedValue(projector);

    await expect(service.create(dto)).resolves.toEqual({
      id: 1,
      brand: 'Epson',
      high: 1080,
      width: 1920,
      theaterId: undefined,
    });
    expect(theatersRepository.findOne).not.toHaveBeenCalled();
  });

  it('rejects association with a theater that already has a projector', async () => {
    const assignedProjector = Object.assign(new Projector(), { id: 4 });
    const theater = Object.assign(new Theater(), {
      id: 2,
      projector: assignedProjector,
    });
    theatersRepository.findOne.mockResolvedValue(theater);

    await expect(
      service.create({
        brand: 'Epson',
        high: 1080,
        width: 1920,
        theaterId: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(projectorsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects association with a theater that does not exist', async () => {
    theatersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        brand: 'Epson',
        high: 1080,
        width: 1920,
        theaterId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns a not-found error for an unknown projector', async () => {
    projectorsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
