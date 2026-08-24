import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({
    name: 'role_id',
  })
  role_id!: number;

  @Column({
    name: 'role_name',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  role_name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @OneToMany(() => User, user => user.role)
  users!: User[];
}