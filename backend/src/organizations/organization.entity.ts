import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { OrganizationMember } from '../organization-members/organization-member.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn({
    name: 'organization_id',
  })
  organization_id!: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'longblob',
    nullable: true,
  })
  logo!: Buffer | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

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
    member => member.organization,
  )
  members!: OrganizationMember[];
}