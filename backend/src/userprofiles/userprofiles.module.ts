import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserProfile } from './userprofile.entity';
import { User } from '../users/user.entity';

import { UserProfilesService } from './userprofiles.service';
import { UserProfilesController } from './userprofiles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      User,
    ]),
  ],

  providers: [
    UserProfilesService,
  ],

  controllers: [
    UserProfilesController,
  ],

  exports: [
    UserProfilesService,
  ],
})
export class UserProfilesModule {}