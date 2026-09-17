import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamMember } from './team-member.entity';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';

import { User } from '../users/user.entity';
import { UserProfile } from '../userprofiles/userprofile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeamMember,
      User,
      UserProfile,
    ]),
  ],
  controllers: [
    TeamMembersController,
  ],
  providers: [
    TeamMembersService,
  ],
  exports: [
    TeamMembersService,
  ],
})
export class TeamMembersModule {}