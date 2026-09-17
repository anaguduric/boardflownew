import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleMember } from './role-member.entity';
import { RoleMembersController } from './role-members.controller';
import { RoleMembersService } from './role-members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleMember]),
  ],
  controllers: [RoleMembersController],
  providers: [RoleMembersService],
  exports: [RoleMembersService],
})
export class RoleMembersModule {}