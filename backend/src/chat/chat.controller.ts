import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  // =========================================================
  // USERS
  // =========================================================

  @Get('users')
  async getUsers(@Req() req: any) {
    return this.chatService.getUsers(
      req.user.userId,
    );
  }

  // =========================================================
  // MY CONVERSATIONS
  // =========================================================

  @Get('conversations')
  async getMyConversations(
    @Req() req: any,
  ) {
    return this.chatService.getMyConversations(
      req.user.userId,
    );
  }

  // =========================================================
  // CREATE PRIVATE CHAT
  // =========================================================

  @Post('private')
  async createPrivateChat(
    @Req() req: any,
    @Body() body: { userId: number },
  ) {
    return this.chatService.createPrivateChat(
      req.user.userId,
      Number(body.userId),
    );
  }

  // =========================================================
  // CREATE GROUP CHAT
  // =========================================================

  @Post('group')
  async createGroupChat(
    @Req() req: any,
    @Body()
    body: {
      name: string;
      userIds: number[];
    },
  ) {
    return this.chatService.createGroupChat(
      req.user.userId,
      body.name,
      body.userIds,
    );
  }

  // =========================================================
  // GET MESSAGES
  // =========================================================

  @Get(
    'conversations/:conversationId/messages',
  )
  async getMessages(
    @Req() req: any,
    @Param(
      'conversationId',
      ParseIntPipe,
    )
    conversationId: number,
  ) {
    return this.chatService.getMessages(
      req.user.userId,
      conversationId,
    );
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  @Post(
    'conversations/:conversationId/messages',
  )
  async sendMessage(
    @Req() req: any,
    @Param(
      'conversationId',
      ParseIntPipe,
    )
    conversationId: number,
    @Body()
    body: {
      message: string;
    },
  ) {
    return this.chatService.sendMessage(
      req.user.userId,
      conversationId,
      body.message,
    );
  }

  // =========================================================
  // ADD GROUP MEMBERS
  // =========================================================

  @Post(
    'conversations/:conversationId/members',
  )
  async addGroupMembers(
    @Req() req: any,
    @Param(
      'conversationId',
      ParseIntPipe,
    )
    conversationId: number,
    @Body()
    body: {
      userIds: number[];
    },
  ) {
    return this.chatService.addGroupMembers(
      req.user.userId,
      conversationId,
      body.userIds,
    );
  }

  // =========================================================
  // DELETE MESSAGE
  // =========================================================

  @Delete('messages/:messageId')
  async deleteMessage(
    @Req() req: any,
    @Param(
      'messageId',
      ParseIntPipe,
    )
    messageId: number,
  ) {
    return this.chatService.deleteMessage(
      req.user.userId,
      messageId,
    );
  }
}