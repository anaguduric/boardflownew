import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './task.entity';
import { Status } from './status.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Status,
    ]),

    PermissionsModule,
  ],

  controllers: [
    TasksController,
  ],

  providers: [
    TasksService,
  ],

  exports: [
    TasksService,
  ],
})
export class TasksModule {}