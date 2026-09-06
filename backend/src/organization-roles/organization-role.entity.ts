import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';
import { OrganizationMember } from '../organization-members/organization-member.entity';
import { RolePermission } from '../role-permissions/role-permissions.entity';

@Entity('organizationroles')
export class OrganizationRole {
  @PrimaryGeneratedColumn({
    name: 'role_id',
  })
  role_id!: number;

  @Column({
    name: 'organization_id',
    type: 'int',
  })
  organization_id!: number;

  @ManyToOne(
    () => Organization,
    organization => organization.organizationRoles,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  is_default!: boolean;

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

  @OneToMany(
    () => OrganizationMember,
    member => member.role,
  )
  members!: OrganizationMember[];

  @OneToMany(
  () => RolePermission,
  rolePermission => rolePermission.role,
)
rolePermissions!: RolePermission[];
}