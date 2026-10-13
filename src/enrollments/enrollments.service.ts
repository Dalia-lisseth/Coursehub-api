import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { Enrollment } from './entities/enrollment.entity.js';

type EnrollmentResponse = {
  id: number;
  studentId: number;
  courseId: number;
  student: {
    id: number;
    name: string;
    email: string;
    age: number;
    career: string;
    semester: number;
    isActive: boolean;
  };
  course: {
    id: number;
    title: string;
    level: string;
  };
};

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(input: CreateEnrollmentDto): Promise<EnrollmentResponse> {
    const student = await this.studentsService.findOne(input.studentId);
    const course = await this.coursesService.findOne(String(input.courseId));

    if (!student.isActive) {
      throw new BadRequestException('Student is inactive');
    }

    const alreadyEnrolled = await this.enrollmentsRepository.findOne({
      where: {
        student: { id: input.studentId },
        course: { id: input.courseId },
      },
    });

    if (alreadyEnrolled) {
      throw new ConflictException('Enrollment already exists');
    }

    const enrollment = this.enrollmentsRepository.create({
      student,
      course,
    });

    try {
      return this.toResponse(await this.enrollmentsRepository.save(enrollment));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        throw new ConflictException('Enrollment already exists');
      }
      throw error;
    }
  }

  async findAll(
    studentId?: number,
    courseId?: number,
  ): Promise<EnrollmentResponse[]> {
    const enrollments = await this.enrollmentsRepository.find({
      relations: { student: true, course: true },
      where: {
        ...(studentId === undefined ? {} : { student: { id: studentId } }),
        ...(courseId === undefined ? {} : { course: { id: courseId } }),
      },
    });

    return enrollments.map((enrollment) => this.toResponse(enrollment));
  }

  async findPage(query: EnrollmentsQueryDto) {
    const { q, studentId, courseId, page, limit, sort, order } = query;
    const sortColumn = {
      id: 'enrollment.id',
      studentName: 'student.name',
      courseTitle: 'course.title',
    }[sort];

    const builder = this.enrollmentsRepository
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.student', 'student')
      .innerJoinAndSelect('enrollment.course', 'course');

    if (q?.trim()) {
      builder.andWhere(
        '(student.name ILIKE :search OR student.email ILIKE :search OR course.title ILIKE :search)',
        { search: `%${q.trim()}%` },
      );
    }

    if (studentId !== undefined) {
      builder.andWhere('student.id = :studentId', { studentId });
    }

    if (courseId !== undefined) {
      builder.andWhere('course.id = :courseId', { courseId });
    }

    builder
      .orderBy(sortColumn, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [enrollments, total] = await builder.getManyAndCount();

    return {
      data: enrollments.map((enrollment) => this.toResponse(enrollment)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<EnrollmentResponse> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    return this.toResponse(enrollment);
  }

  async findByStudent(studentId: number): Promise<EnrollmentResponse[]> {
    await this.studentsService.findOne(studentId);
    return this.findAll(studentId);
  }

  async findByCourse(courseId: number): Promise<EnrollmentResponse[]> {
    await this.coursesService.findOne(String(courseId));
    return this.findAll(undefined, courseId);
  }

  async remove(id: number): Promise<EnrollmentResponse> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    const response = this.toResponse(enrollment);
    await this.enrollmentsRepository.remove(enrollment);
    return response;
  }

  private toResponse(enrollment: Enrollment): EnrollmentResponse {
    return {
      id: enrollment.id,
      studentId: enrollment.student.id,
      courseId: enrollment.course.id,
      student: {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        age: enrollment.student.age,
        career: enrollment.student.career,
        semester: enrollment.student.semester,
        isActive: enrollment.student.isActive,
      },
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        level: enrollment.course.level,
      },
    };
  }
}
