import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';
import { User } from '../users/user.entity';

import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @InjectRepository(OrganizationRole)
    private readonly organizationRoleRepository: Repository<OrganizationRole>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================================================
  // GET MY ORGANIZATIONS
  // =========================================================

  async getMyOrganizations(userId: number) {
    const memberships =
      await this.organizationMemberRepository.find({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
        relations: ['organization', 'role'],
        order: {
          organization_id: 'ASC',
        },
      });

    return memberships.map(member => ({
      organization_id:
        member.organization.organization_id,

      name:
        member.organization.name,

      logo:
        member.organization.logo,

      description:
        member.organization.description,

      role: member.role
        ? {
            role_id: member.role.role_id,
            name: member.role.name,
            description: member.role.description,
          }
        : null,
    }));
  }

  // =========================================================
  // GET ORGANIZATION BY ID
  // =========================================================

  async getOrganizationById(
    organizationId: number,
    userId: number,
  ) {
    const membership =
      await this.organizationMemberRepository.findOne({
        where: {
          organization_id: organizationId,
          user_id: userId,
          status: 'ACTIVE',
        },
        relations: ['organization', 'role'],
      });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this organization.',
      );
    }

    return {
      ...membership.organization,

      role: membership.role
        ? {
            role_id: membership.role.role_id,
            name: membership.role.name,
            description: membership.role.description,
          }
        : null,
    };
  }

  // =========================================================
  // CREATE ORGANIZATION
  // =========================================================

  async createOrganization(
    userId: number,
    dto: CreateOrganizationDto,
  ) {
    const {
      name,
      description,
    } = dto;

    // ---------------------------------------------------------
    // Check organization name
    // ---------------------------------------------------------

    const existingOrganization =
      await this.organizationRepository.findOne({
        where: {
          name,
        },
      });

    if (existingOrganization) {
      throw new ConflictException(
        'An organization with this name already exists.',
      );
    }

    // ---------------------------------------------------------
    // Find GLOBAL Organization Owner role
    // ---------------------------------------------------------

    const ownerRole =
      await this.organizationRoleRepository.findOne({
        where: {
          name: 'Organization Owner',
        },
      });

    if (!ownerRole) {
      throw new NotFoundException(
        'Organization Owner role does not exist.',
      );
    }

    // ---------------------------------------------------------
    // Verify user exists
    // ---------------------------------------------------------

    const user =
      await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User does not exist.',
      );
    }

    // ---------------------------------------------------------
    // Create organization
    // ---------------------------------------------------------

    const organization =
      this.organizationRepository.create({
        name,
        description: description ?? null,
        logo: null,
      });

    const savedOrganization =
      await this.organizationRepository.save(
        organization,
      );

    // ---------------------------------------------------------
    // Creator automatically becomes Organization Owner
    // ---------------------------------------------------------

    const ownerMembership =
      this.organizationMemberRepository.create({
        user_id: userId,

        organization_id:
          savedOrganization.organization_id,

        role_id:
          ownerRole.role_id,

        status: 'ACTIVE',

        joined_at: new Date(),

        left_at: null,
      });

    await this.organizationMemberRepository.save(
      ownerMembership,
    );

    // ---------------------------------------------------------
    // Return created organization
    // ---------------------------------------------------------

    return {
      ...savedOrganization,

      role: {
        role_id: ownerRole.role_id,
        name: ownerRole.name,
        description: ownerRole.description,
      },
    };
  }

  // =========================================================
  // ADMIN ORGANIZATIONS
  // =========================================================

  async getAdminOrganizations(userId: number) {
    // ---------------------------------------------------------
    // Verify system user
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Only SUPER_ADMIN can access this endpoint
    // ---------------------------------------------------------

    if (
      !user.role ||
      user.role.role_name !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException(
        'Only super admins can access this endpoint.',
      );
    }

    // ---------------------------------------------------------
    // Get all organizations
    // ---------------------------------------------------------

    const organizations =
      await this.organizationRepository.find({
        relations: ['members'],
        order: {
          organization_id: 'ASC',
        },
      });

    // ---------------------------------------------------------
    // Find GLOBAL Organization Owner role
    // ---------------------------------------------------------

    const ownerRole =
      await this.organizationRoleRepository.findOne({
        where: {
          name: 'Organization Owner',
        },
      });

    // ---------------------------------------------------------
    // Get owner of every organization
    // ---------------------------------------------------------

    return Promise.all(
      organizations.map(
        async organization => {
          const ownerMembership =
            ownerRole
              ? await this.organizationMemberRepository.findOne({
                  where: {
                    organization_id:
                      organization.organization_id,

                    role_id:
                      ownerRole.role_id,

                    status: 'ACTIVE',
                  },

                  relations: [
                    'user',
                    'role',
                  ],
                })
              : null;

          return {
            ...organization,

            owner: ownerMembership
              ? {
                  user_id:
                    ownerMembership.user.user_id,

                  username:
                    ownerMembership.user.username,

                  email:
                    ownerMembership.user.email,
                }
              : null,
          };
        },
      ),
    );
  }
}