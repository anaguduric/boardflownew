import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn({ name: 'conversation_id' })
  conversation_id!: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name!: string | null;

  @Column({
    name: 'is_group',
    type: 'tinyint',
    default: 0,
  })
  is_group!: boolean;

  @Column({
    name: 'created_by',
    type: 'int',
  })
  created_by!: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;
}