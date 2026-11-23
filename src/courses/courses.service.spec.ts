import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { COURSE_REPOSITORY } from './ports/course-repository.port.js';
import { Course } from './entities/course.entity.js';
import { UserRole } from '../auth/roles.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';

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
          useValue: repository,
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

  it('returns paginated courses and applies filters', async () => {
    const courses = [
      { id: 1, title: 'NestJS', level: 'beginner', ownerId: 7 },
    ] as Course[];
    repository.findAndCount.mockResolvedValue([courses, 1]);

    const query = {
      level: 'beginner',
      page: 2,
      limit: 5,
      sort: 'title',
      order: 'desc',
    } as CoursesQueryDto;

    await expect(service.findAll(query)).resolves.toEqual({
      data: courses,
      meta: {
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
      },
    });
    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: { level: 'beginner' },
      order: { title: 'desc' },
      skip: 5,
      take: 5,
    });
  });

  it('lists courses without an optional level filter', async () => {
    repository.findAndCount.mockResolvedValue([[], 0]);

    await service.findAll({
      level: undefined,
      page: 1,
      limit: 10,
      sort: 'id',
      order: 'asc',
    } as CoursesQueryDto);

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: {},
      order: { id: 'asc' },
      skip: 0,
      take: 10,
    });
  });

  it('throws NotFoundException when a course does not exist', async () => {
    repository.findOneById.mockResolvedValue(null);

    await expect(service.findOne('99')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a course assigned to the authenticated user', async () => {
    const dto = { title: 'NestJS', level: 'beginner' };
    const course = { id: 1, ...dto, ownerId: 7 } as Course;
    repository.create.mockReturnValue(course);
    repository.save.mockResolvedValue(course);

    await expect(service.create(dto, 7)).resolves.toBe(course);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      ownerId: 7,
    });
    expect(repository.save).toHaveBeenCalledWith(course);
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

  it('allows the owner to update a course', async () => {
    const course = {
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course;
    repository.findOneById.mockResolvedValue(course);
    repository.save.mockResolvedValue(course);

    await expect(
      service.update('1', { title: 'Advanced NestJS' }, 7, UserRole.TEACHER),
    ).resolves.toBe(course);

    expect(repository.save).toHaveBeenCalledWith({
      ...course,
      title: 'Advanced NestJS',
    });
  });

  it('allows an administrator to update another owner course', async () => {
    const course = {
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course;
    repository.findOneById.mockResolvedValue(course);
    repository.save.mockResolvedValue(course);

    await expect(
      service.update('1', { level: 'advanced' }, 9, UserRole.ADMIN),
    ).resolves.toBe(course);

    expect(repository.save).toHaveBeenCalledWith({
      ...course,
      level: 'advanced',
    });
  });

  it('allows the owner to remove a course', async () => {
    const course = {
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course;
    repository.findOneById.mockResolvedValue(course);
    repository.remove.mockResolvedValue(course);

    await expect(service.remove('1', 7, UserRole.TEACHER)).resolves.toBe(
      course,
    );
    expect(repository.remove).toHaveBeenCalledWith(course);
  });

  it('prevents a non-owner from removing a course', async () => {
    repository.findOneById.mockResolvedValue({
      id: 1,
      title: 'NestJS',
      level: 'beginner',
      ownerId: 7,
    } as Course);

    await expect(
      service.remove('1', 9, UserRole.TEACHER),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
