import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { OrganizationInvitation } from './organization-invitation.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { MailService } from '../auth/mail.service';
import { User } from '../users/user.entity';

@Injectable()
export class OrganizationInvitationsService {
  constructor(
    @InjectRepository(OrganizationInvitation)
    private readonly invitationRepository: Repository<OrganizationInvitation>,

    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,

    @InjectRepository(OrganizationRole)
    private readonly roleRepository: Repository<OrganizationRole>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly mailService: MailService,
  ) {}

  // ============================================================
  // PROVERA DA LI USER SME DA POZIVA ČLANOVE
  // ============================================================

  private async checkInvitePermission(
    organizationId: number,
    userId: number,
  ) {
    const membership =
      await this.memberRepository.findOne({
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

    const roleName =
      membership.role?.name
        ?.trim()
        .toLowerCase();

    const allowedRoles = [
      'organization owner',
      'admin',
    ];

    if (
      !roleName ||
      !allowedRoles.includes(roleName)
    ) {
      throw new ForbiddenException(
        'Samo Organization Owner ili Admin mogu pozivati članove.',
      );
    }

    return membership;
  }

  // ============================================================
  // KREIRANJE POZIVA
  // ============================================================

  async createInvitation(
    organizationId: number,
    userId: number,
    email: string,
    roleId: number,
  ) {
    // ----------------------------------------------------------
    // 1. Provera prava
    // ----------------------------------------------------------

    await this.checkInvitePermission(
      organizationId,
      userId,
    );

    const normalizedEmail =
      email.trim().toLowerCase();

    // ----------------------------------------------------------
    // 2. Provera GLOBALNE organization role
    // ----------------------------------------------------------

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id: roleId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Izabrana organizaciona uloga ne postoji.',
      );
    }

    // ----------------------------------------------------------
    // 3. Provera da li korisnik već nije član
    // ----------------------------------------------------------

    const existingMembers =
      await this.memberRepository.find({
        where: {
          organization_id: organizationId,
          status: 'ACTIVE',
        },
        relations: ['user'],
      });

    const alreadyMember =
      existingMembers.some(
        member =>
          member.user?.email
            ?.trim()
            .toLowerCase() ===
          normalizedEmail,
      );

    if (alreadyMember) {
      throw new ConflictException(
        'Korisnik je već član ove organizacije.',
      );
    }

    // ----------------------------------------------------------
    // 4. Provera postojećeg PENDING poziva
    // ----------------------------------------------------------

    const existingInvitation =
      await this.invitationRepository.findOne({
        where: {
          organization_id: organizationId,
          email: normalizedEmail,
          status: 'PENDING',
        },
      });

    if (existingInvitation) {
      throw new ConflictException(
        'Poziv za ovaj email je već poslat.',
      );
    }

    // ----------------------------------------------------------
    // 5. Generisanje sigurnog tokena
    // ----------------------------------------------------------

    const token =
      randomBytes(32).toString('hex');

    // ----------------------------------------------------------
    // 6. Poziv važi 48 sati
    // ----------------------------------------------------------

    const expiresAt =
      new Date(
        Date.now() +
          48 * 60 * 60 * 1000,
      );

    // ----------------------------------------------------------
    // 7. Kreiranje invitation-a
    // ----------------------------------------------------------

    const invitation =
      this.invitationRepository.create({
        organization_id:
          organizationId,

        email:
          normalizedEmail,

        role_id:
          roleId,

        invited_by:
          userId,

        token,

        status:
          'PENDING',

        expires_at:
          expiresAt,

        accepted_at:
          null,
      });

    const savedInvitation =
      await this.invitationRepository.save(
        invitation,
      );

    // ----------------------------------------------------------
    // 8. SLANJE EMAIL POZIVA
    // ----------------------------------------------------------

    const emailSent =
      await this.mailService.sendOrganizationInvitationEmail(
        normalizedEmail,
        role.name,
        token,
        expiresAt,
      );

    if (!emailSent) {
      console.error(
        '❌ Invitation je sačuvan, ali email nije poslat.',
      );
    }

    // ----------------------------------------------------------
    // 9. RESPONSE
    // ----------------------------------------------------------

    return {
      message:
        emailSent
          ? 'Poziv je uspešno poslat na email adresu.'
          : 'Poziv je kreiran, ali email nije moguće poslati.',

      emailSent,

      invitation: {
        invitation_id:
          savedInvitation.invitation_id,

        email:
          savedInvitation.email,

        role_id:
          savedInvitation.role_id,

        status:
          savedInvitation.status,

        expires_at:
          savedInvitation.expires_at,

        token:
          savedInvitation.token,
      },
    };
  }

