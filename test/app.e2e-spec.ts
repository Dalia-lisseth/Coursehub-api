import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { RolesGuard } from '../src/auth/guards/roles.guard.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { CoursesController } from '../src/courses/courses.controller.js';
import { CoursesService } from '../src/courses/courses.service.js';
import { WelcomeController } from '../src/welcome.controller.js';
import { WelcomeService } from '../src/welcome.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        WelcomeController,
        CoursesController,
      ],
      providers: [
        AppService,
        WelcomeService,
        JwtAuthGuard,
        RolesGuard,
        {
          provide: CoursesService,
          useValue: {
            findAll: () => ({
              data: [],
              meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: () => {
              throw new Error('Invalid or missing token');
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / is public', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bienvenido a CourseHub API!');
  });

  it('GET /welcome is public', () => {
    return request(app.getHttpServer())
      .get('/welcome')
      .expect(200)
      .expect({ message: 'Bienvenido a CourseHub API!' });
  });

  it('GET /courses is public', () => {
    return request(app.getHttpServer())
      .get('/courses')
      .expect(200)
      .expect({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
  });

  it('POST /courses rejects requests without a token', () => {
    return request(app.getHttpServer())
      .post('/courses')
      .send({ title: 'NestJS', level: 'beginner' })
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
