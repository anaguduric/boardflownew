import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleMembersService } from './role-members.service';

@Controller('role-members')
@UseGuards(JwtAuthGuard)
export class RoleMembersController {
  constructor(
    private readonly roleMembersService: RoleMembersService,
  ) {}

  @Get()
  async findAll() {
    return this.roleMembersService.findAll();
  }
}