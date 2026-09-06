import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { RolePermission } from '../role-permissions/role-permissions.entity';

@Entity('permissions')
export class Permission {

  @PrimaryGeneratedColumn({
    name: 'permission_id',
  })
  permission_id!: number;


  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;


  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description!: string | null;


  @Column({
    type: 'varchar',
    length: 50,
  })
  module!: string;


  @Column({
    type: 'varchar',
    length: 50,
  })
  action!: string;


  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  created_at!: Date;


  @OneToMany(
    () => RolePermission,
    rolePermission => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];

}