import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('taskstatuses')
export class Status {

  @PrimaryGeneratedColumn({
    name: 'status_id',
  })
  status_id!: number;

  @Column({
    name: 'status_name',
    type: 'varchar',
    length: 50,
  })
  status_name!: string;
}