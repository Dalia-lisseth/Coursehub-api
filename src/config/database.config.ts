import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Course } from '../courses/entities/course.entity.js';
import { Enrollment } from '../enrollments/entities/enrollment.entity.js';
import { Student } from '../students/entities/student.entity.js';

export function createDatabaseConfig(
  config: ConfigService,
): TypeOrmModuleOptions {
  const environment = config.getOrThrow<string>('NODE_ENV');

  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DATABASE_HOST'),
    port: config.getOrThrow<number>('DATABASE_PORT'),
    username: config.getOrThrow<string>('DATABASE_USER'),
    password: config.getOrThrow<string>('DATABASE_PASSWORD'),
    database: config.getOrThrow<string>('DATABASE_NAME'),
    entities: [Course, Student, Enrollment],
    synchronize:
      environment !== 'production' &&
      config.getOrThrow<string>('DATABASE_SYNCHRONIZE') === 'true',
  };
}
