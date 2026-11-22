import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity.js';
import type { CourseRepository } from '../ports/course-repository.port.js';

@Injectable()
export class TypeOrmCourseRepository implements CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  findAndCount(options: Parameters<Repository<Course>['findAndCount']>[0]) {
    return this.repository.findAndCount(options);
  }

  findOneById(id: number) {
    return this.repository.findOneBy({ id });
  }

  create(course: Partial<Course>) {
    return this.repository.create(course);
  }

  save(course: Course) {
    return this.repository.save(course);
  }

  remove(course: Course) {
    return this.repository.remove(course);
  }
}
