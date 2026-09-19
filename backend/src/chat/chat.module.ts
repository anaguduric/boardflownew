import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

import { ChatConversation } from './chat-conversation.entity';
import { ChatMember } from './chat-member.entity';
import { ChatMessage } from './chat-message.entity';

import { User } from '../users/user.entity';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([
      ChatConversation,
      ChatMember,
      ChatMessage,
      User,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],

  controllers: [ChatController],

  providers: [
    ChatService,
    ChatGateway,
  ],

  exports: [
    ChatService,
  ],
})
export class ChatModule {}