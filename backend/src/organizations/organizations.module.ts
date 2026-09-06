import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';

import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationRole,
      OrganizationMember,
    ]),
  ],

  controllers: [
    OrganizationController,
  ],

  providers: [
    OrganizationService,
  ],

  exports: [
    TypeOrmModule,
    OrganizationService,
  ],
})
export class OrganizationsModule {}