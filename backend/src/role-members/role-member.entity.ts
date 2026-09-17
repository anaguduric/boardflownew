import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('rolemembers')
export class RoleMember {
  @PrimaryGeneratedColumn({
    name: 'rolemember_id',
  })
  rolemember_id!: number;

  @Column({
    name: 'rolemember_name',
    type: 'varchar',
    length: 255,
  })
  rolemember_name!: string;
}