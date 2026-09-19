import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { OrganizationRole } from '../organization-roles/organization-role.entity';
import { Permission } from '../permissions/permission.entity';

@Entity('organizationrolepermissions')
export class RolePermission {

  @PrimaryGeneratedColumn({
    name: 'role_permission_id',
  })
  role_permission_id!: number;


  @Column({
    name: 'role_id',
    type: 'int',
  })
  role_id!: number;


  @Column({
    name: 'permission_id',
    type: 'int',
  })
  permission_id!: number;


  @ManyToOne(
    () => OrganizationRole,
    role => role.rolePermissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'role_id',
  })
  role!: OrganizationRole;


  @ManyToOne(
    () => Permission,
    permission => permission.rolePermissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'permission_id',
  })
  permission!: Permission;


  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  created_at!: Date;

}