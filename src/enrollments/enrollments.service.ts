import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from '../courses/courses.service.js';
import { StudentsService } from '../students/students.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};
//El servicio de matrículas gestiona la creación, recuperación y eliminación de matrículas, asegurando que los estudiantes estén activos y que no haya duplicados.
@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}
//Verifica si el estudiante está activo antes de crear la matrícula. Si el estudiante no está activo, lanza una excepción BadRequestException con el mensaje 'Student is inactive'.
  async create(input: CreateEnrollmentDto): Promise<Enrollment> {
    const student = this.studentsService.findOne(input.studentId);
    const course = await this.coursesService.findOne(String(input.courseId));

    if (!course) {
      throw new NotFoundException(
        `Course with id ${input.courseId} not found`,
      );
    }

    if (!student.isActive) {
      throw new BadRequestException('Student is inactive');
    }
//Verifica si existe alguna matricula con el mismo studentId y courseId. Si existe, lanza una excepción BadRequestException con el mensaje 'Enrollment already exists'.
    const alreadyEnrolled = this.enrollments.some(
      (enrollment) =>
        enrollment.studentId === input.studentId &&
        enrollment.courseId === input.courseId,
    );

    if (alreadyEnrolled) {
      throw new BadRequestException('Enrollment already exists');
    }
//Crea un nuevo objeto de matrícula con un id único, studentId y courseId, lo agrega a la lista de matrículas y devuelve el objeto de matrícula creado.
    const enrollment: Enrollment = {
      id: this.nextId++,
      studentId: input.studentId,
      courseId: input.courseId,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }
//Devuelve todas las matrículas, filtradas opcionalmente por studentId y/o courseId. Si se proporciona studentId, devuelve solo las matrículas del estudiante correspondiente. Si se proporciona courseId, devuelve solo las matrículas del curso correspondiente. Si no se proporcionan filtros, devuelve todas las matrículas.
  findAll(studentId?: number, courseId?: number): Enrollment[] {
    return this.enrollments.filter(
      (enrollment) =>
        (studentId === undefined || enrollment.studentId === studentId) &&
        (courseId === undefined || enrollment.courseId === courseId),
    );
  }
//Devuelve una matrícula específica por su id. Si no se encuentra la matrícula,
//  lanza una excepción NotFoundException con un mensaje que indica que la matrícula
//  con el id especificado no fue encontrada.
  findOne(id: number): Enrollment {
    const enrollment = this.enrollments.find((item) => item.id === id);

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    return enrollment;
  }
//Devuelve todas las matrículas de un estudiante específico. 
// Primero verifica si el estudiante existe llamando a studentsService.findOne(studentId). 
// Luego llama a findAll(studentId) para obtener todas las matrículas del estudiante.
  findByStudent(studentId: number): Enrollment[] {
    this.studentsService.findOne(studentId);
    return this.findAll(studentId);
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    const course = await this.coursesService.findOne(String(courseId));

    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    return this.findAll(undefined, courseId);
  }
//Elimina una matrícula específica por su id. Primero llama a findOne(id) para obtener la matrícula. Luego encuentra el índice de la matrícula en la lista de matrículas y la elimina usando splice. Finalmente, devuelve la matrícula eliminada.
  remove(id: number): Enrollment {
    const enrollment = this.findOne(id);
    const index = this.enrollments.indexOf(enrollment);

    this.enrollments.splice(index, 1);
    return enrollment;
  }
}
