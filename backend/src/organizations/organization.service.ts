import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';

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
  ) {}


  // =====================================================
  // GET MY ORGANIZATIONS
  // =====================================================

  async getMyOrganizations(userId: number) {

    const memberships =
      await this.organizationMemberRepository.find({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
        relations: [
          'organization',
          'role',
        ],
      });


    return memberships.map((membership) => ({
      organization_id:
        membership.organization.organization_id,

      name:
        membership.organization.name,

      description:
        membership.organization.description,

      logo:
        membership.organization.logo,

      status:
        membership.organization.status,

      role: membership.role
        ? {
            role_id: membership.role.role_id,
            name: membership.role.name,
          }
        : null,
    }));
  }

  // =====================================================
// GET ONE ORGANIZATION
// =====================================================

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
      relations: [
        'organization',
        'role',
      ],
    });

  if (!membership) {
    throw new NotFoundException(
      'Organization not found',
    );
  }

  return {
    organization_id:
      membership.organization.organization_id,

    name:
      membership.organization.name,

    description:
      membership.organization.description,

    logo:
      membership.organization.logo,

    status:
      membership.organization.status,

    role: membership.role
      ? {
          role_id:
            membership.role.role_id,

          name:
            membership.role.name,
        }
      : null,
  };
}


  // =====================================================
  // CREATE ORGANIZATION
  // =====================================================

  async createOrganization(
    userId: number,
    createOrganizationDto: CreateOrganizationDto,
  ) {

    const {
      name,
      description,
    } = createOrganizationDto;


    // -----------------------------------------------------
    // PROVERA IMENA
    // -----------------------------------------------------

    const existingOrganization =
      await this.organizationRepository.findOne({
        where: {
          name,
        },
      });


    if (existingOrganization) {
      throw new BadRequestException(
        'Organization with this name already exists',
      );
    }


    // -----------------------------------------------------
    // TRANSAKCIJA
    // -----------------------------------------------------

    return this.organizationRepository.manager.transaction(
      async (manager) => {

        // ================================================
        // 1. CREATE ORGANIZATION
        // ================================================

        const organization =
          manager.create(
            Organization,
            {
              name,
              description:
                description || null,
              status: 'ACTIVE',
            },
          );


        const savedOrganization =
          await manager.save(
            Organization,
            organization,
          );


        // ================================================
        // 2. CREATE OWNER ROLE
        // ================================================

        const ownerRole =
          manager.create(
            OrganizationRole,
            {
              organization_id:
                savedOrganization.organization_id,

              name: 'Owner',

              description:
                'Organization owner',

              is_default: false,
            },
          );


        const savedRole =
          await manager.save(
            OrganizationRole,
            ownerRole,
          );


        // ================================================
        // 3. ADD CREATOR AS MEMBER
        // ================================================

        const membership =
          manager.create(
            OrganizationMember,
            {
              user_id: userId,

              organization_id:
                savedOrganization.organization_id,

              role_id:
                savedRole.role_id,

              status: 'ACTIVE',

              joined_at: new Date(),

              left_at: null,
            },
          );


        await manager.save(
          OrganizationMember,
          membership,
        );


        // ================================================
        // 4. RETURN ORGANIZATION
        // ================================================

        return {
          organization_id:
            savedOrganization.organization_id,

          name:
            savedOrganization.name,

          description:
            savedOrganization.description,

          status:
            savedOrganization.status,

          role: {
            role_id:
              savedRole.role_id,

            name:
              savedRole.name,
          },
        };

      },
    );
  }
}