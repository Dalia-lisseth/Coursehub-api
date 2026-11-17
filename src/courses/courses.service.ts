import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { Course } from './entities/course.entity.js';
import { UserRole } from '../auth/roles.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(query: CoursesQueryDto) {
    const { level, page, limit, sort, order } = query;
    const [data, total] = await this.coursesRepository.findAndCount({
      where: level ? { level } : {},
      order: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOneBy({ id: Number(id) });
    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }
    return course;
  }

  create(dto: CreateCourseDto, userId: number) {
    const course = this.coursesRepository.create({ ...dto, ownerId: userId });
    return this.coursesRepository.save(course);
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    userId: number,
    role: UserRole,
  ) {
    const course = await this.findOne(id);
    this.ensureCanManage(course, userId, role);
    Object.assign(course, dto);
    return this.coursesRepository.save(course);
  }

  async remove(id: string, userId: number, role: UserRole) {
    const course = await this.findOne(id);
    this.ensureCanManage(course, userId, role);
    await this.coursesRepository.remove(course);
    return course;
  }

  private ensureCanManage(course: Course, userId: number, role: UserRole) {
    if (role !== UserRole.ADMIN && course.ownerId !== userId) {
      throw new ForbiddenException('You can only modify your own courses');
    }
  }
}
