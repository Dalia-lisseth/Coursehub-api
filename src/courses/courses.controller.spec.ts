import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { COURSE_REPOSITORY } from './ports/course-repository.port.js';
import { UserRole } from '../auth/roles.js';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        CoursesService,
        {
          provide: CoursesService,
          useValue: service,
        },
        {
          provide: COURSE_REPOSITORY,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates course listing with the query', async () => {
    const query = { page: 1, limit: 10, sort: 'id', order: 'asc' } as never;
    const result = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    service.findAll.mockResolvedValue(result);

    await expect(controller.findAll(query)).resolves.toBe(result);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates finding a course by id', async () => {
    const course = { id: 1, title: 'NestJS', level: 'beginner', ownerId: 7 };
    service.findOne.mockResolvedValue(course);

    await expect(controller.findOne('1')).resolves.toBe(course);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('delegates course creation with the authenticated user id', async () => {
    const dto = { title: 'NestJS', level: 'beginner' };
    const request = { user: { sub: 7, role: UserRole.TEACHER } } as never;
    const createdCourse = { id: 1, ...dto, ownerId: 7 };
    service.create.mockResolvedValue(createdCourse);

    await expect(controller.create(dto, request)).resolves.toBe(createdCourse);
    expect(service.create).toHaveBeenCalledWith(dto, 7);
  });

  it('delegates updates with the authenticated user id and role', async () => {
    const dto = { title: 'Advanced NestJS' };
    const request = { user: { sub: 7, role: UserRole.TEACHER } } as never;
    const updatedCourse = { id: 1, ...dto, ownerId: 7 };
    service.update.mockResolvedValue(updatedCourse);

    await expect(controller.update('1', dto, request)).resolves.toBe(
      updatedCourse,
    );
    expect(service.update).toHaveBeenCalledWith(
      '1',
      dto,
      7,
      UserRole.TEACHER,
    );
  });

  it('delegates removal with the authenticated user id and role', async () => {
    const request = { user: { sub: 7, role: UserRole.TEACHER } } as never;
    const removedCourse = { id: 1, title: 'NestJS', level: 'beginner', ownerId: 7 };
    service.remove.mockResolvedValue(removedCourse);

    await expect(controller.remove('1', request)).resolves.toBe(removedCourse);
    expect(service.remove).toHaveBeenCalledWith('1', 7, UserRole.TEACHER);
  });
});
