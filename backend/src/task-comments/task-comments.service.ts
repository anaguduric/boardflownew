import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskComment } from './task-comment.entity';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly taskCommentsRepository: Repository<TaskComment>,
  ) {}

  // =========================================================
  // GET COMMENTS FOR TASK
  // =========================================================

  async findByTask(taskId: number) {
    return this.taskCommentsRepository.find({
      where: {
        task_id: taskId,
      },
      relations: {
      user: true,
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  // =========================================================
  // CREATE COMMENT
  // =========================================================

  async create(
    taskId: number,
    userId: number,
    dto: CreateTaskCommentDto,
  ) {
    const comment = this.taskCommentsRepository.create({
      task_id: taskId,
      user_id: userId,
      comment_text: dto.comment_text.trim(),
    });

    return this.taskCommentsRepository.save(comment);
  }

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  async remove(commentId: number, userId: number) {
    const comment = await this.taskCommentsRepository.findOne({
      where: {
        comment_id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Komentar nije pronađen.');
    }

    // Samo autor komentara može da ga obriše
    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'Nemate dozvolu za brisanje ovog komentara.',
      );
    }

    await this.taskCommentsRepository.remove(comment);

    return {
      message: 'Komentar je uspešno obrisan.',
    };
  }
}