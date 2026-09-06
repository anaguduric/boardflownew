import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  In,
  Repository,
} from 'typeorm';

import {
  RolePermission,
} from './role-permissions.entity';

import {
  Permission,
} from '../permissions/permission.entity';

import {
  OrganizationRole,
} from '../organization-roles/organization-role.entity';

@Injectable()
export class RolePermissionsService {

  constructor(

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository:
      Repository<RolePermission>,

    @InjectRepository(Permission)
    private readonly permissionRepository:
      Repository<Permission>,

    @InjectRepository(OrganizationRole)
    private readonly roleRepository:
      Repository<OrganizationRole>,

  ) {}


  // =========================================================
  // GET ROLE PERMISSIONS
  // =========================================================

  async getRolePermissions(
    organizationId: number,
    roleId: number,
  ) {

    // -------------------------------------------------------
    // PROVERA ROLE
    // -------------------------------------------------------

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id: roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new BadRequestException(
        'Role does not belong to this organization.',
      );

    }


    // -------------------------------------------------------
    // GET PERMISSIONS
    // -------------------------------------------------------

    const rolePermissions =
      await this.rolePermissionRepository.find({
        where: {
          role_id: roleId,
        },

        relations: [
          'permission',
        ],
      });


    return rolePermissions.map(
      (rolePermission) => ({

        permission_id:
          rolePermission.permission_id,

        name:
          rolePermission.permission.name,

        description:
          rolePermission.permission.description,

        module:
          rolePermission.permission.module,

        action:
          rolePermission.permission.action,

      }),
    );

  }


  // =========================================================
  // SET ROLE PERMISSIONS
  // =========================================================

  async setRolePermissions(
    organizationId: number,
    roleId: number,
    permissionIds: number[],
  ) {

    // -------------------------------------------------------
    // PROVERA ROLE
    // -------------------------------------------------------

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id: roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new BadRequestException(
        'Role does not belong to this organization.',
      );

    }


    // -------------------------------------------------------
    // VALIDACIJA PERMISSIONS
    // -------------------------------------------------------

    const permissions =
      permissionIds.length > 0
        ? await this.permissionRepository.find({
            where: {
              permission_id:
                In(permissionIds),
            },
          })
        : [];


    if (
      permissions.length !==
      permissionIds.length
    ) {

      throw new BadRequestException(
        'One or more permissions do not exist.',
      );

    }


    // -------------------------------------------------------
    // TRANSACTION
    // -------------------------------------------------------

    return this.rolePermissionRepository.manager
      .transaction(
        async (manager) => {

          // -----------------------------------------------
          // OBRIŠI STARE
          // -----------------------------------------------

          await manager.delete(
            RolePermission,
            {
              role_id: roleId,
            },
          );


          // -----------------------------------------------
          // DODAJ NOVE
          // -----------------------------------------------

          if (permissionIds.length > 0) {

            const newRolePermissions =
              permissionIds.map(
                (permissionId) =>
                  manager.create(
                    RolePermission,
                    {
                      role_id:
                        roleId,

                      permission_id:
                        permissionId,
                    },
                  ),
              );


            await manager.save(
              RolePermission,
              newRolePermissions,
            );

          }


          // -----------------------------------------------
          // RETURN
          // -----------------------------------------------

          return {
            success: true,

            role_id:
              roleId,

            permission_ids:
              permissionIds,
          };

        },
      );

  }

}