import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationRolesService } from './organization-roles.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateOrganizationRoleDto } from './dto/create-organization-role.dto';

@Controller('organizations')
export class OrganizationRolesController {

  constructor(
    private readonly organizationRolesService:
      OrganizationRolesService,
  ) {}


  // =========================================================
  // ADMIN - ALL ROLES
  // GET /organizations/admin/roles
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get('admin/roles')
  async getAdminRoles(
    @Req() req: any,
  ) {

    console.log(
      'GET ADMIN ORGANIZATION ROLES',
    );

    console.log(
      'ADMIN USER ID:',
      req.user?.userId,
    );

    return this.organizationRolesService
      .getAdminRoles(
        req.user.userId,
      );
  }


  // =========================================================
  // GET ORGANIZATION ROLES
  // GET /organizations/:organizationId/roles
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/roles')
  async getOrganizationRoles(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Req() req: any,
  ) {

    console.log(
      'GET ORGANIZATION ROLES',
    );

    console.log(
      'ORGANIZATION ID:',
      organizationId,
    );

    console.log(
      'USER ID:',
      req.user?.userId,
    );

    return this.organizationRolesService
      .getOrganizationRoles(
        organizationId,
      );
  }


  // =========================================================
  // CREATE ORGANIZATION ROLE
  // POST /organizations/:organizationId/roles
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Post(':organizationId/roles')
  async createOrganizationRole(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Body()
    createOrganizationRoleDto:
      CreateOrganizationRoleDto,

    @Req() req: any,
  ) {

    console.log(
      'CREATE ORGANIZATION ROLE',
    );

    console.log(
      'ORGANIZATION ID:',
      organizationId,
    );

    console.log(
      'USER ID:',
      req.user?.userId,
    );

    console.log(
      'ROLE DATA:',
      createOrganizationRoleDto,
    );

    return this.organizationRolesService
      .createOrganizationRole(
        organizationId,
        createOrganizationRoleDto,
      );
  }
}