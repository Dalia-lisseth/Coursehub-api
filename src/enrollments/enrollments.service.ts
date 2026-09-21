import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  create(input: CreateEnrollmentDto): Enrollment {
    const student = this.studentsService.findOne(input.studentId);
    const course = this.coursesService.findOne(input.courseId);

    if (!course) {
      throw new NotFoundException(
        `Course with id ${input.courseId} not found`,
      );
    }

    if (!student.isActive) {
      throw new BadRequestException('Student is inactive');
    }

    const alreadyEnrolled = this.enrollments.some(
      (enrollment) =>
        enrollment.studentId === input.studentId &&
        enrollment.courseId === input.courseId,
    );

    if (alreadyEnrolled) {
      throw new BadRequestException('Enrollment already exists');
    }

    const enrollment: Enrollment = {
      id: this.nextId++,
      studentId: input.studentId,
      courseId: input.courseId,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  findAll(studentId?: number, courseId?: number): Enrollment[] {
    return this.enrollments.filter(
      (enrollment) =>
        (studentId === undefined || enrollment.studentId === studentId) &&
        (courseId === undefined || enrollment.courseId === courseId),
    );
  }

  findOne(id: number): Enrollment {
    const enrollment = this.enrollments.find((item) => item.id === id);

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    return enrollment;
  }

  findByStudent(studentId: number): Enrollment[] {
    this.studentsService.findOne(studentId);
    return this.findAll(studentId);
  }

  findByCourse(courseId: number): Enrollment[] {
    const course = this.coursesService.findOne(courseId);

    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    return this.findAll(undefined, courseId);
  }

  remove(id: number): Enrollment {
    const enrollment = this.findOne(id);
    const index = this.enrollments.indexOf(enrollment);

    this.enrollments.splice(index, 1);
    return enrollment;
  }
}
