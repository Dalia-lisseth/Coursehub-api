import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto/create-student.dto.js';

@Injectable()
export class StudentsService {
  private students: CreateStudentDto[] = [];

  findAll() {
    return this.students;
  }

  create(createStudentDto: CreateStudentDto) {
    const student = {
      id: Date.now().toString(),
      ...createStudentDto,
    };

    this.students.push(student);

    return student;
  }
}