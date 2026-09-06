import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  RolePermission,
} from './role-permissions.entity';

import {
  Permission,
} from '../permissions/permission.entity';

import {
  OrganizationRole,
} from '../organization-roles/organization-role.entity';

import {
  RolePermissionsService,
} from './role-permissions.service';

import {
  RolePermissionsController,
} from './role-permissions.controller';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      RolePermission,
      Permission,
      OrganizationRole,
    ]),

  ],

  controllers: [
    RolePermissionsController,
  ],

  providers: [
    RolePermissionsService,
  ],

  exports: [
    RolePermissionsService,
  ],

})
export class RolePermissionsModule {}