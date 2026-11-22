import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';
import { TypeOrmCourseRepository } from './adapters/typeorm-course.repository.js';
import { COURSE_REPOSITORY } from './ports/course-repository.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), AuthModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    TypeOrmCourseRepository,
    {
      provide: COURSE_REPOSITORY,
      useExisting: TypeOrmCourseRepository,
    },
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
