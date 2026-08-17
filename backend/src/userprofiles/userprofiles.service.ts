import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './userprofile.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private repo: Repository<UserProfile>,
  ) {}

  findByUserId(userId: number) {
    return this.repo.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });
  }

  updateProfile(userId: number, dto: any) {
    return this.repo.update(
      { user: { user_id: userId } },
      dto
    );
  }
}
