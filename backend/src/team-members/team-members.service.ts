import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TeamMember } from './team-member.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // GET ALL MEMBERS OF A TEAM
  async findByTeam(teamId: number) {
    const members =
      await this.teamMemberRepository.find({
        where: {
          team_id: teamId,
        },
        order: {
          team_member_id: 'ASC',
        },
      });

    const membersWithUserData =
      await Promise.all(
        members.map(async (member) => {
          const user =
            await this.userRepository.findOne({
              where: {
                user_id: member.user_id,
              },
              relations: {
                profile: true,
              },
            });

          let profilePic: string | null = null;

          if (user?.profile?.profilePic) {
            profilePic =
              `data:image/jpeg;base64,${user.profile.profilePic.toString(
                'base64',
              )}`;
          }

          return {
            ...member,

            username:
              user?.username ||
              `User #${member.user_id}`,

            profilePic,
          };
        }),
      );

    return membersWithUserData;
  }

  // GET ONE TEAM MEMBER
  async findOne(teamMemberId: number) {
    const member =
      await this.teamMemberRepository.findOne({
        where: {
          team_member_id: teamMemberId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Team member not found',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          user_id: member.user_id,
        },
        relations: {
          profile: true,
        },
      });

    let profilePic: string | null = null;

    if (user?.profile?.profilePic) {
      profilePic =
        `data:image/jpeg;base64,${user.profile.profilePic.toString(
          'base64',
        )}`;
    }

    return {
      ...member,

      username:
        user?.username ||
        `User #${member.user_id}`,

      profilePic,
    };
  }

  // ADD MEMBER TO TEAM
  async create(
    teamId: number,
    userId: number,
    role: string,
    rolememberId: number,
  ): Promise<TeamMember> {
    const member =
      this.teamMemberRepository.create({
        team_id: teamId,
        user_id: userId,
        role,
        rolemember_id: rolememberId,
      });

    return this.teamMemberRepository.save(
      member,
    );
  }

  // UPDATE MEMBER ROLE
  async update(
    teamMemberId: number,
    role: string,
    rolememberId: number,
  ): Promise<TeamMember> {
    const member =
      await this.teamMemberRepository.findOne({
        where: {
          team_member_id: teamMemberId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Team member not found',
      );
    }

    member.role = role;
    member.rolemember_id = rolememberId;

    return this.teamMemberRepository.save(
      member,
    );
  }

  // REMOVE MEMBER FROM TEAM
  async remove(
    teamMemberId: number,
  ): Promise<void> {
    const member =
      await this.teamMemberRepository.findOne({
        where: {
          team_member_id: teamMemberId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Team member not found',
      );
    }

    await this.teamMemberRepository.remove(
      member,
    );
  }
}