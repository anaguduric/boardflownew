import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { OrganizationRole } from '../organization-roles/organization-role.entity';

@Entity('organization_invitations')
export class OrganizationInvitation {
  @PrimaryGeneratedColumn({ name: 'invitation_id' })
  invitation_id!: number;

  @Column({ name: 'organization_id', type: 'int' })
  organization_id!: number;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'role_id', type: 'int' })
  role_id!: number;

  @ManyToOne(() => OrganizationRole, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role!: OrganizationRole;

  @Column({ name: 'invited_by', type: 'int' })
  invited_by!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'invited_by' })
  invitedBy!: User;

  @Column({ type: 'varchar', length: 255, unique: true })
  token!: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING',
  })
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

  @Column({ type: 'datetime' })
  expires_at!: Date;

  @Column({ type: 'datetime', nullable: true })
  accepted_at!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at!: Date;
}