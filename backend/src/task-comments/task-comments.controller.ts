import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('task-comments')
@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
  constructor(
    private readonly taskCommentsService: TaskCommentsService,
  ) {}

  // =========================================================
  // GET COMMENTS FOR TASK
  // GET /task-comments/task/7
  // =========================================================

  @Get('task/:taskId')
  async getComments(
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.taskCommentsService.findByTask(taskId);
  }

  // =========================================================
  // CREATE COMMENT
  // POST /task-comments/task/7
  // =========================================================

  @Post('task/:taskId')
  async createComment(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateTaskCommentDto,
    @Req() req: any,
  ) {
    return this.taskCommentsService.create(
      taskId,
      req.user.userId,
      dto,
    );
  }

  // =========================================================
  // DELETE COMMENT
  // DELETE /task-comments/12
  // =========================================================

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ) {
    return this.taskCommentsService.remove(
      commentId,
      req.user.userId,
    );
  }
}