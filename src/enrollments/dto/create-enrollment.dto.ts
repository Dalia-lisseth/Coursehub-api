import { IsInt, Min } from 'class-validator';
//define como deben llegar los datos para crear una matricula, studentId y courseId deben ser enteros y mayores a 0.
export class CreateEnrollmentDto {
  @IsInt()
  @Min(1)
  studentId: number;

  @IsInt()
  @Min(1)
  courseId: number;
}