  // ============================================================
  // PRIHVATANJE POZIVA
  // ============================================================

  async acceptInvitation(
    token: string,
    userId: number,
  ) {
    // ----------------------------------------------------------
    // 1. Pronađi invitation
    // ----------------------------------------------------------

    const invitation =
      await this.invitationRepository.findOne({
        where: {
          token,
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        'Poziv nije pronađen.',
      );
    }

    // ----------------------------------------------------------
    // 2. Provera statusa
    // ----------------------------------------------------------

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        'Ovaj poziv više nije aktivan.',
      );
    }

    // ----------------------------------------------------------
    // 3. Provera isteka
    // ----------------------------------------------------------

    if (
      invitation.expires_at.getTime() <
      Date.now()
    ) {
      invitation.status =
        'EXPIRED';

      await this.invitationRepository.save(
        invitation,
      );

      throw new BadRequestException(
        'Ovaj poziv je istekao.',
      );
    }

    // ----------------------------------------------------------
    // 4. Pronađi trenutno prijavljenog usera
    // ----------------------------------------------------------

    const user =
      await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Korisnik nije pronađen.',
      );
    }

    // ----------------------------------------------------------
    // 5. Provera email-a
    // ----------------------------------------------------------

    const userEmail =
      user.email
        ?.trim()
        .toLowerCase();

    const invitationEmail =
      invitation.email
        .trim()
        .toLowerCase();

    if (
      userEmail !==
      invitationEmail
    ) {
      throw new ForbiddenException(
        'Ovaj poziv nije namenjen vašem nalogu.',
      );
    }

    // ----------------------------------------------------------
    // 6. Provera da li je već član
    // ----------------------------------------------------------

    const existingMembership =
      await this.memberRepository.findOne({
        where: {
          organization_id:
            invitation.organization_id,

          user_id:
            userId,
        },
      });

    if (existingMembership) {
      throw new ConflictException(
        'Već ste član ove organizacije.',
      );
    }

    // ----------------------------------------------------------
    // 7. Provera GLOBALNE organization role
    // ----------------------------------------------------------

    const role =
      await this.roleRepository.findOne({
        where: {
          role_id:
            invitation.role_id,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Organizaciona uloga iz poziva više ne postoji.',
      );
    }

    // ----------------------------------------------------------
    // 8. Kreiranje membership-a
    // ----------------------------------------------------------

    const membership =
      this.memberRepository.create({
        user_id:
          userId,

        organization_id:
          invitation.organization_id,

        role_id:
          invitation.role_id,

        status:
          'ACTIVE',

        joined_at:
          new Date(),

        left_at:
          null,
      });

    await this.memberRepository.save(
      membership,
    );

    // ----------------------------------------------------------
    // 9. Označi invitation kao ACCEPTED
    // ----------------------------------------------------------

    invitation.status =
      'ACCEPTED';

    invitation.accepted_at =
      new Date();

    await this.invitationRepository.save(
      invitation,
    );

    // ----------------------------------------------------------
    // 10. Response
    // ----------------------------------------------------------

    return {
      message:
        'Poziv je uspešno prihvaćen.',

      organizationId:
        invitation.organization_id,

      roleId:
        invitation.role_id,

      roleName:
        role.name,
    };
  }
}