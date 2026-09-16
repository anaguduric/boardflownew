import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationInvitation } from './organization-invitation.entity';

import { OrganizationInvitationsService } from './organization-invitations.service';

import { OrganizationInvitationsController } from './organization-invitations.controller';

import { OrganizationMember } from '../organization-members/organization-member.entity';

import { OrganizationRole } from '../organization-roles/organization-role.entity';

import { User } from '../users/user.entity';

import { MailService } from '../auth/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationInvitation,
      OrganizationMember,
      OrganizationRole,
      User,
    ]),
  ],

  controllers: [
    OrganizationInvitationsController,
  ],

  providers: [
    OrganizationInvitationsService,
    MailService,
  ],

  exports: [
    OrganizationInvitationsService,
  ],
})
export class OrganizationInvitationsModule {}