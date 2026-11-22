import type { FindManyOptions } from 'typeorm';
import type { Course } from '../entities/course.entity.js';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface CourseRepository {
  findAndCount(options: FindManyOptions<Course>): Promise<[Course[], number]>;
  findOneById(id: number): Promise<Course | null>;
  create(course: Partial<Course>): Course;
  save(course: Course): Promise<Course>;
  remove(course: Course): Promise<Course>;
}
