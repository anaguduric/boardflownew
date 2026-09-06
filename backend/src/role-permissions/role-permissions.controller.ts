import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  RolePermissionsService,
} from './role-permissions.service';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

@Controller(
  'organizations/:organizationId/roles/:roleId/permissions',
)
export class RolePermissionsController {

  constructor(
    private readonly rolePermissionsService:
      RolePermissionsService,
  ) {}


  // =========================================================
  // GET ROLE PERMISSIONS
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRolePermissions(

    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Param(
      'roleId',
      ParseIntPipe,
    )
    roleId: number,

    @Req() req: any,

  ) {

    console.log(
      'GET ROLE PERMISSIONS',
    );

    console.log(
      'ORGANIZATION:',
      organizationId,
    );

    console.log(
      'ROLE:',
      roleId,
    );

    console.log(
      'USER:',
      req.user?.userId,
    );


    return this.rolePermissionsService
      .getRolePermissions(
        organizationId,
        roleId,
      );

  }


  // =========================================================
  // SET ROLE PERMISSIONS
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Put()
  async setRolePermissions(

    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Param(
      'roleId',
      ParseIntPipe,
    )
    roleId: number,

    @Body()
    body: {
      permission_ids: number[];
    },

    @Req() req: any,

  ) {

    console.log(
      'SET ROLE PERMISSIONS',
    );

    console.log(
      'ORGANIZATION:',
      organizationId,
    );

    console.log(
      'ROLE:',
      roleId,
    );

    console.log(
      'PERMISSIONS:',
      body.permission_ids,
    );

    console.log(
      'USER:',
      req.user?.userId,
    );


    return this.rolePermissionsService
      .setRolePermissions(
        organizationId,
        roleId,
        body.permission_ids || [],
      );

  }

}