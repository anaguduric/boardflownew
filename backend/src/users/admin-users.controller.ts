import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getUsers(@Req() req: any) {
    return this.usersService.getAdminUsers(
      req.user.userId,
    );
  }
}