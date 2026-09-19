import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/permission.decorator';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'create',
  )
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

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'view',
  )
  async findAll(
    @Req() req: any,
    @Query('organizationId') organizationId?: string,
  ) {
    const resolvedOrganizationId =
      req.permissionOrganizationId ||
      Number(organizationId);

    return this.tasksService.findAll(
      resolvedOrganizationId,
    );
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'view',
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'update',
  )
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,

    @Body(
      'status_id',
      ParseIntPipe,
    )
    statusId: number,
  ) {
    return this.tasksService.updateStatus(
      id,
      statusId,
    );
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'update',
  )
  async update(
    @Param('id', ParseIntPipe) id: number,

    @Body()
    updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
    );
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'task',
    'delete',
  )
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.tasksService.remove(id);

    return {
      message: 'Task deleted successfully',
    };
  }
}