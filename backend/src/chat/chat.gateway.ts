import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(
    ChatGateway.name,
  );

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================================================
  // CONNECTION
  // =========================================================

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization
          ?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException(
          'Authentication token is required.',
        );
      }

      const payload =
        await this.jwtService.verifyAsync(token);

      if (!payload?.sub) {
        throw new UnauthorizedException(
          'Invalid authentication token.',
        );
      }

      // Čuvamo userId na Socket objektu.
      client.data.userId = Number(payload.sub);

      this.logger.log(
        `Chat client connected: ${client.id}, user: ${client.data.userId}`,
      );
    } catch (error) {
      this.logger.warn(
         `Socket authentication failed for ${client.id}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

      client.disconnect();
    }
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Chat client disconnected: ${client.id}`,
    );
  }

  // =========================================================
  // JOIN CONVERSATION
  // =========================================================

  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: number;
    },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'User is not authenticated.',
      );
    }

    const conversationId = Number(
      data.conversationId,
    );

    if (!conversationId) {
      throw new ForbiddenException(
        'Invalid conversation.',
      );
    }

    // Provera da li korisnik pripada razgovoru.
    await this.chatService.checkConversationAccess(
      userId,
      conversationId,
    );

    const room =
      `conversation_${conversationId}`;

    await client.join(room);

    this.logger.log(
      `User ${userId} joined ${room}`,
    );

    return {
      event: 'joined_conversation',
      conversationId,
    };
  }

  // =========================================================
  // LEAVE CONVERSATION
  // =========================================================

  @SubscribeMessage('leave_conversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: number;
    },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'User is not authenticated.',
      );
    }

    const conversationId = Number(
      data.conversationId,
    );

    await this.chatService.checkConversationAccess(
      userId,
      conversationId,
    );

    const room =
      `conversation_${conversationId}`;

    await client.leave(room);

    return {
      event: 'left_conversation',
      conversationId,
    };
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: number;
      message: string;
    },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'User is not authenticated.',
      );
    }

    const conversationId = Number(
      data.conversationId,
    );

    if (!conversationId) {
      throw new ForbiddenException(
        'Invalid conversation.',
      );
    }

    // Provera članstva.
    await this.chatService.checkConversationAccess(
      userId,
      conversationId,
    );

    // Čuvanje poruke u MySQL.
    const savedMessage =
      await this.chatService.sendMessage(
        userId,
        conversationId,
        data.message,
      );

    const room =
      `conversation_${conversationId}`;

    // Šaljemo poruku svim korisnicima
    // koji su trenutno u tom conversation room-u.
    this.server.to(room).emit(
      'new_message',
      savedMessage,
    );

    return savedMessage;
  }
}