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

    console.log(
      'GET MY ORGANIZATIONS:',
      userId,
    );

    return this.organizationService
      .getMyOrganizations(userId);
  }


  // =====================================================
  // GET ONE ORGANIZATION
  // GET /organizations/:id
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrganizationById(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    const userId =
      req.user.userId;

    const organizationId =
      Number(id);

    console.log(
      'GET ORGANIZATION:',
      organizationId,
      'USER:',
      userId,
    );

    return this.organizationService
      .getOrganizationById(
        organizationId,
        userId,
      );
  }


  // =====================================================
  // CREATE ORGANIZATION
  // POST /organizations
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrganization(
    @Req() req: any,

    @Body()
    createOrganizationDto:
      CreateOrganizationDto,
  ) {

    const userId =
      req.user.userId;

    console.log(
      'CREATE ORGANIZATION USER:',
      userId,
    );

    return this.organizationService
      .createOrganization(
        userId,
        createOrganizationDto,
      );
  }
}
