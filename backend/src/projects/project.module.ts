import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { ProjectsService } from './project.service';
import { ProjectsController } from './project.controller';

import { Task } from '../tasks/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Task,
    ]),
  ],

  controllers: [
    ProjectsController,
  ],

  providers: [
    ProjectsService,
  ],

  exports: [
    ProjectsService,
  ],
})
export class ProjectsModule {}