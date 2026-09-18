import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ============================================================
  // SVI KORISNICI
  // ============================================================

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['role'],
    });
  }

  // ============================================================
  // PRONALAZAK PO EMAILU
  // ============================================================

  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  // ============================================================
  // PRONALAZAK PO USERNAME-U
  // ============================================================

  findByUsername(username: string) {
    return this.userRepo.findOne({
      where: { username },
      relations: ['role'],
    });
  }

  // ============================================================
  // PRONALAZAK PO ID-U
  // ============================================================

  findById(user_id: number) {
    return this.userRepo.findOne({
      where: { user_id },
      relations: ['role'],
    });
  }

  // ============================================================
  // KREIRANJE
  // ============================================================

  create(user: Partial<User>) {
    return this.userRepo.save(user);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    user_id: number,
    data: Partial<User>,
  ) {
    await this.userRepo.update(
      user_id,
      data,
    );

    return this.findById(user_id);
  }

// ============================================================
// ADMIN - SVI KORISNICI
// ============================================================

  async getAdminUsers(adminUserId: number) {
    const admin = await this.userRepo.findOne({
      where: {
        user_id: adminUserId,
      },
      relations: ['role'],
    });

    if (!admin) {
      throw new Error('User not found.');
    }

    const roleName = admin.role?.role_name
      ?.trim()
      .toUpperCase();

    if (roleName !== 'SUPER_ADMIN') {
      throw new Error(
        'Only Super Admin can access this resource.',
      );
    }

    const users = await this.userRepo.find({
      relations: ['role'],
      order: {
        user_id: 'DESC',
      },
    });

    return users.map((user) => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role
        ? {
            role_id: user.role.role_id,
            name: user.role.role_name,
          }
        : null,
    }));
  }
}