import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Status } from './status.entity';

@Entity('tasks')
export class Task {

  @PrimaryGeneratedColumn({
    name: 'task_id',
  })
  task_id!: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    name: 'description',
    type: 'text',
  })
  description!: string;

  @Column({
    name: 'status_id',
    type: 'int',
  })
  status_id!: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    nullable: true,
  })
  updated_at!: Date | null;

  @Column({
    name: 'due_date',
    type: 'datetime',
  })
  due_date!: Date;

  @Column({
    name: 'assigned_to',
    type: 'int',
  })
  assigned_to!: number;

  @Column({
    name: 'created_by',
    type: 'int',
  })
  created_by!: number;

  @Column({
    name: 'project_id',
    type: 'int',
  })
  project_id!: number;

@ManyToOne(() => Status)
@JoinColumn({
  name: 'status_id',
})
status!: Status;

  // USER KOJI JE NAPRAVIO TASK
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'created_by',
  })
  creator!: User;


  // USER KOME JE TASK DODELJEN
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'assigned_to',
  })
  assignee!: User;


  // PROJEKAT KOME TASK PRIPADA
  @ManyToOne(() => Project)
  @JoinColumn({
    name: 'project_id',
  })
  project!: Project;
}