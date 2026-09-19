import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn({ name: 'message_id' })
  message_id!: number;

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
    type: 'text',
  })
  message!: string;

  @Column({
    name: 'timestamp',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp!: Date;
}