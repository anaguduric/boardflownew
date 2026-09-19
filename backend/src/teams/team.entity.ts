import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({
    name: 'team_id',
  })
  team_id!: number;

  @Column({
    name: 'organization_id',
    type: 'int',
  })
  organization_id!: number;

  @ManyToOne(
    () => Organization,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

  @Column({
    name: 'team_name',
    type: 'varchar',
    length: 100,
  })
  team_name!: string;

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  created_at!: Date;
}