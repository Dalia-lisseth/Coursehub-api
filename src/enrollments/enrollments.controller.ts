import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsService } from './enrollments.service.js';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() body: CreateEnrollmentDto) {
    return this.enrollmentsService.create(body);
  }

  @Get()
  findAll(
    @Query('studentId', new ParseIntPipe({ optional: true }))
    studentId?: number,
    @Query('courseId', new ParseIntPipe({ optional: true }))
    courseId?: number,
  ) {
    return this.enrollmentsService.findAll(studentId, courseId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
