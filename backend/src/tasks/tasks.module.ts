import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './task.entity';
import { Status } from './status.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Status,
    ]),
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