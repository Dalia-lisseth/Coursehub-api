import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto/update-student.dto.js';
import { Student } from './entities/student.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  findAll(career?: string, semester?: number, isActive?: boolean) {
    return this.studentsRepository.find({
      where: {
        ...(career === undefined ? {} : { career }),
        ...(semester === undefined ? {} : { semester }),
        ...(isActive === undefined ? {} : { isActive }),
      },
    });
  }

  async findOne(id: number) {
    const student = await this.studentsRepository.findOneBy({ id });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  async create(createStudentDto: CreateStudentDto) {
    await this.ensureEmailIsAvailable(createStudentDto.email);
    const student = this.studentsRepository.create(createStudentDto);
    return this.save(student);
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);

    if (
      updateStudentDto.email !== undefined &&
      updateStudentDto.email !== student.email
    ) {
      await this.ensureEmailIsAvailable(updateStudentDto.email, id);
    }

    Object.assign(student, updateStudentDto);
    return this.save(student);
  }

  async delete(id: number) {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
    return student;
  }

  private async ensureEmailIsAvailable(email: string, excludedId?: number) {
    const student = await this.studentsRepository.findOneBy({ email });

    if (student && student.id !== excludedId) {
      throw new ConflictException(
        `A student with email ${email} already exists`,
      );
    }
  }

  private async save(student: Student) {
    try {
      return await this.studentsRepository.save(student);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        throw new ConflictException(
          `A student with email ${student.email} already exists`,
        );
      }
      throw error;
    }
  }
}