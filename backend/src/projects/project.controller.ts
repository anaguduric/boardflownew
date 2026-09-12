import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ProjectsService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: any,
  ) {
    console.log('REQ.USER:', req.user);
    console.log('USER ID:', req.user?.userId);

    const userId = req.user.userId;

    return this.projectsService.create(
      createProjectDto,
      userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/tasks')
  @UseGuards(JwtAuthGuard)
  async findTasks(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findTasks(id);
  }
}