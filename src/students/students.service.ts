import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto/create-student.dto.js';

@Injectable()
export class StudentsService {
  private students: Array<CreateStudentDto & { id: number }> = [];

  findAll() {
    return this.students;
  }

  findOne(id: number) {
    const student = this.students.find((item) => item.id === id);

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  create(createStudentDto: CreateStudentDto) {
    const student = {
      id: this.students.length + 1,
      ...createStudentDto,
    };

    this.students.push(student);

    return student;
  }

  update(id: number, updateStudentDto: Partial<CreateStudentDto>) {
    const studentIndex = this.students.findIndex((item) => item.id === id);

    if (studentIndex === -1) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    this.students[studentIndex] = {
      ...this.students[studentIndex],
      ...updateStudentDto,
    };

    return this.students[studentIndex];
  }

  delete(id: number) {
    const studentIndex = this.students.findIndex((item) => item.id === id);

    if (studentIndex === -1) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    const [deletedStudent] = this.students.splice(studentIndex, 1);

    return deletedStudent;
  }
}