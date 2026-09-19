import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { Task } from '../tasks/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: number,
    organizationId: number,
  ): Promise<Project> {
    const project =
      this.projectRepository.create({
        project_name:
          createProjectDto.project_name,

        description:
          createProjectDto.description ?? null,

        organization_id:
          organizationId,

        created_by:
          userId,
      });

    return this.projectRepository.save(project);
  }

  async findAll(
    organizationId: number,
  ): Promise<Project[]> {
    return this.projectRepository.find({
      where: {
        organization_id: organizationId,
      },

      relations: [
        'creator',
      ],

      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(
    projectId: number,
  ): Promise<Project> {
    const project =
      await this.projectRepository.findOne({
        where: {
          project_id: projectId,
        },

        relations: [
          'creator',
        ],
      });

    if (!project) {
      throw new NotFoundException(
        'Project not found',
      );
    }

    return project;
  }

  async findTasks(
    projectId: number,
  ): Promise<Task[]> {
    const project =
      await this.projectRepository.findOne({
        where: {
          project_id: projectId,
        },
      });

    if (!project) {
      throw new NotFoundException(
        'Project not found',
      );
    }

    return this.taskRepository.find({
      where: {
        project_id: projectId,
      },

      relations: [
        'project',
        'creator',
        'assignee',
        'status',
      ],

      order: {
        created_at: 'DESC',
      },
    });
  }
}