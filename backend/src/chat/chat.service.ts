import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ChatConversation } from './chat-conversation.entity';
import { ChatMember } from './chat-member.entity';
import { ChatMessage } from './chat-message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepository: Repository<ChatConversation>,

    @InjectRepository(ChatMember)
    private readonly memberRepository: Repository<ChatMember>,

    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Pretvara Buffer iz profile_pic baze u data URL
   * koji React može direktno koristiti u <img src="">
   */
  private getProfileImage(
    profilePic: Buffer | null | undefined,
  ): string | null {
    if (!profilePic) {
      return null;
    }

    if (Buffer.isBuffer(profilePic)) {
      return `data:image/jpeg;base64,${profilePic.toString(
        'base64',
      )}`;
    }

    return null;
  }

  /**
   * Vraća osnovne podatke korisnika + profilnu sliku.
   */
  private mapUser(user: User) {
    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      profile_pic: this.getProfileImage(
        user.profile?.profilePic,
      ),
    };
  }

  async getUsers(userId: number) {
    const users = await this.userRepository.find({
      where: {
        user_id: undefined,
      },
      relations: {
        profile: true,
      },
    });

    return users
      .filter((user) => user.user_id !== userId)
      .map((user) => this.mapUser(user));
  }

  private async checkMembership(
    conversationId: number,
    userId: number,
  ) {
    const member = await this.memberRepository.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You are not a member of this conversation.',
      );
    }

    return member;
  }

  async checkConversationAccess(
    userId: number,
    conversationId: number,
  ) {
    return this.checkMembership(
      conversationId,
      userId,
    );
  }

  async getMyConversations(userId: number) {
    const memberships =
      await this.memberRepository.find({
        where: { user_id: userId },
      });

    if (memberships.length === 0) {
      return [];
    }

    const conversationIds = memberships.map(
      (member) => member.conversation_id,
    );

    const conversations =
      await this.conversationRepository.find({
        where: {
          conversation_id: In(conversationIds),
        },
        order: {
          created_at: 'DESC',
        },
      });

    const result: any[] = [];

    for (const conversation of conversations) {
      const members =
        await this.memberRepository.find({
          where: {
            conversation_id:
              conversation.conversation_id,
          },
        });

      const memberUserIds = members.map(
        (member) => member.user_id,
      );

      const users =
        memberUserIds.length > 0
          ? await this.userRepository.find({
              where: {
                user_id: In(memberUserIds),
              },
              relations: {
                profile: true,
              },
            })
          : [];

      const messages =
        await this.messageRepository.find({
          where: {
            conversation_id:
              conversation.conversation_id,
          },
          order: {
            timestamp: 'DESC',
          },
          take: 1,
        });

      const lastMessage = messages[0] || null;

      let conversationName = conversation.name;

      if (!conversation.is_group) {
        const otherUser = users.find(
          (user) => user.user_id !== userId,
        );

        conversationName =
          otherUser?.username || 'Private chat';
      }

      result.push({
        conversation_id:
          conversation.conversation_id,

        name: conversationName,

        is_group: conversation.is_group,

        created_by:
          conversation.created_by,

        created_at:
          conversation.created_at,

        members: users.map((user) =>
          this.mapUser(user),
        ),

        last_message: lastMessage
          ? {
              message_id:
                lastMessage.message_id,

              user_id:
                lastMessage.user_id,

              message:
                lastMessage.message,

              timestamp:
                lastMessage.timestamp,
            }
          : null,
      });
    }

    return result;
  }

  async createPrivateChat(
    userId: number,
    otherUserId: number,
  ) {
    if (userId === otherUserId) {
      throw new ForbiddenException(
        'You cannot create a private chat with yourself.',
      );
    }

    const otherUser =
      await this.userRepository.findOne({
        where: {
          user_id: otherUserId,
        },
      });

    if (!otherUser) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const myMemberships =
      await this.memberRepository.find({
        where: {
          user_id: userId,
        },
      });

    for (const membership of myMemberships) {
      const conversation =
        await this.conversationRepository.findOne({
          where: {
            conversation_id:
              membership.conversation_id,
            is_group: false,
          },
        });

      if (!conversation) {
        continue;
      }

      const members =
        await this.memberRepository.find({
          where: {
            conversation_id:
              conversation.conversation_id,
          },
        });

      if (
        members.length === 2 &&
        members.some(
          (member) =>
            member.user_id === otherUserId,
        )
      ) {
        return conversation;
      }
    }

    const conversation =
      this.conversationRepository.create({
        name: null,
        is_group: false,
        created_by: userId,
      });

    const savedConversation =
      await this.conversationRepository.save(
        conversation,
      );

    await this.memberRepository.save([
      this.memberRepository.create({
        conversation_id:
          savedConversation.conversation_id,
        user_id: userId,
      }),

      this.memberRepository.create({
        conversation_id:
          savedConversation.conversation_id,
        user_id: otherUserId,
      }),
    ]);

    return savedConversation;
  }

  async createGroupChat(
    userId: number,
    name: string,
    userIds: number[],
  ) {
    const trimmedName = name?.trim();

    if (!trimmedName) {
      throw new ForbiddenException(
        'Group name is required.',
      );
    }

    const uniqueUserIds = [
      ...new Set([
        userId,
        ...(userIds || []).map((id) =>
          Number(id),
        ),
      ]),
    ];

    const users =
      await this.userRepository.find({
        where: {
          user_id: In(uniqueUserIds),
        },
      });

    if (users.length !== uniqueUserIds.length) {
      throw new NotFoundException(
        'One or more users were not found.',
      );
    }

    const conversation =
      this.conversationRepository.create({
        name: trimmedName,
        is_group: true,
        created_by: userId,
      });

    const savedConversation =
      await this.conversationRepository.save(
        conversation,
      );

    const members = uniqueUserIds.map(
      (memberUserId) =>
        this.memberRepository.create({
          conversation_id:
            savedConversation.conversation_id,
          user_id: memberUserId,
        }),
    );

    await this.memberRepository.save(
      members,
    );

    return savedConversation;
  }

  async getMessages(
    userId: number,
    conversationId: number,
  ) {
    await this.checkMembership(
      conversationId,
      userId,
    );

    const conversation =
      await this.conversationRepository.findOne({
        where: {
          conversation_id: conversationId,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found.',
      );
    }

    const messages =
      await this.messageRepository.find({
        where: {
          conversation_id: conversationId,
        },
        order: {
          timestamp: 'ASC',
        },
      });

    if (messages.length === 0) {
      return [];
    }

    const userIds = [
      ...new Set(
        messages.map(
          (message) => message.user_id,
        ),
      ),
    ];

    const users =
      await this.userRepository.find({
        where: {
          user_id: In(userIds),
        },
        relations: {
          profile: true,
        },
      });

    return messages.map((message) => {
      const sender = users.find(
        (user) =>
          user.user_id === message.user_id,
      );

      return {
        message_id:
          message.message_id,

        conversation_id:
          message.conversation_id,

        user_id:
          message.user_id,

        username:
          sender?.username ||
          'Unknown user',

        profile_pic:
          sender
            ? this.getProfileImage(
                sender.profile?.profilePic,
              )
            : null,

        message:
          message.message,

        timestamp:
          message.timestamp,
      };
    });
  }

  async sendMessage(
    userId: number,
    conversationId: number,
    message: string,
  ) {
    await this.checkMembership(
      conversationId,
      userId,
    );

    const trimmedMessage =
      message?.trim();

    if (!trimmedMessage) {
      throw new ForbiddenException(
        'Message cannot be empty.',
      );
    }

    const conversation =
      await this.conversationRepository.findOne({
        where: {
          conversation_id: conversationId,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found.',
      );
    }

    const newMessage =
      this.messageRepository.create({
        conversation_id: conversationId,
        user_id: userId,
        message: trimmedMessage,
      });

    const savedMessage =
      await this.messageRepository.save(
        newMessage,
      );

    const user =
      await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
        relations: {
          profile: true,
        },
      });

    return {
      message_id:
        savedMessage.message_id,

      conversation_id:
        savedMessage.conversation_id,

      user_id:
        savedMessage.user_id,

      username:
        user?.username ||
        'Unknown user',

      profile_pic:
        user
          ? this.getProfileImage(
              user.profile?.profilePic,
            )
          : null,

      message:
        savedMessage.message,

      timestamp:
        savedMessage.timestamp,
    };
  }

  async addGroupMembers(
    userId: number,
    conversationId: number,
    userIds: number[],
  ) {
    const conversation =
      await this.conversationRepository.findOne({
        where: {
          conversation_id: conversationId,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found.',
      );
    }

    if (!conversation.is_group) {
      throw new ForbiddenException(
        'Members can only be added to group chats.',
      );
    }

    await this.checkMembership(
      conversationId,
      userId,
    );

    if (conversation.created_by !== userId) {
      throw new ForbiddenException(
        'Only the group creator can add members.',
      );
    }

    const uniqueUserIds = [
      ...new Set(
        (userIds || []).map((id) =>
          Number(id),
        ),
      ),
    ];

    if (uniqueUserIds.length === 0) {
      throw new ForbiddenException(
        'No users were provided.',
      );
    }

    const users =
      await this.userRepository.find({
        where: {
          user_id: In(uniqueUserIds),
        },
      });

    if (users.length !== uniqueUserIds.length) {
      throw new NotFoundException(
        'One or more users were not found.',
      );
    }

    const existingMembers =
      await this.memberRepository.find({
        where: {
          conversation_id: conversationId,
        },
      });

    const existingUserIds =
      existingMembers.map(
        (member) => member.user_id,
      );

    const newUserIds =
      uniqueUserIds.filter(
        (id) =>
          !existingUserIds.includes(id),
      );

    if (newUserIds.length === 0) {
      return {
        message:
          'All users are already members.',
      };
    }

    const members = newUserIds.map(
      (newUserId) =>
        this.memberRepository.create({
          conversation_id:
            conversationId,
          user_id: newUserId,
        }),
    );

    await this.memberRepository.save(
      members,
    );

    return {
      message:
        'Members added successfully.',
      added_user_ids: newUserIds,
    };
  }

  async deleteMessage(
    userId: number,
    messageId: number,
  ) {
    const message =
      await this.messageRepository.findOne({
        where: {
          message_id: messageId,
        },
      });

    if (!message) {
      throw new NotFoundException(
        'Message not found.',
      );
    }

    await this.checkMembership(
      message.conversation_id,
      userId,
    );

    if (message.user_id !== userId) {
      throw new ForbiddenException(
        'You can only delete your own messages.',
      );
    }

    await this.messageRepository.delete({
      message_id: messageId,
    });

    return {
      message:
        'Message deleted successfully.',
    };
  }
}