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
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Req() req: any,
  ) {
    console.log(
      'GET ORGANIZATION MEMBERS:',
      organizationId,
      'USER:',
      req.user.userId,
    );

    return this.organizationMemberService.getOrganizationMembers(
      organizationId,
      req.user.userId,
    );
  }

  // =========================================================
  // GET ONE MEMBER
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get(':organizationId/members/:membershipId')
  async getMember(
    @Param('organizationId', ParseIntPipe)
    organizationId: number,

    @Param('membershipId', ParseIntPipe)
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
