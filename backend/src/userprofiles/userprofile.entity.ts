import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../users/user.entity';
import {OneToOne} from 'typeorm'
import {JoinColumn } from 'typeorm'

@Entity('userprofiles')
export class UserProfile {
  @PrimaryGeneratedColumn({ name: 'profile_id' })
  profileId!: number;

  @Column({ type: 'text' })
  bio!: string;

  @Column({ name: 'profile_pic', type: 'longblob' })
  profilePic!: Buffer;

  @Column({ nullable: true })
  position!: string;

  @Column({ nullable: true })
  organization!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ name: 'team_lead', nullable: true })
  teamLead!: string;

  @Column({ name: 'work_phone', nullable: true })
  workPhone!: string;

  @Column({ name: 'started_at', type: 'date', nullable: true })
  startedAt!: Date;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ type: 'text', nullable: true })
  languages!: string;

  @Column({ name: 'programming_languages', type: 'text', nullable: true })
  programmingLanguages!: string;

  @Column({ type: 'text', nullable: true })
  skills!: string;

  @Column({ type: 'text', nullable: true })
  certifications!: string;

  @Column({ name: 'driver_license', default: false })
  driverLicense!: boolean;

  @Column({ name: 'offset_x', type: 'float', default: 0 })
  offsetX!: number;

  @Column({ name: 'offset_y', type: 'float', default: 0 })
  offsetY!: number;

  @Column({ type: 'float', default: 1 })
  scale!: number;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
