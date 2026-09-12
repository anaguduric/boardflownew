import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('registration_requests')
export class RegistrationRequest {
  @PrimaryGeneratedColumn({
    name: 'request_id',
  })
  request_id!: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 50,
  })
  first_name!: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 50,
  })
  last_name!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  password!: string;

  @Column({
    name: 'organization_name',
    type: 'varchar',
    length: 150,
  })
  organization_name!: string;

  @Column({
    name: 'organization_description',
    type: 'text',
    nullable: true,
  })
  organization_description!: string | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({
    name: 'reviewed_at',
    type: 'datetime',
    nullable: true,
  })
  reviewed_at!: Date | null;

  @Column({
    name: 'reviewed_by',
    type: 'int',
    nullable: true,
  })
  reviewed_by!: number | null;

  @Column({
    name: 'rejection_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  rejection_reason!: string | null;

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
}