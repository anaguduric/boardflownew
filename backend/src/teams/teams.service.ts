import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Team } from './team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  // GET ALL TEAMS
  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      order: {
        team_id: 'DESC',
      },
    });
  }

  // GET ONE TEAM
  async findOne(teamId: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: {
        team_id: teamId,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  // CREATE TEAM
  async create(teamName: string): Promise<Team> {
    const team = this.teamRepository.create({
      team_name: teamName,
      created_at: new Date(),
    });

    return this.teamRepository.save(team);
  }

  // UPDATE TEAM
  async update(
    teamId: number,
    teamName: string,
  ): Promise<Team> {
    const team = await this.findOne(teamId);

    team.team_name = teamName;

    return this.teamRepository.save(team);
  }

  // DELETE TEAM
  async remove(teamId: number): Promise<void> {
    const team = await this.findOne(teamId);

    await this.teamRepository.remove(team);
  }
}