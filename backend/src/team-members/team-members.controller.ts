import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamMembersService } from './team-members.service';

@Controller('team-members')
@UseGuards(JwtAuthGuard)
export class TeamMembersController {
  constructor(
    private readonly teamMembersService: TeamMembersService,
  ) {}

  // GET /team-members/team/:teamId
  @Get('team/:teamId')
  async findByTeam(
    @Param('teamId') teamId: string,
  ) {
    return this.teamMembersService.findByTeam(
      Number(teamId),
    );
  }

  // GET /team-members/:id
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.teamMembersService.findOne(
      Number(id),
    );
  }

  // POST /team-members
  @Post()
  async create(
    @Body('team_id') teamId: number,
    @Body('user_id') userId: number,
    @Body('role') role: string,
    @Body('rolemember_id') rolememberId: number,
  ) {
    return this.teamMembersService.create(
      Number(teamId),
      Number(userId),
      role,
      Number(rolememberId),
    );
  }

  // PATCH /team-members/:id
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('role') role: string,
    @Body('rolemember_id') rolememberId: number,
  ) {
    return this.teamMembersService.update(
      Number(id),
      role,
      Number(rolememberId),
    );
  }

  // DELETE /team-members/:id
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    await this.teamMembersService.remove(
      Number(id),
    );

    return {
      message: 'Team member removed successfully',
    };
  }
}