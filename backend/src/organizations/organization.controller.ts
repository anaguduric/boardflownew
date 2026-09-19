import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationService } from './organization.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/permission.decorator';

import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
  ) {}

  // =====================================================
  // MY ORGANIZATIONS
  // GET /organizations/my
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrganizations(
    @Req() req: any,
  ) {
    const userId =
      req.user.userId;

    return this.organizationService.getMyOrganizations(
      userId,
    );
  }

  // =====================================================
  // ADMIN - ALL ORGANIZATIONS
  // GET /organizations/admin/all
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAdminOrganizations(
    @Req() req: any,
  ) {
    return this.organizationService.getAdminOrganizations(
      req.user.userId,
    );
  }

  // =====================================================
  // GET ONE ORGANIZATION
  // GET /organizations/:id
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'organization',
    'view',
  )
  @Get(':id')
  async getOrganizationById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      req.user.userId;

    const organizationId =
      Number(id);

    return this.organizationService.getOrganizationById(
      organizationId,
      userId,
    );
  }

  // =====================================================
  // CREATE ORGANIZATION
  // POST /organizations
  //
  // PermissionGuard se NE koristi ovde.
  // Korisnik još nema membership u novoj organizaciji.
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrganization(
    @Req() req: any,
    @Body()
    createOrganizationDto: CreateOrganizationDto,
  ) {
    const userId =
      req.user.userId;

    return this.organizationService.createOrganization(
      userId,
      createOrganizationDto,
    );
  }
}