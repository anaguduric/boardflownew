import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskComment } from './task-comment.entity';
import { TaskCommentsController } from './task-comments.controller';
import { TaskCommentsService } from './task-comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskComment]),
  ],
  controllers: [
    TaskCommentsController,
  ],
  providers: [
    TaskCommentsService,
  ],
  exports: [
    TaskCommentsService,
  ],
})
export class TaskCommentsModule {}