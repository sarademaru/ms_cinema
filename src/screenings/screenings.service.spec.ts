import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Movie } from '../movies/entities/movie.entity';
import { NotificationsGateway } from '../gateways/notifications/notifications.gateway';
import { Theater } from '../theaters/entities/theater.entity';
import { Screening } from './entities/screening.entity';
import { ScreeningsRepository } from './repositories/screenings.repository';
import { ScreeningsService } from './screenings.service';

describe('ScreeningsService', () => {
  let service: ScreeningsService;
  const screeningsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const theatersRepository = {
    findOneBy: jest.fn(),
  };
  const moviesRepository = {
    findOneBy: jest.fn(),
  };
  const notificationsGateway = {
    broadcastNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScreeningsService,
        {
          provide: getRepositoryToken(Screening),
          useValue: screeningsRepository,
        },
        {
          provide: getRepositoryToken(Theater),
          useValue: theatersRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: moviesRepository,
        },
        {
          provide: ScreeningsRepository,
          useValue: {},
        },
        {
          provide: NotificationsGateway,
          useValue: notificationsGateway,
        },
      ],
    }).compile();

    service = module.get(ScreeningsService);
  });

  it('notifies connected clients after creating a screening', async () => {
    const theater = Object.assign(new Theater(), { id: 2 });
    const movie = Object.assign(new Movie(), { id: 3 });
    const screening = Object.assign(new Screening(), {
      id: 1,
      scheduledAt: new Date('2026-11-10T20:00:00.000Z'),
      theater,
      movie,
    });
    theatersRepository.findOneBy.mockResolvedValue(theater);
    moviesRepository.findOneBy.mockResolvedValue(movie);
    screeningsRepository.save.mockResolvedValue(screening);
    screeningsRepository.findOne.mockResolvedValue(screening);

    await expect(
      service.create({
        theaterId: theater.id,
        movieId: movie.id,
        scheduledAt: screening.scheduledAt.toISOString(),
      }),
    ).resolves.toEqual({
      id: screening.id,
      scheduledAt: screening.scheduledAt,
      theaterId: theater.id,
      movieId: movie.id,
    });

    expect(screeningsRepository.save.mock.invocationCallOrder[0]).toBeLessThan(
      notificationsGateway.broadcastNotification.mock.invocationCallOrder[0],
    );
    expect(notificationsGateway.broadcastNotification).toHaveBeenCalledWith({
      event: 'new_notification',
      data: {
        message: 'Nueva función creada',
        screening: {
          id: screening.id,
          scheduledAt: screening.scheduledAt,
          theaterId: theater.id,
          movieId: movie.id,
        },
      },
    });
  });
});
