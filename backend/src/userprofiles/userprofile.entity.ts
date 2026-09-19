import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('userprofiles')
export class UserProfile {
  @PrimaryGeneratedColumn({
    name: 'profile_id',
  })
  profileId!: number;

  @Column({
    type: 'text',
  })
  bio!: string;

  @Column({
    name: 'profile_pic',
    type: 'longblob',
    nullable: true,
  })
  profilePic!: Buffer | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  position!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  organization!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  department!: string | null;

  @Column({
    name: 'team_lead',
    type: 'varchar',
    nullable: true,
  })
  teamLead!: string | null;

  @Column({
    name: 'work_phone',
    type: 'varchar',
    nullable: true,
  })
  workPhone!: string | null;

  @Column({
    name: 'started_at',
    type: 'date',
    nullable: true,
  })
  startedAt!: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  city!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  languages!: string | null;

  @Column({
    name: 'programming_languages',
    type: 'text',
    nullable: true,
  })
  programmingLanguages!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  skills!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  certifications!: string | null;

  @Column({
    name: 'driver_license',
    type: 'boolean',
    default: false,
  })
  driverLicense!: boolean;

  @Column({
    name: 'offset_x',
    type: 'float',
    default: 0,
  })
  offsetX!: number;

  @Column({
    name: 'offset_y',
    type: 'float',
    default: 0,
  })
  offsetY!: number;

  @Column({
    type: 'float',
    default: 1,
  })
  scale!: number;

  @OneToOne(
    () => User,
    user => user.profile,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;
} 