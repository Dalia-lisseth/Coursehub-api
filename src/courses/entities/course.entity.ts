import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Enrollment } from '../../enrollments/entities/enrollment.entity.js';
import type { User } from '../../users/entities/user.entity.js';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  level: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: number | null;

  @ManyToOne('User', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany('Enrollment', 'course')
  enrollments: Enrollment[];
}
