import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ProjectsService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/permission.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'project',
    'create',
  )
  async create(
    @Body()
    createProjectDto: CreateProjectDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    return this.projectsService.create(
      createProjectDto,
      userId,
      createProjectDto.organization_id,
    );
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'project',
    'view',
  )
  async findAll(
    @Req() req: any,
    @Query('organizationId') organizationId?: string,
  ) {
    const resolvedOrganizationId =
      req.permissionOrganizationId ||
      Number(organizationId);

    return this.projectsService.findAll(
      resolvedOrganizationId,
    );
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'project',
    'view',
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/tasks')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'project',
    'view',
  )
  async findTasks(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findTasks(id);
  }
}
