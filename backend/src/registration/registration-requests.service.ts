import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { RegistrationRequest } from './registration-request.entity';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';

import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';

import { MailService } from '../auth/mail.service';

@Injectable()
export class RegistrationRequestsService {
  constructor(
    @InjectRepository(RegistrationRequest)
    private readonly requestRepository: Repository<RegistrationRequest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @InjectRepository(OrganizationRole)
    private readonly organizationRoleRepository: Repository<OrganizationRole>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,

    private readonly mailService: MailService,
  ) {}

  // ============================================================
  // SLANJE ZAHTEVA
  // ============================================================

  async createRequest(
    dto: CreateRegistrationRequestDto,
  ) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    // ----------------------------------------------------------
    // PROVERA DA LI USER VEĆ POSTOJI
    // ----------------------------------------------------------

    const existingUser =
      await this.userRepository.findOne({
        where: [
          { email },
          { username },
        ],
      });

    if (existingUser) {
      throw new ConflictException(
        'Korisnik sa ovim emailom ili korisničkim imenom već postoji.',
      );
    }

    // ----------------------------------------------------------
    // PROVERA POSTOJEĆEG PENDING ZAHTEVA - EMAIL
    // ----------------------------------------------------------

    const existingPendingRequest =
      await this.requestRepository.findOne({
        where: {
          email,
          status: 'PENDING',
        },
      });

    if (existingPendingRequest) {
      throw new ConflictException(
        'Već postoji zahtev za registraciju sa ovim emailom.',
      );
    }

    // ----------------------------------------------------------
    // PROVERA POSTOJEĆEG PENDING ZAHTEVA - USERNAME
    // ----------------------------------------------------------

    const existingUsernameRequest =
      await this.requestRepository.findOne({
        where: {
          username,
          status: 'PENDING',
        },
      });

    if (existingUsernameRequest) {
      throw new ConflictException(
        'Već postoji zahtev sa ovim korisničkim imenom.',
      );
    }

    // ----------------------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    // ----------------------------------------------------------
    // KREIRANJE ZAHTEVA
    // ----------------------------------------------------------

    const request =
      this.requestRepository.create({
        first_name:
          dto.first_name.trim(),

        last_name:
          dto.last_name.trim(),

        username,

        email,

        password:
          hashedPassword,

        organization_name:
          dto.organization_name.trim(),

        organization_description:
          dto.organization_description?.trim() ||
          null,

        status: 'PENDING',

        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      });

    const savedRequest =
      await this.requestRepository.save(
        request,
      );

