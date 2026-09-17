import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleMember } from './role-member.entity';

@Injectable()
export class RoleMembersService {
  constructor(
    @InjectRepository(RoleMember)
    private readonly roleMemberRepository: Repository<RoleMember>,
  ) {}

  async findAll(): Promise<RoleMember[]> {
    return this.roleMemberRepository.find({
      order: {
        rolemember_name: 'ASC',
      },
    });
  }
}