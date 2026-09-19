import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationRolesService } from './organization-roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationRolesController {
  constructor(
    private readonly organizationRolesService: OrganizationRolesService,
  ) {}

  // =========================================================
  // ADMIN - ALL GLOBAL ROLES
  // GET /organizations/admin/roles
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get('admin/roles')
  async getAdminRoles(
    @Req() req: any,
  ) {
    return this.organizationRolesService.getAdminRoles(
      req.user.userId,
    );
  }

  // =========================================================
  // GET GLOBAL ORGANIZATION ROLES
  // GET /organizations/:organizationId/roles
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/roles')
  async getOrganizationRoles(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,
  ) {
    return this.organizationRolesService.getOrganizationRoles(
      organizationId,
    );
  }

  // =========================================================
  // GET SINGLE GLOBAL ROLE
  // GET /organizations/:organizationId/roles/:roleId
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/roles/:roleId')
  async getOrganizationRole(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.organizationRolesService.getOrganizationRole(
      organizationId,
      roleId,
    );
  }

  // =========================================================
  // UPDATE GLOBAL ROLE
  // PATCH /organizations/:organizationId/roles/:roleId
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Patch(':organizationId/roles/:roleId')
  async updateOrganizationRole(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,

    @Body()
    body: {
      description?: string | null;
    },
  ) {
    return this.organizationRolesService.updateOrganizationRole(
      organizationId,
      roleId,
      body.description,
    );
  }

  // =========================================================
  // GET ROLE PERMISSIONS
  // GET /organizations/:organizationId/roles/:roleId/permissions
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/roles/:roleId/permissions')
  async getRolePermissions(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,
  ) {
    return this.organizationRolesService.getRolePermissions(
      organizationId,
      roleId,
    );
  }

  // =========================================================
  // UPDATE ROLE PERMISSIONS
  // PUT /organizations/:organizationId/roles/:roleId/permissions
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Put(':organizationId/roles/:roleId/permissions')
  async updateRolePermissions(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Param('roleId', ParseIntPipe)
    roleId: number,

    @Body()
    body: {
      permission_ids: number[];
    },
  ) {
    return this.organizationRolesService.updateRolePermissions(
      organizationId,
      roleId,
      body.permission_ids,
    );
  }
}