import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { OrganizationMemberService } from './organization-members.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService,
  ) {}

  // =========================================================
  // GET ORGANIZATION MEMBERS
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/members')
  async getOrganizationMembers(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,
  ) {
    console.log(
      'GET ORGANIZATION MEMBERS:',
      organizationId,
    );

    return this.organizationMemberService
      .getOrganizationMembers(
        organizationId,
      );
  }

  // =========================================================
  // GET ONE MEMBER
  // =========================================================

  @UseGuards(JwtAuthGuard)
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
  ) {
    return this.organizationMemberService
      .getMember(
        organizationId,
        membershipId,
      );
  }
}