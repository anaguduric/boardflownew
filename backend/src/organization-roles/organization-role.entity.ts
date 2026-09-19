import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrganizationMember } from '../organization-members/organization-member.entity';
import { RolePermission } from '../role-permissions/role-permissions.entity';

@Entity('organizationroles')
export class OrganizationRole {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  role_id!: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
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
    default: true,
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