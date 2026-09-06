import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationRolesController } from './organization-roles.controller';

import { OrganizationRolesService } from './organization-roles.service';

import { OrganizationRole } from './organization-role.entity';

import { Permission } from '../permissions/permission.entity';

import { RolePermission } from '../role-permissions/role-permissions.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      OrganizationRole,
      Permission,
      RolePermission,
    ]),

  ],

  controllers: [
    OrganizationRolesController,
  ],

  providers: [
    OrganizationRolesService,
  ],

  exports: [
    OrganizationRolesService,
  ],

})

export class OrganizationRolesModule {}
