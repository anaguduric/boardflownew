import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { OrganizationRole } from './organization-role.entity';
import { Permission } from '../permissions/permission.entity';
import { RolePermission } from '../role-permissions/role-permissions.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrganizationRolesService {
  private readonly allowedRoleNames = [
    'Organization Owner',
    'Admin',
    'Project Manager',
    'Member',
    'Viewer',
  ];

  constructor(
    @InjectRepository(OrganizationRole)
    private readonly organizationRoleRepository: Repository<OrganizationRole>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================================================
  // GET ORGANIZATION ROLES
  // =========================================================

  async getOrganizationRoles(
    organizationId: number,
  ) {
    // organizationId is intentionally not used.
    // Roles are GLOBAL.

    return this.organizationRoleRepository.find({
      order: {
        role_id: 'ASC',
      },
    });
  }

  // =========================================================
  // GET SINGLE ROLE
  // =========================================================

  async getOrganizationRole(
    organizationId: number,
    roleId: number,
  ) {
    // organizationId is intentionally not used.
    // Role is GLOBAL.

    const role =
      await this.organizationRoleRepository.findOne({
        where: {
          role_id: roleId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found.',
      );
    }

    return role;
  }

  // =========================================================
  // CREATE ROLE
  // =========================================================

  async createOrganizationRole(
    organizationId: number,
    name: string,
    description?: string,
  ) {
    throw new ForbiddenException(
      'Organization roles are predefined and cannot be created.',
    );
  }

  // =========================================================
  // UPDATE ROLE
  // =========================================================

  async updateOrganizationRole(
    organizationId: number,
    roleId: number,
    description?: string | null,
  ) {
    const role =
      await this.organizationRoleRepository.findOne({
        where: {
          role_id: roleId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found.',
      );
    }

    if (
      !this.allowedRoleNames.includes(
        role.name,
      )
    ) {
      throw new BadRequestException(
        'Invalid organization role.',
      );
    }

    // Role names are fixed.
    // Only description can be changed.

    if (description !== undefined) {
      role.description =
        description?.trim() || null;
    }

    // All five roles are predefined/default roles.
    role.is_default = true;

    return this.organizationRoleRepository.save(
      role,
    );
  }

  // =========================================================
  // GET ALL PERMISSIONS
  // =========================================================

  async getPermissions() {
    return this.permissionRepository.find({
      order: {
        permission_id: 'ASC',
      },
    });
  }

  // =========================================================
  // GET ROLE PERMISSIONS
  // =========================================================

  async getRolePermissions(
    organizationId: number,
    roleId: number,
  ) {
    const role =
      await this.organizationRoleRepository.findOne({
        where: {
          role_id: roleId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found.',
      );
    }

    return this.rolePermissionRepository.find({
      where: {
        role_id: roleId,
      },
      relations: ['permission'],
      order: {
        permission_id: 'ASC',
      },
    });
  }

  // =========================================================
  // UPDATE ROLE PERMISSIONS
  // =========================================================

  async updateRolePermissions(
    organizationId: number,
    roleId: number,
    permissionIds: number[],
  ) {
    const role =
      await this.organizationRoleRepository.findOne({
        where: {
          role_id: roleId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found.',
      );
    }

    if (
      !this.allowedRoleNames.includes(
        role.name,
      )
    ) {
      throw new BadRequestException(
        'Invalid organization role.',
      );
    }

    // ---------------------------------------------------------
    // Organization Owner always gets ALL permissions
    // ---------------------------------------------------------

    if (
      role.name === 'Organization Owner'
    ) {
      const allPermissions =
        await this.permissionRepository.find({
          order: {
            permission_id: 'ASC',
          },
        });

      permissionIds =
        allPermissions.map(
          permission =>
            permission.permission_id,
        );
    }

    // ---------------------------------------------------------
    // Remove duplicates
    // ---------------------------------------------------------

    permissionIds = [
      ...new Set(
        permissionIds.map(
          Number,
        ),
      ),
    ];

    // ---------------------------------------------------------
    // Verify permissions exist
    // ---------------------------------------------------------

    if (permissionIds.length > 0) {
      const permissions =
        await this.permissionRepository.find({
          where: {
            permission_id: In(
              permissionIds,
            ),
          },
        });

      if (
        permissions.length !==
        permissionIds.length
      ) {
        throw new BadRequestException(
          'One or more permissions do not exist.',
        );
      }
    }

    // ---------------------------------------------------------
    // Replace role permissions
    // ---------------------------------------------------------

    await this.rolePermissionRepository.delete({
      role_id: roleId,
    });

    // ---------------------------------------------------------
    // Save new permissions
    // ---------------------------------------------------------

    if (permissionIds.length > 0) {
      const rolePermissions =
        permissionIds.map(
          permissionId =>
            this.rolePermissionRepository.create({
              role_id: roleId,
              permission_id:
                permissionId,
            }),
        );

      await this.rolePermissionRepository.save(
        rolePermissions,
      );
    }

    // ---------------------------------------------------------
    // Return updated permissions
    // ---------------------------------------------------------

    return this.getRolePermissions(
      organizationId,
      roleId,
    );
  }

  // =========================================================
  // ADMIN - GET ALL GLOBAL ROLES
  // =========================================================

  async getAdminRoles(
    userId: number,
  ) {
    const user =
      await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
        relations: ['role'],
      });

    if (!user) {
      throw new NotFoundException(
        'User does not exist.',
      );
    }

    if (
      !user.role ||
      user.role.role_name !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException(
        'Only super admins can access this endpoint.',
      );
    }

    const roles =
      await this.organizationRoleRepository.find({
        relations: ['members'],
        order: {
          role_id: 'ASC',
        },
      });

    return roles.map(role => ({
      role_id:
        role.role_id,

      name:
        role.name,

      description:
        role.description,

      is_default:
        role.is_default,

      member_count:
        role.members?.length ?? 0,

      created_at:
        role.created_at,

      updated_at:
        role.updated_at,
    }));
  }
}