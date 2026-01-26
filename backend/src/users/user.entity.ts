import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users') // ime tabele u bazi
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' }) // ime kolone u bazi
  user_id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 150 })
  password: string;

  @Column({ length: 100 }) //dodati unique: true
  email: string;

  @Column({ default: 1 })
  role_id: number;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string | null;

  @Column({ type: 'enum', enum: ['unverified', 'verified'], default: 'unverified', nullable: true })
  status: 'unverified' | 'verified';

  @Column({ type: 'datetime', nullable: true })
  otpExpiry: Date | null;
}

