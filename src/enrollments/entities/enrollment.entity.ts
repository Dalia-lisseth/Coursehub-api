import {
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
  Unique,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity.js';
import { Student } from '../../students/entities/student.entity.js';

@Entity('enrollments')
@Unique('UQ_enrollments_student_course', ['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