    return {
      message:
        'Zahtev je uspešno poslat administratoru.',

      request_id:
        savedRequest.request_id,

      status:
        savedRequest.status,
    };
  }

  // ============================================================
  // ADMIN - SVI ZAHTEVI
  // ============================================================

  async getRequests(
    adminUserId?: number,
  ) {
    // Ako je prosleđen ID admina,
    // proveravamo da li je Super Admin.
    if (adminUserId) {
      await this.checkSuperAdmin(
        adminUserId,
      );
    }

    return this.requestRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  // ============================================================
  // PROVERA GLOBALNOG ADMINA
  // ============================================================

  private async checkSuperAdmin(
    adminUserId: number,
  ) {
    const admin =
      await this.userRepository.findOne({
        where: {
          user_id: adminUserId,
        },

        relations: ['role'],
      });

    if (!admin) {
      throw new ForbiddenException(
        'Korisnik nije pronađen.',
      );
    }

    const roleName =
      admin.role?.role_name
        ?.trim()
        .toLowerCase();

    if (roleName !== 'super_admin') {
      throw new ForbiddenException(
        'Samo Super Admin može upravljati zahtevima za registraciju.',
      );
    }

    return admin;
  }

  // ============================================================
  // ADMIN - ODOBRAVANJE ZAHTEVA
  // ============================================================

  async approveRequest(
    requestId: number,
    adminUserId: number,
  ) {
    // ----------------------------------------------------------
    // PROVERA ADMINA
    // ----------------------------------------------------------

    await this.checkSuperAdmin(
      adminUserId,
    );

    // ----------------------------------------------------------
    // PRONAĐI ZAHTEV
    // ----------------------------------------------------------

    const request =
      await this.requestRepository.findOne({
        where: {
          request_id: requestId,
        },
      });

    if (!request) {
      throw new NotFoundException(
        'Zahtev nije pronađen.',
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Ovaj zahtev je već obrađen.',
      );
    }

    // ----------------------------------------------------------
    // DODATNA PROVERA USERA
    // ----------------------------------------------------------

    const existingUser =
      await this.userRepository.findOne({
        where: [
          {
            email: request.email,
          },

          {
            username: request.username,
          },
        ],
      });

    if (existingUser) {
      throw new ConflictException(
        'Korisnik sa ovim emailom ili username-om već postoji.',
      );
    }

    // ----------------------------------------------------------
    // GENERISANJE OTP-A
    // ----------------------------------------------------------

    const otp =
      Math.floor(
        100000 +
          Math.random() * 900000,
      ).toString();

    const otpExpiry =
      new Date(
        Date.now() +
          2 * 60 * 1000,
      );

    // ----------------------------------------------------------
    // TRANSAKCIJA
    // ----------------------------------------------------------

    const result =
      await this.userRepository.manager.transaction(
        async (manager) => {

          // -----------------------------------------------
          // 1. KREIRANJE USERA
          // -----------------------------------------------

          const user =
            manager.create(User, {
              username:
                request.username,

              email:
                request.email,

              password:
                request.password,

              // Globalni USER
              role_id: 4,

              // OTP koji korisnik dobija emailom
              otp,

              otp_expiry:
                otpExpiry,

              // Mora prvo da verifikuje nalog
              status: 'unverified',
            });

          const savedUser =
            await manager.save(
              User,
              user,
            );

          // -----------------------------------------------
          // 2. KREIRANJE ORGANIZACIJE
          // -----------------------------------------------

          const organization =
            manager.create(
              Organization,
              {
                name:
                  request.organization_name,

                description:
                  request.organization_description,

                logo: null,

                status: 'ACTIVE',
              },
            );

          const savedOrganization =
            await manager.save(
              Organization,
              organization,
            );

          // -----------------------------------------------
          // 3. KREIRANJE ORGANIZATION OWNER ROLE
          // -----------------------------------------------

          const ownerRole =
            manager.create(
              OrganizationRole,
              {
                organization_id:
                  savedOrganization.organization_id,

                name:
                  'Organization Owner',

                description:
                  'Owner of the organization with full organization permissions.',

                is_default: false,
              },
            );

          const savedOwnerRole =
            await manager.save(
              OrganizationRole,
              ownerRole,
            );

          // -----------------------------------------------
          // 4. KREIRANJE MEMBERSHIP
          // -----------------------------------------------

          const membership =
            manager.create(
              OrganizationMember,
              {
                user_id:
                  savedUser.user_id,

                organization_id:
                  savedOrganization.organization_id,

                role_id:
                  savedOwnerRole.role_id,

                status: 'ACTIVE',

                joined_at:
                  new Date(),

                left_at: null,
              },
            );

          const savedMembership =
            await manager.save(
              OrganizationMember,
              membership,
            );

          // -----------------------------------------------
          // 5. AŽURIRANJE ZAHTEVA
          // -----------------------------------------------

          request.status =
            'APPROVED';

          request.reviewed_at =
            new Date();

          request.reviewed_by =
            adminUserId;

          const savedRequest =
            await manager.save(
              RegistrationRequest,
              request,
            );

          return {
            request:
              savedRequest,

            user:
              savedUser,

            organization:
              savedOrganization,

            role:
              savedOwnerRole,

            membership:
              savedMembership,
          };
        },
      );

    // ========================================================
    // EMAIL SE ŠALJE TEK NAKON USPEŠNE TRANSAKCIJE
    // ========================================================

    const emailSent =
      await this.mailService.sendRegistrationApprovedEmail(
        result.user.email,

        result.request.first_name,

        result.organization.name,

        otp,

        result.user.user_id,
      );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return {
      message:
        emailSent
          ? 'Zahtev je uspešno odobren. Korisniku je poslat email za aktivaciju naloga.'
          : 'Zahtev je uspešno odobren, ali email za aktivaciju nije mogao biti poslat.',

      emailSent,

      request: {
        request_id:
          result.request.request_id,

        status:
          result.request.status,
      },

      user: {
        user_id:
          result.user.user_id,

        username:
          result.user.username,

        email:
          result.user.email,
      },

      organization: {
        organization_id:
          result.organization.organization_id,

        name:
          result.organization.name,
      },

      role: {
        role_id:
          result.role.role_id,

        name:
          result.role.name,
      },

      membership: {
        membership_id:
          result.membership.membership_id,

        status:
          result.membership.status,
      },
    };
  }

  // ============================================================
  // ADMIN - ODBIJANJE ZAHTEVA
  // ============================================================

  async rejectRequest(
    requestId: number,
    adminUserId: number,
    reason?: string,
  ) {
    await this.checkSuperAdmin(
      adminUserId,
    );

    const request =
      await this.requestRepository.findOne({
        where: {
          request_id: requestId,
        },
      });

    if (!request) {
      throw new NotFoundException(
        'Zahtev nije pronađen.',
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Ovaj zahtev je već obrađen.',
      );
    }

    request.status =
      'REJECTED';

    request.reviewed_at =
      new Date();

    request.reviewed_by =
      adminUserId;

    request.rejection_reason =
      reason?.trim() || null;

    const savedRequest =
      await this.requestRepository.save(
        request,
      );

    return {
      message:
        'Zahtev je odbijen.',

      request: {
        request_id:
          savedRequest.request_id,

        status:
          savedRequest.status,

        rejection_reason:
          savedRequest.rejection_reason,
      },
    };
  }
}