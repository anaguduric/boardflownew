import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './userprofile.entity';
import { UserProfilesService } from './userprofiles.service';
import { UserProfilesController } from './userprofiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  providers: [UserProfilesService],
  controllers: [UserProfilesController],
  exports: [UserProfilesService, TypeOrmModule],
})
export class UserProfilesModule {}