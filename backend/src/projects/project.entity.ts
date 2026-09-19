import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Organization } from '../organizations/organization.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn({
    name: 'project_id',
  })
  project_id!: number;

  @Column({
    name: 'organization_id',
    type: 'int',
  })
  organization_id!: number;

  @ManyToOne(
    () => Organization,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

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
