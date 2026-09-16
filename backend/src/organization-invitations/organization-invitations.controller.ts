import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationInvitationsService } from './organization-invitations.service';

import { CreateOrganizationInvitationDto } from './dto/create-organization-invitation.dto';

import { AcceptInvitationDto } from './dto/accept-invitation.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationInvitationsController {
  constructor(
    private readonly organizationInvitationsService: OrganizationInvitationsService,
  ) {}

  // ============================================================
  // SLANJE POZIVA
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Post(':organizationId/invitations')
  async createInvitation(
    @Param(
      'organizationId',
      ParseIntPipe,
    )
    organizationId: number,

    @Body()
    dto: CreateOrganizationInvitationDto,

    @Req()
    req: any,
  ) {
    return this.organizationInvitationsService.createInvitation(
      organizationId,
      req.user.userId,
      dto.email,
      dto.roleId,
    );
  }

  // ============================================================
  // PRIHVATANJE POZIVA
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Post('invitations/accept')
  async acceptInvitation(
    @Body()
    dto: AcceptInvitationDto,

    @Req()
    req: any,
  ) {
    return this.organizationInvitationsService.acceptInvitation(
      dto.token,
      req.user.userId,
    );
  }
}