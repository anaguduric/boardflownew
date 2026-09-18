import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationRole } from './organization-role.entity';

import { CreateOrganizationRoleDto } from './dto/create-organization-role.dto';

import { Permission } from '../permissions/permission.entity';
import { RolePermission } from '../role-permissions/role-permissions.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrganizationRolesService {

  constructor(
    @InjectRepository(OrganizationRole)
    private readonly roleRepository:
      Repository<OrganizationRole>,

    @InjectRepository(Permission)
    private readonly permissionRepository:
      Repository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository:
      Repository<RolePermission>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository:
      Repository<OrganizationMember>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) {}


  // =========================================================
  // GET ROLES FOR ORGANIZATION
  // =========================================================

  async getOrganizationRoles(
    organizationId: number,
  ) {

    const roles =
      await this.roleRepository.find({
        where: {
          organization_id:
            organizationId,
        },

        order: {
          role_id: 'ASC',
        },
      });


    return roles.map((role) => ({

      role_id:
        role.role_id,

      organization_id:
        role.organization_id,

      name:
        role.name,

      description:
        role.description,

      is_default:
        role.is_default,

      created_at:
        role.created_at,

      updated_at:
        role.updated_at,

    }));

  }


  // =========================================================
  // GET SINGLE ROLE
  // =========================================================

  async getOrganizationRole(
    organizationId: number,
    roleId: number,
  ) {

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id:
            roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new NotFoundException(
        'Organization role not found.',
      );

    }


    return {

      role_id:
        role.role_id,

      organization_id:
        role.organization_id,

      name:
        role.name,

      description:
        role.description,

      is_default:
        role.is_default,

      created_at:
        role.created_at,

      updated_at:
        role.updated_at,

    };

  }


  // =========================================================
  // CREATE ROLE
  // =========================================================

  async createOrganizationRole(
    organizationId: number,
    dto: CreateOrganizationRoleDto,
  ) {

    const existingRole =
      await this.roleRepository.findOne({
        where: {
          organization_id:
            organizationId,

          name:
            dto.name,
        },
      });


    if (existingRole) {

      throw new BadRequestException(
        'Role with this name already exists in this organization.',
      );

    }


    // -------------------------------------------------------
    // DEFAULT ROLE
    // -------------------------------------------------------

    if (dto.is_default === true) {

      await this.roleRepository.update(
        {
          organization_id:
            organizationId,
        },
        {
          is_default:
            false,
        },
      );

    }


    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    const role =
      this.roleRepository.create({

        organization_id:
          organizationId,

        name:
          dto.name,

        description:
          dto.description ||
          null,

        is_default:
          dto.is_default ??
          false,

      });


    const savedRole =
      await this.roleRepository.save(
        role,
      );


    return {

      role_id:
        savedRole.role_id,

      organization_id:
        savedRole.organization_id,

      name:
        savedRole.name,

      description:
        savedRole.description,

      is_default:
        savedRole.is_default,

      created_at:
        savedRole.created_at,

      updated_at:
        savedRole.updated_at,

    };

  }


  // =========================================================
  // UPDATE ROLE
  // =========================================================

  async updateOrganizationRole(
    organizationId: number,
    roleId: number,
    data: {
      name?: string;
      description?: string | null;
      is_default?: boolean;
    },
  ) {

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id:
            roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new NotFoundException(
        'Organization role not found.',
      );

    }


    // -------------------------------------------------------
    // PROVERA IMENA
    // -------------------------------------------------------

    if (
      data.name &&
      data.name.trim() !== role.name
    ) {

      const existingRole =
        await this.roleRepository.findOne({
          where: {
            organization_id:
              organizationId,

            name:
              data.name.trim(),
          },
        });


      if (
        existingRole &&
        existingRole.role_id !== roleId
      ) {

        throw new BadRequestException(
          'Role with this name already exists in this organization.',
        );

      }

    }


    // -------------------------------------------------------
    // DEFAULT ROLE
    // -------------------------------------------------------

    if (data.is_default === true) {

      await this.roleRepository.update(
        {
          organization_id:
            organizationId,
        },
        {
          is_default:
            false,
        },
      );

    }


    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    if (data.name !== undefined) {

      role.name =
        data.name.trim();

    }


    if (
      data.description !== undefined
    ) {

      role.description =
        data.description?.trim() ||
        null;

    }


    if (
      data.is_default !== undefined
    ) {

      role.is_default =
        data.is_default;

    }


    const savedRole =
      await this.roleRepository.save(
        role,
      );


    return {

      role_id:
        savedRole.role_id,

      organization_id:
        savedRole.organization_id,

      name:
        savedRole.name,

      description:
        savedRole.description,

      is_default:
        savedRole.is_default,

      created_at:
        savedRole.created_at,

      updated_at:
        savedRole.updated_at,

    };

  }


  // =========================================================
  // GET ALL PERMISSIONS
  // =========================================================

  async getPermissions() {

    return this.permissionRepository.find({

      order: {
        module: 'ASC',
        permission_id: 'ASC',
      },

    });

  }


  // =========================================================
  // GET PERMISSIONS FOR ROLE
  // =========================================================

  async getRolePermissions(
    organizationId: number,
    roleId: number,
  ) {

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id:
            roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new NotFoundException(
        'Organization role not found.',
      );

    }


    const rolePermissions =
      await this.rolePermissionRepository.find({
        where: {
          role_id:
            roleId,
        },
      });


    const permissionIds =
      rolePermissions.map(
        (item) =>
          item.permission_id,
      );


    if (permissionIds.length === 0) {
      return [];
    }


    return this.permissionRepository.find({
      where: permissionIds.map(
        (permission_id) => ({
          permission_id,
        }),
      ),

      order: {
        module: 'ASC',
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
      await this.roleRepository.findOne({
        where: {
          role_id:
            roleId,

          organization_id:
            organizationId,
        },
      });


    if (!role) {

      throw new NotFoundException(
        'Organization role not found.',
      );

    }


    // -------------------------------------------------------
    // PROVERA PERMISSION ID-eva
    // -------------------------------------------------------

    const uniquePermissionIds =
      [
        ...new Set(
          permissionIds || [],
        ),
      ];


    if (
      uniquePermissionIds.length > 0
    ) {

      const permissions =
        await this.permissionRepository.find({
          where:
            uniquePermissionIds.map(
              (permission_id) => ({
                permission_id,
              }),
            ),
        });


      if (
        permissions.length !==
        uniquePermissionIds.length
      ) {

        throw new BadRequestException(
          'One or more permissions do not exist.',
        );

      }

    }


    // -------------------------------------------------------
    // OBRI STARE PERMISSIONS
    // -------------------------------------------------------

    await this.rolePermissionRepository.delete({
      role_id:
        roleId,
    });


    // -------------------------------------------------------
    // DODAJ NOVE
    // -------------------------------------------------------

    if (
      uniquePermissionIds.length > 0
    ) {

      const rolePermissions =
        uniquePermissionIds.map(
          (permissionId) =>
            this.rolePermissionRepository.create({

              role_id:
                roleId,

              permission_id:
                permissionId,

            }),
        );


      await this.rolePermissionRepository.save(
        rolePermissions,
      );

    }


    // -------------------------------------------------------
    // RETURN
    // -------------------------------------------------------

    return this.getRolePermissions(
      organizationId,
      roleId,
    );

  }


  // =========================================================
  // ADMIN - ALL ORGANIZATION ROLES
  // =========================================================

  async getAdminRoles(
    adminUserId: number,
  ) {

    // -------------------------------------------------------
    // CHECK SUPER ADMIN
    // -------------------------------------------------------

    const admin =
      await this.userRepository.findOne({
        where: {
          user_id:
            adminUserId,
        },

        relations: [
          'role',
        ],
      });


    console.log(
      'ADMIN USER ID:',
      adminUserId,
    );

    console.log(
      'ADMIN ROLE:',
      admin?.role?.role_name,
    );


    if (!admin) {

      throw new NotFoundException(
        'Admin user not found',
      );

    }


    const roleName =
      admin.role?.role_name
        ?.trim()
        .toUpperCase()
        .replace(/\s+/g, '_');


    console.log(
      'NORMALIZED ROLE:',
      roleName,
    );


    if (
      roleName !==
      'SUPER_ADMIN'
    ) {

      throw new ForbiddenException(
        'Only Super Admin can access this resource',
      );

    }


    // -------------------------------------------------------
    // GET ALL ORGANIZATION ROLES
    // -------------------------------------------------------

    const roles =
      await this.roleRepository.find({

        relations: [
          'organization',
        ],

        order: {
          role_id: 'DESC',
        },

      });


    // -------------------------------------------------------
    // GET MEMBER COUNTS + ORGANIZATION
    // -------------------------------------------------------

    const result =
      await Promise.all(

        roles.map(
          async (role) => {

            const memberCount =
              await this.organizationMemberRepository.count({
                where: {
                  role_id:
                    role.role_id,

                  status:
                    'ACTIVE',
                },
              });


            return {

              role_id:
                role.role_id,

              name:
                role.name,

              description:
                role.description,

              is_default:
                role.is_default,

              organization_id:
                role.organization_id,

              organization:
                role.organization
                  ? {

                      organization_id:
                        role.organization
                          .organization_id,

                      name:
                        role.organization
                          .name,

                      status:
                        role.organization
                          .status,

                    }

                  : null,

              member_count:
                memberCount,

              created_at:
                role.created_at,

              updated_at:
                role.updated_at,

            };

          },
        ),

      );


    return result;

  }

}