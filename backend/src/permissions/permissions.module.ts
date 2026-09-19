import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission } from './permission.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

import { PermissionGuard } from './permission.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
    ]),
  ],

  controllers: [
    PermissionsController,
  ],

  providers: [
    PermissionsService,
    PermissionGuard,
  ],

  exports: [
    PermissionsService,
    PermissionGuard,
  ],
})
export class PermissionsModule {}