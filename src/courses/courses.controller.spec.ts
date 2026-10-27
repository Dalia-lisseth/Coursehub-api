import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';

describe('CoursesController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
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
});
