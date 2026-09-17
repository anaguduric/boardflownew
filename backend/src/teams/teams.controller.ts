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
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
  ) {}

  // GET /teams
  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  // GET /teams/:id
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.teamsService.findOne(Number(id));
  }

  // POST /teams
  @Post()
  async create(
    @Body('team_name') teamName: string,
  ) {
    return this.teamsService.create(teamName);
  }

  // PATCH /teams/:id
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('team_name') teamName: string,
  ) {
    return this.teamsService.update(
      Number(id),
      teamName,
    );
  }

  // DELETE /teams/:id
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    await this.teamsService.remove(Number(id));

    return {
      message: 'Team deleted successfully',
    };
  }
}