import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermission } from '../permissions/permission.decorator';

import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
  ) {}

  // =========================================================
  // GET /teams
  // =========================================================

  @Get()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'team',
    'view',
  )
  async findAll(
    @Req() req: any,
    @Query('organizationId') organizationId?: string,
  ) {
    const resolvedOrganizationId =
      req.permissionOrganizationId ||
      Number(organizationId);

    return this.teamsService.findAll(
      resolvedOrganizationId,
    );
  }

  // =========================================================
  // GET /teams/:id
  // =========================================================

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'team',
    'view',
  )
  async findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.teamsService.findOne(id);
  }

  // =========================================================
  // POST /teams
  // =========================================================

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'team',
    'create',
  )
  async create(
    @Body('team_name') teamName: string,
    @Body('organization_id') organizationId: number,
  ) {
    return this.teamsService.create(
      teamName,
      Number(organizationId),
    );
  }

  // =========================================================
  // PATCH /teams/:id
  // =========================================================

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'team',
    'update',
  )
  async update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body('team_name')
    teamName: string,
  ) {
    return this.teamsService.update(
      id,
      teamName,
    );
  }

  // =========================================================
  // DELETE /teams/:id
  // =========================================================

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionGuard,
  )
  @RequirePermission(
    'team',
    'delete',
  )
  async remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    await this.teamsService.remove(id);

    return {
      message:
        'Team deleted successfully',
    };
  }
}