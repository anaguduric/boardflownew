import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { OneToMany } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn({
    name: 'project_id',
  })
  project_id!: number;

  @Column({
    name: 'project_name',
    type: 'varchar',
    length: 100,
  })
  project_name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    name: 'created_by',
    type: 'int',
  })
  created_by!: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'created_by',
  })
  creator!: User;

  @OneToMany(
  () => Task,
  task => task.project,
)
tasks!: Task[];
}