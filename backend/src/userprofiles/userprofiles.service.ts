import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserProfile } from './userprofile.entity';
import { User } from '../users/user.entity';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ============================================================
  // KREIRANJE PRAZNOG PROFILA
  // ============================================================

  async createProfile(userId: number) {
    console.log(
      '========================================',
    );
    console.log(
      'KREIRANJE USER PROFILE-A',
    );
    console.log(
      'USER ID:',
      userId,
    );
    console.log(
      '========================================',
    );

    // ----------------------------------------------------------
    // Provera da li profil već postoji
    // ----------------------------------------------------------

    const existingProfile =
      await this.profileRepo.findOne({
        where: {
          user: {
            user_id: userId,
          },
        },
      });

    if (existingProfile) {
      console.log(
        'Profil već postoji:',
        existingProfile.profileId,
      );

      return existingProfile;
    }

    // ----------------------------------------------------------
    // Pronalaženje korisnika
    // ----------------------------------------------------------

    const user =
      await this.userRepo.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!user) {
      throw new Error(
        `Korisnik sa ID ${userId} ne postoji.`,
      );
    }

    console.log(
      'Korisnik pronađen:',
      user.user_id,
      user.username,
    );

    // ----------------------------------------------------------
    // Kreiranje novog profila
    // ----------------------------------------------------------

    const profile =
      this.profileRepo.create({
        user: user,

        bio: '',

        profilePic: null,

        position: null,

        organization: null,

        department: null,

        teamLead: null,

        workPhone: null,

        startedAt: null,

        country: null,

        city: null,

        address: null,

        languages: null,

        programmingLanguages: null,

        skills: null,

        certifications: null,

        driverLicense: false,

        offsetX: 0,

        offsetY: 0,

        scale: 1,
      });

    console.log(
      'Profil napravljen u memoriji.',
    );

    // ----------------------------------------------------------
    // ČUVANJE U BAZU
    // ----------------------------------------------------------

    const savedProfile =
      await this.profileRepo.save(
        profile,
      );

    console.log(
      '========================================',
    );
    console.log(
      'USER PROFILE SAČUVAN',
    );
    console.log(
      'PROFILE ID:',
      savedProfile.profileId,
    );
    console.log(
      'USER ID:',
      userId,
    );
    console.log(
      '========================================',
    );

    return savedProfile;
  }

  // ============================================================
  // PRONALAŽENJE PROFILA PO USER ID
  // ============================================================

  async findByUserId(
    userId: number,
  ) {
    return this.profileRepo.findOne({
      where: {
        user: {
          user_id: userId,
        },
      },
      relations: ['user'],
    });
  }

  // ============================================================
  // AŽURIRANJE PROFILA
  // ============================================================

  async updateProfile(
    userId: number,
    dto: any,
  ) {
    // Ako profil iz nekog razloga ne postoji,
    // napravi ga pre update-a.

    let profile =
      await this.findByUserId(userId);

    if (!profile) {
      profile =
        await this.createProfile(
          userId,
        );
    }

    await this.profileRepo.update(
      profile.profileId,
      dto,
    );

    return this.findByUserId(userId);
  }
}