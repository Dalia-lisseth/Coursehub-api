import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from '../courses/courses.module.js';
import { StudentsModule } from '../students/students.module.js';
import { EnrollmentRelationsController } from './enrollment-relations.controller.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { Enrollment } from './entities/enrollment.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    CoursesModule,
    StudentsModule,
  ],
  controllers: [EnrollmentsController, EnrollmentRelationsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
