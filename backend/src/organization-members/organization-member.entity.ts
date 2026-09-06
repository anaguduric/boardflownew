import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';

@Entity('organizationmembers')
export class OrganizationMember {
  @PrimaryGeneratedColumn({
    name: 'membership_id',
  })
  membership_id!: number;

  @Column({
    name: 'user_id',
    type: 'int',
  })
  user_id!: number;

  @ManyToOne(
    () => User,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Column({
    name: 'organization_id',
    type: 'int',
  })
  organization_id!: number;

  @ManyToOne(
    () => Organization,
    organization => organization.members,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

  @Column({
    name: 'role_id',
    type: 'int',
  })
  role_id!: number;

  @ManyToOne(
    () => OrganizationRole,
    role => role.members,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'role_id',
  })
  role!: OrganizationRole;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'INVITED', 'REMOVED'],
  })
  status!: 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'REMOVED';

  @Column({
    name: 'joined_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joined_at!: Date;

  @Column({
    name: 'left_at',
    type: 'datetime',
    nullable: true,
  })
  left_at!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updated_at!: Date;
}