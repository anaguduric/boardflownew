import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationMemberService } from './organization-members.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/permission.decorator';

@Controller('organizations')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  // =========================================================
  // GET ORGANIZATION MEMBERS
  // GET /organizations/:organizationId/members
  // =========================================================

  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'member',
    'view',
  )
  @Get(':organizationId/members')
  async getOrganizationMembers(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Req() req: any,
  ) {
    return this.organizationMemberService.getOrganizationMembers(
      organizationId,
      req.user.userId,
    );
  }

  // =========================================================
  // GET ONE MEMBER
  // GET /organizations/:organizationId/members/:membershipId
  // =========================================================

  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'member',
    'view',
  )
  @Get(':organizationId/members/:membershipId')
  async getMember(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Param(
      'membershipId',
      ParseIntPipe,
    )
    membershipId: number,

    @Req() req: any,
  ) {
    return this.organizationMemberService.getMember(
      organizationId,
      membershipId,
      req.user.userId,
    );
  }
}