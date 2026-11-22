import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service.js';
import { COURSE_REPOSITORY } from './ports/course-repository.port.js';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: COURSE_REPOSITORY,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
