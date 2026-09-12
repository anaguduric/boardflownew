import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {

  constructor(
    private readonly tasksService: TasksService,
  ) {}

  // =============================
  // CREATE TASK
  // =============================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    return this.tasksService.create(
      createTaskDto,
      userId,
    );
  }

  // =============================
  // GET ALL TASKS
  // =============================

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.tasksService.findAll();
  }

  // =============================
  // GET ONE TASK
  // =============================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.findOne(id);
  }

  // =============================
  // UPDATE TASK STATUS
  // =============================

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status_id', ParseIntPipe) statusId: number,
  ) {
    return this.tasksService.updateStatus(id, statusId);
  }

    // =============================
  // UPDATE TASK
  // =============================

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
    );
  }

  // =============================
// DELETE TASK
// =============================

@Delete(':id')
@UseGuards(JwtAuthGuard)
async remove(
  @Param('id', ParseIntPipe) id: number,
) {
  await this.tasksService.remove(id);

  return {
    message: 'Task deleted successfully',
  };
}
}