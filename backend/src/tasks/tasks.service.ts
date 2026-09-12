import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity';
import { Status } from './status.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  // =============================
  // CREATE TASK
  // =============================

  async create(
    createTaskDto: CreateTaskDto,
    userId: number,
  ): Promise<Task> {

    const status = await this.statusRepository.findOne({
      where: {
        status_id: createTaskDto.status_id,
      },
    });

    if (!status) {
      throw new NotFoundException(
        'Status not found',
      );
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status_id: createTaskDto.status_id,
      due_date: new Date(createTaskDto.due_date),
      assigned_to: createTaskDto.assigned_to,
      created_by: userId,
      project_id: createTaskDto.project_id,
    });

    return this.taskRepository.save(task);
  }

  // =============================
  // GET ALL TASKS
  // =============================

  async findAll(): Promise<Task[]> {

    return this.taskRepository.find({
      relations: [
        'project',
        'creator',
        'assignee',
      ],

      order: {
        created_at: 'DESC',
      },
    });
  }

  // =============================
  // GET ONE TASK
  // =============================

  async findOne(taskId: number): Promise<Task> {

    const task = await this.taskRepository.findOne({
      where: {
        task_id: taskId,
      },

      relations: [
        'project',
        'creator',
        'assignee',
      ],
    });

    if (!task) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    return task;
  }

  // =============================
  // UPDATE TASK STATUS
  // =============================

  async updateStatus(
    taskId: number,
    statusId: number,
  ): Promise<Task> {

    const task = await this.taskRepository.findOne({
      where: {
        task_id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException(
        'Task not found',
      );
    }

    const status = await this.statusRepository.findOne({
      where: {
        status_id: statusId,
      },
    });

    if (!status) {
      throw new NotFoundException(
        'Status not found',
      );
    }

    task.status_id = statusId;
    task.updated_at = new Date();

    return this.taskRepository.save(task);
  }
 // =============================
  // UPDATE TASK
  // =============================

  async update(
  taskId: number,
  updateTaskDto: UpdateTaskDto,
): Promise<Task> {
  const task = await this.taskRepository.findOne({
    where: { task_id: taskId },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const status = await this.statusRepository.findOne({
    where: {
      status_id: updateTaskDto.status_id,
    },
  });

  if (!status) {
    throw new NotFoundException('Status not found');
  }

  task.title = updateTaskDto.title;
  task.description = updateTaskDto.description;
  task.status_id = updateTaskDto.status_id;
  task.due_date = new Date(updateTaskDto.due_date);
  task.assigned_to = updateTaskDto.assigned_to;
  task.updated_at = new Date();

  return this.taskRepository.save(task);
}

// =============================
// REMOVE TASK
// =============================
async remove(taskId: number): Promise<void> {
  const task = await this.taskRepository.findOne({
    where: { task_id: taskId },
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  await this.taskRepository.remove(task);
}

}