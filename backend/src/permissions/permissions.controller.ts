import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('permissions')
export class PermissionsController {

  constructor(
    private readonly permissionsService:
      PermissionsService,
  ) {}


  // =========================================================
  // GET ALL PERMISSIONS
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPermissions(
    @Req() req: any,
  ) {

    console.log(
      'GET ALL PERMISSIONS',
    );

    console.log(
      'USER ID:',
      req.user?.userId,
    );


    return this.permissionsService
      .getAllPermissions();

  }


  // =========================================================
  // GET PERMISSIONS BY MODULE
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get('module/:module')
  async getPermissionsByModule(
    @Param('module')
    module: string,

    @Req() req: any,
  ) {

    console.log(
      'GET PERMISSIONS BY MODULE',
    );

    console.log(
      'MODULE:',
      module,
    );

    console.log(
      'USER ID:',
      req.user?.userId,
    );


    return this.permissionsService
      .getPermissionsByModule(
        module,
      );

  }

}