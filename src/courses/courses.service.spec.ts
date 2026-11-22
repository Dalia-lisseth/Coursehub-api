import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import {
  COURSE_REPOSITORY,
  CourseRepository,
} from './ports/course-repository.port.js';
import { Course } from './entities/course.entity.js';
import { UserRole } from '../auth/roles.js';

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: {
    findAndCount: ReturnType<typeof vi.fn>;
    findOneById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      findAndCount: vi.fn(),
      findOneById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: COURSE_REPOSITORY,
          useValue: repository satisfies CourseRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds a course through the repository port', async () => {
    const course = {
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course;
    repository.findOneById.mockResolvedValue(course);

    await expect(service.findOne('1')).resolves.toBe(course);
    expect(repository.findOneById).toHaveBeenCalledWith(1);
  });

  it('prevents a non-owner from updating a course', async () => {
    repository.findOneById.mockResolvedValue({
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course);

    await expect(
      service.update('1', { title: 'Updated course' }, 9, UserRole.TEACHER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
