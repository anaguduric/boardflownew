import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Permission } from './permission.entity';

@Injectable()
export class PermissionsService {

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository:
      Repository<Permission>,
  ) {}


  // =========================================================
  // GET ALL PERMISSIONS
  // =========================================================

  async getAllPermissions() {

    const permissions =
      await this.permissionRepository.find({
        order: {
          module: 'ASC',
          action: 'ASC',
        },
      });


    return permissions.map((permission) => ({
      permission_id:
        permission.permission_id,

      name:
        permission.name,

      description:
        permission.description,

      module:
        permission.module,

      action:
        permission.action,

      created_at:
        permission.created_at,
    }));

  }


  // =========================================================
  // GET PERMISSIONS BY MODULE
  // =========================================================

  async getPermissionsByModule(
    module: string,
  ) {

    return this.permissionRepository.find({
      where: {
        module,
      },

      order: {
        action: 'ASC',
      },
    });

  }

}