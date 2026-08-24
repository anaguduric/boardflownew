import { Entity, PrimaryGeneratedColumn, Column,  OneToOne,  ManyToOne,  JoinColumn,} from 'typeorm';
import { UserProfile } from '../userprofiles/userprofile.entity';
import { Role } from '../roles/role.entity';


@Entity('users') // ime tabele u bazi
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' }) // ime kolone u bazi
  user_id!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ length: 150 })
  password!: string;

  @Column({ length: 100 }) //dodati unique: true
  email!: string;

  @Column({
  name: 'role_id',
  type: 'int',
  default: 1,
})
role_id!: number;

@ManyToOne(() => Role, role => role.users, {
  nullable: false,
})
@JoinColumn({
  name: 'role_id',
})
role!: Role;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp!: string | null;

  @Column({ type: 'enum', enum: ['unverified', 'verified'], default: 'unverified', nullable: true })
  status!: 'unverified' | 'verified';

  @Column({ type: 'datetime', nullable: true })
  otp_expiry!: Date | null;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile!: UserProfile;

  

}

