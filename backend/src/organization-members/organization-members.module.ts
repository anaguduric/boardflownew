import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationMember } from './organization-member.entity';
import { OrganizationMemberService } from './organization-members.service';
import { OrganizationMemberController } from './organization-members.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationMember]),
  ],
  controllers: [
    OrganizationMemberController,
  ],
  providers: [
    OrganizationMemberService,
  ],
  exports: [
    OrganizationMemberService, TypeOrmModule,
  ],
})
export class OrganizationMembersModule {}