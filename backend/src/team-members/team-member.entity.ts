import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('teammembers')
export class TeamMember {
  @PrimaryGeneratedColumn({ name: 'team_member_id' })
  team_member_id!: number;

  @Column({ name: 'team_id', type: 'int' })
  team_id!: number;

  @Column({ name: 'user_id', type: 'int' })
  user_id!: number;

  @Column({ name: 'role', type: 'varchar', length: 50 })
  role!: string;

  @Column({ name: 'rolemember_id', type: 'int' })
  rolemember_id!: number;
}