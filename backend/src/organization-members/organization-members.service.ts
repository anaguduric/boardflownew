import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrganizationMember } from './organization-member.entity';

@Injectable()
export class OrganizationMemberService {
  constructor(
    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,
  ) {}

  // =========================================================
  // CHECK USER MEMBERSHIP
  // =========================================================

  private async checkOrganizationMembership(
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
        relations: ['role'],
      });

    if (!membership) {
      throw new ForbiddenException(
        'Nemate pristup ovoj organizaciji.',
      );
    }

    return membership;
  }

  // =========================================================
  // GET MEMBERS OF ORGANIZATION
  // =========================================================

  async getOrganizationMembers(
    organizationId: number,
    userId: number,
  ) {
    // Provera da li korisnik pripada organizaciji
    await this.checkOrganizationMembership(
      organizationId,
      userId,
    );

    const members =
      await this.organizationMemberRepository.find({
        where: {
          organization_id: organizationId,
        },
        relations: [
          'user',
          'role',
        ],
        order: {
          created_at: 'ASC',
        },
      });

    return members.map((member) => ({
      membership_id: member.membership_id,

      user_id: member.user_id,

      username: member.user?.username ?? null,

      email: member.user?.email ?? null,

      role: member.role
        ? {
            role_id: member.role.role_id,
            name: member.role.name,
            description: member.role.description,
          }
        : null,

      status: member.status,

      joined_at: member.joined_at,

      left_at: member.left_at,
    }));
  }

  // =========================================================
  // GET ONE MEMBER
  // =========================================================

  async getMember(
    organizationId: number,
    membershipId: number,
    userId: number,
  ) {
    // Provera da li korisnik pripada organizaciji
    await this.checkOrganizationMembership(
      organizationId,
      userId,
    );

    const member =
      await this.organizationMemberRepository.findOne({
        where: {
          membership_id: membershipId,
          organization_id: organizationId,
        },
        relations: [
          'user',
          'role',
        ],
      });

    if (!member) {
      throw new NotFoundException(
        'Organization member not found',
      );
    }

    return {
      membership_id: member.membership_id,

      user_id: member.user_id,

      username: member.user?.username ?? null,

      email: member.user?.email ?? null,

      role: member.role
        ? {
            role_id: member.role.role_id,
            name: member.role.name,
            description: member.role.description,
          }
        : null,

      status: member.status,

      joined_at: member.joined_at,

      left_at: member.left_at,
    };
  }
}
