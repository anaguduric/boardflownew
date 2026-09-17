import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({ name: 'team_id' })
  team_id!: number;

  @Column({ name: 'team_name', type: 'varchar', length: 100 })
  team_name!: string;

  @Column({ name: 'created_at', type: 'datetime' })
  created_at!: Date;
}