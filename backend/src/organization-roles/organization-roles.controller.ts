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

@Controller('organizations/:organizationId/roles')
export class OrganizationRolesController {

  constructor(
    private readonly organizationRolesService:
      OrganizationRolesService,
  ) {}


  // =========================================================
  // GET ORGANIZATION ROLES
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get()
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
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Post()
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