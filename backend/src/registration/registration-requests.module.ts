import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationRequest } from './registration-request.entity';
import { RegistrationRequestsController } from './registration-requests.controller';
import { RegistrationRequestsService } from './registration-requests.service';

import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistrationRequest,
      User,
      Organization,
      OrganizationRole,
      OrganizationMember,
    ]),

    AuthModule,
  ],

  controllers: [
    RegistrationRequestsController,
  ],

  providers: [
    RegistrationRequestsService,
  ],
})
export class RegistrationRequestsModule {}