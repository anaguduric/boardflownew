import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Team } from './team.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
    ]),

    PermissionsModule,
  ],

  controllers: [
    TeamsController,
  ],

  providers: [
    TeamsService,
  ],

  exports: [
    TeamsService,
  ],
})
export class TeamsModule {}