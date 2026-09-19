import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('chat_members')
@Unique(['conversation_id', 'user_id'])
export class ChatMember {
  @PrimaryGeneratedColumn({ name: 'member_id' })
  member_id!: number;

  @Column({
    name: 'conversation_id',
    type: 'int',
  })
  conversation_id!: number;

  @Column({
    name: 'user_id',
    type: 'int',
  })
  user_id!: number;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joined_at!: Date;
}