import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { io } from 'socket.io-client';

import {
  FaComments,
  FaUser,
  FaUsers,
  FaPaperPlane,
  FaTrash,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';

import './Chat.css';

const API_URL = 'http://localhost:3000';

const Chat = () => {
  const [conversations, setConversations] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState('');

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [showNewChat, setShowNewChat] =
    useState(false);

  const [showNewGroup, setShowNewGroup] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState(null);

  const [groupName, setGroupName] =
    useState('');

  const [selectedGroupUsers, setSelectedGroupUsers] =
    useState([]);

  const [creating, setCreating] =
    useState(false);

  const [mentionSearch, setMentionSearch] =
    useState('');

  const [showMentions, setShowMentions] =
    useState(false);

  const socketRef =
    useRef(null);

  const selectedConversationRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const messageInputRef =
    useRef(null);

  const token =
    localStorage.getItem('token');

  const currentUser =
    JSON.parse(
      localStorage.getItem('user') || 'null',
    );

  const currentUserId =
    currentUser?.id != null
      ? Number(currentUser.id)
      : currentUser?.user_id != null
        ? Number(currentUser.user_id)
        : null;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const normalizeConversation = (
    conversation,
  ) => ({
    ...conversation,
    is_group: Boolean(
      Number(conversation.is_group),
    ),
  });

  const normalizeConversations = (
    conversationList,
  ) => {
    return conversationList.map(
      normalizeConversation,
    );
  };

  const getAvatar = (user) => {
    return user?.profile_pic || null;
  };

  const getConversationAvatar = (
    conversation,
  ) => {
    if (!conversation) {
      return null;
    }

    if (conversation.is_group) {
      return null;
    }

    const otherUser =
      conversation.members?.find(
        (member) =>
          Number(member.user_id) !==
          currentUserId,
      );

    return getAvatar(otherUser);
  };

  const getConversationMembers = (
    conversation,
  ) => {
    if (!conversation?.members) {
      return [];
    }

    return conversation.members
      .filter(
        (member) =>
          Number(member.user_id) !==
          currentUserId,
      )
      .slice(0, 3);
  };

  const getMentionMembers = () => {
    if (
      !selectedConversation?.is_group ||
      !selectedConversation?.members
    ) {
      return [];
    }

    return selectedConversation.members.filter(
      (member) =>
        Number(member.user_id) !==
        currentUserId,
    );
  };

  const getMentionQuery = (
    value,
  ) => {
    const match =
      value.match(
        /(?:^|\s)@([^\s@]*)$/,
      );

    if (!match) {
      return null;
    }

    return match[1];
  };

  const updateMentionState = (
    value,
  ) => {
    if (
      !selectedConversation?.is_group
    ) {
      setShowMentions(false);
      setMentionSearch('');
      return;
    }

    const query =
      getMentionQuery(value);

    if (query === null) {
      setShowMentions(false);
      setMentionSearch('');
      return;
    }

    setMentionSearch(query);
    setShowMentions(true);
  };

  const insertMention = (
    username,
  ) => {
    const query =
      mentionSearch;

    const mentionStart =
      message.lastIndexOf(
        `@${query}`,
      );

    if (mentionStart === -1) {
      return;
    }

    const before =
      message.slice(
        0,
        mentionStart,
      );

    const after =
      message.slice(
        mentionStart +
          query.length +
          1,
      );

    const newMessage =
      `${before}@${username} ${after}`;

    setMessage(newMessage);
    setShowMentions(false);
    setMentionSearch('');

    setTimeout(() => {
      messageInputRef.current?.focus();

      const length =
        newMessage.length;

      messageInputRef.current?.setSelectionRange(
        length,
        length,
      );
    }, 0);
  };

  const filteredMentionMembers =
    getMentionMembers().filter(
      (member) =>
        member.username
          ?.toLowerCase()
          .includes(
            mentionSearch.toLowerCase(),
          ),
    );

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 50);
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);

      const response = await axios.get(
        `${API_URL}/chat/conversations`,
        authConfig,
      );

      setConversations(
        normalizeConversations(
          response.data,
        ),
      );
    } catch (error) {
      console.error(
        'Error loading conversations:',
        error.response?.data || error,
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/chat/users`,
        authConfig,
      );

      setUsers(response.data);
    } catch (error) {
      console.error(
        'Error loading users:',
        error.response?.data || error,
      );
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    console.log(
      'Creating chat socket...',
    );

    const socket = io(API_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(
        'Chat socket connected:',
        socket.id,
      );

      const currentConversation =
        selectedConversationRef.current;

      if (currentConversation) {
        console.log(
          'Joining conversation:',
          currentConversation.conversation_id,
        );

        socket.emit(
          'join_conversation',
          {
            conversationId:
              currentConversation.conversation_id,
          },
        );
      }
    });

    socket.on(
      'connect_error',
      (error) => {
        console.error(
          'Chat socket error:',
          error,
        );
      },
    );

    socket.on(
      'new_message',
      (data) => {
        const currentConversation =
          selectedConversationRef.current;

        if (
          !currentConversation ||
          Number(data.conversation_id) !==
            Number(
              currentConversation.conversation_id,
            )
        ) {
          setConversations((prev) =>
            prev.map(
              (conversation) => {
                if (
                  Number(
                    conversation.conversation_id,
                  ) !==
                  Number(
                    data.conversation_id,
                  )
                ) {
                  return conversation;
                }

                return {
                  ...conversation,
                  last_message: data,
                };
              },
            ),
          );

          return;
        }

        setMessages((prev) => {
          const exists = prev.some(
            (item) =>
              Number(item.message_id) ===
              Number(data.message_id),
          );

          if (exists) {
            return prev;
          }

          return [
            ...prev,
            data,
          ];
        });

        setConversations((prev) =>
          prev.map(
            (conversation) => {
              if (
                Number(
                  conversation.conversation_id,
                ) !==
                Number(
                  data.conversation_id,
                )
              ) {
                return conversation;
              }

              return {
                ...conversation,
                last_message: data,
              };
            },
          ),
        );

        scrollToBottom();
      },
    );

    socket.on(
      'disconnect',
      () => {
        console.log(
          'Chat socket disconnected',
        );
      },
    );

    return () => {
      console.log(
        'Closing chat socket...',
      );

      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadConversations();
    loadUsers();
  }, [token]);

  const selectConversation = async (
    conversation,
  ) => {
    try {
      const normalizedConversation =
        normalizeConversation(
          conversation,
        );

      const previousConversation =
        selectedConversationRef.current;

      if (
        previousConversation &&
        socketRef.current?.connected
      ) {
        socketRef.current.emit(
          'leave_conversation',
          {
            conversationId:
              previousConversation.conversation_id,
          },
        );
      }

      setShowMentions(false);
      setMentionSearch('');
      setMessage('');

      selectedConversationRef.current =
        normalizedConversation;

      setSelectedConversation(
        normalizedConversation,
      );

      setLoadingMessages(true);
      setMessages([]);

      const response = await axios.get(
        `${API_URL}/chat/conversations/${normalizedConversation.conversation_id}/messages`,
        authConfig,
      );

      setMessages(response.data);

      if (
        socketRef.current?.connected
      ) {
        console.log(
          'Joining conversation:',
          normalizedConversation.conversation_id,
        );

        socketRef.current.emit(
          'join_conversation',
          {
            conversationId:
              normalizedConversation.conversation_id,
          },
        );
      }

      scrollToBottom();
    } catch (error) {
      console.error(
        'Error loading messages:',
        error.response?.data || error,
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = () => {
    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !selectedConversation ||
      !socketRef.current?.connected
    ) {
      return;
    }

    socketRef.current.emit(
      'send_message',
      {
        conversationId:
          selectedConversation.conversation_id,
        message: trimmedMessage,
      },
    );

    setMessage('');
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleMessageChange = (
    event,
  ) => {
    const value =
      event.target.value;

    setMessage(value);

    updateMentionState(value);
  };

  const handleMessageKeyDown = (
    event,
  ) => {
    if (
      event.key === 'Escape' &&
      showMentions
    ) {
      event.preventDefault();
      setShowMentions(false);
      setMentionSearch('');
      return;
    }

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        showMentions &&
        filteredMentionMembers.length > 0
      ) {
        insertMention(
          filteredMentionMembers[0]
            .username,
        );

        return;
      }

      sendMessage();
    }
  };

  const createPrivateChat = async () => {
    if (!selectedUserId) {
      return;
    }

    try {
      setCreating(true);

      const response =
        await axios.post(
          `${API_URL}/chat/private`,
          {
            userId: Number(
              selectedUserId,
            ),
          },
          authConfig,
        );

      setShowNewChat(false);
      setSelectedUserId(null);

      const conversationsResponse =
        await axios.get(
          `${API_URL}/chat/conversations`,
          authConfig,
        );

      const updatedConversations =
        normalizeConversations(
          conversationsResponse.data,
        );

      setConversations(
        updatedConversations,
      );

      const newConversation =
        updatedConversations.find(
          (conversation) =>
            Number(
              conversation.conversation_id,
            ) ===
            Number(
              response.data
                .conversation_id,
            ),
        );

      if (newConversation) {
        await selectConversation(
          newConversation,
        );
      }
    } catch (error) {
      console.error(
        'Error creating private chat:',
        error.response?.data || error,
      );

      alert(
        error.response?.data?.message ||
          'Nije moguće kreirati chat.',
      );
    } finally {
      setCreating(false);
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim()) {
      return;
    }

    if (
      selectedGroupUsers.length === 0
    ) {
      return;
    }

    try {
      setCreating(true);

      const userIds =
        selectedGroupUsers
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0,
          );

      const response =
        await axios.post(
          `${API_URL}/chat/group`,
          {
            name: groupName.trim(),
            userIds,
          },
          authConfig,
        );

      setGroupName('');
      setSelectedGroupUsers([]);
      setShowNewGroup(false);

      const conversationsResponse =
        await axios.get(
          `${API_URL}/chat/conversations`,
          authConfig,
        );

      const updatedConversations =
        normalizeConversations(
          conversationsResponse.data,
        );

      setConversations(
        updatedConversations,
      );

      const newConversation =
        updatedConversations.find(
          (conversation) =>
            Number(
              conversation.conversation_id,
            ) ===
            Number(
              response.data
                .conversation_id,
            ),
        );

      if (newConversation) {
        await selectConversation(
          newConversation,
        );
      }
    } catch (error) {
      console.error(
        'GROUP CHAT ERROR:',
        error.response?.data || error,
      );

      alert(
        error.response?.data?.message ||
          'Nije moguće kreirati grupni chat.',
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteMessage = async (
    messageId,
  ) => {
    try {
      await axios.delete(
        `${API_URL}/chat/messages/${messageId}`,
        authConfig,
      );

      const remainingMessages =
        messages.filter(
          (item) =>
            Number(item.message_id) !==
            Number(messageId),
        );

      setMessages(
        remainingMessages,
      );

      setConversations((prev) =>
        prev.map(
          (conversation) => {
            if (
              Number(
                conversation.conversation_id,
              ) !==
              Number(
                selectedConversation?.conversation_id,
              )
            ) {
              return conversation;
            }

            return {
              ...conversation,
              last_message:
                remainingMessages.length >
                0
                  ? remainingMessages[
                      remainingMessages.length -
                        1
                    ]
                  : null,
            };
          },
        ),
      );
    } catch (error) {
      console.error(
        'Error deleting message:',
        error.response?.data || error,
      );
    }
  };

  const toggleGroupUser = (
    userId,
  ) => {
    const numericId =
      Number(userId);

    setSelectedGroupUsers(
      (prev) =>
        prev.includes(numericId)
          ? prev.filter(
              (id) =>
                id !== numericId,
            )
          : [
              ...prev,
              numericId,
            ],
    );
  };

  const filteredConversations =
    conversations.filter(
      (conversation) =>
        conversation.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  const filteredUsers =
    users.filter(
      (user) =>
        user.username
          ?.toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||
        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  const formatTime = (
    timestamp,
  ) => {
    if (!timestamp) {
      return '';
    }

    return new Date(
      timestamp,
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (
    timestamp,
  ) => {
    if (!timestamp) {
      return '';
    }

    return new Date(
      timestamp,
    ).toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderAvatar = (
    user,
    className = '',
  ) => {
    if (user?.profile_pic) {
      return (
        <img
          src={user.profile_pic}
          alt={
            user.username ||
            'User'
          }
          className={`chat-avatar-image ${className}`}
        />
      );
    }

    return (
      <div
        className={`chat-avatar ${className}`}
      >
        <FaUser />
      </div>
    );
  };

  const renderConversationAvatar = (
    conversation,
    large = false,
  ) => {
    if (!conversation) {
      return (
        <div
          className={`chat-avatar ${
            large
              ? 'chat-header-avatar'
              : ''
          }`}
        >
          <FaUser />
        </div>
      );
    }

    if (!conversation.is_group) {
      const otherUser =
        conversation.members?.find(
          (member) =>
            Number(member.user_id) !==
            currentUserId,
        );

      return renderAvatar(
        otherUser,
        large
          ? 'chat-header-avatar'
          : '',
      );
    }

    const members =
      getConversationMembers(
        conversation,
      );

    return (
      <div
        className={`group-avatar ${
          large
            ? 'group-avatar-large'
            : ''
        }`}
      >
        {members.length === 0 ? (
          <FaUsers />
        ) : (
          members.map(
            (member, index) => (
              <div
                className="group-avatar-item"
                key={
                  member.user_id
                }
                style={{
                  zIndex:
                    members.length -
                    index,
                }}
              >
                {member.profile_pic ? (
                  <img
                    src={
                      member.profile_pic
                    }
                    alt={
                      member.username
                    }
                  />
                ) : (
                  <FaUser />
                )}
              </div>
            ),
          )
        )}
      </div>
    );
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-title">
            <div className="chat-title-icon">
              <FaComments />
            </div>

            <div>
              <h2>Chat</h2>

              <span>
                {conversations.length}{' '}
                conversations
              </span>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              className="chat-new-button"
              onClick={() =>
                setShowNewChat(
                  true,
                )
              }
              title="New chat"
            >
              <FaUser />
            </button>

            <button
              className="chat-new-button"
              onClick={() =>
                setShowNewGroup(
                  true,
                )
              }
              title="New group"
            >
              <FaUsers />
            </button>
          </div>
        </div>

        <div className="chat-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        <div className="chat-conversation-list">
          {loadingConversations ? (
            <div className="chat-empty">
              Loading...
            </div>
          ) : filteredConversations.length ===
            0 ? (
            <div className="chat-empty">
              <FaComments />

              <span>
                No conversations yet
              </span>
            </div>
          ) : (
            filteredConversations.map(
              (conversation) => (
                <button
                  key={
                    conversation.conversation_id
                  }
                  className={`chat-conversation-item ${
                    Number(
                      selectedConversation?.conversation_id,
                    ) ===
                    Number(
                      conversation.conversation_id,
                    )
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    selectConversation(
                      conversation,
                    )
                  }
                >
                  {renderConversationAvatar(
                    conversation,
                  )}

                  <div className="chat-conversation-info">
                    <div className="chat-conversation-top">
                      <strong>
                        {
                          conversation.name
                        }
                      </strong>

                      {conversation.last_message && (
                        <span>
                          {formatTime(
                            conversation
                              .last_message
                              .timestamp,
                          )}
                        </span>
                      )}
                    </div>

                    <p>
                      {conversation
                        .last_message
                        ?.message ||
                        'No messages yet'}
                    </p>
                  </div>
                </button>
              ),
            )
          )}
        </div>
      </aside>

      <main className="chat-main">
        {!selectedConversation ? (
          <div className="chat-placeholder">
            <FaComments />

            <h2>
              Select a conversation
            </h2>

            <p>
              Choose a conversation from
              the left or start a new chat.
            </p>
          </div>
        ) : (
          <>
            <header className="chat-main-header">
              {renderConversationAvatar(
                selectedConversation,
                true,
              )}

              <div className="chat-main-header-info">
                <h2>
                  {
                    selectedConversation.name
                  }
                </h2>

                <span>
                  {selectedConversation.is_group
                    ? `${
                        selectedConversation
                          .members
                          ?.length || 0
                      } members`
                    : 'Private conversation'}
                </span>
              </div>
            </header>

            <div className="chat-messages">
              {loadingMessages ? (
                <div className="chat-empty">
                  Loading messages...
                </div>
              ) : messages.length ===
                0 ? (
                <div className="chat-empty">
                  <FaComments />

                  <span>
                    No messages yet
                  </span>
                </div>
              ) : (
                messages.map(
                  (item) => {
                    const isMine =
                      currentUserId !==
                        null &&
                      Number(
                        item.user_id,
                      ) ===
                        currentUserId;

                    const sender =
                      selectedConversation.members?.find(
                        (member) =>
                          Number(
                            member.user_id,
                          ) ===
                          Number(
                            item.user_id,
                          ),
                      );

                    const profilePic =
                      item.profile_pic ||
                      sender?.profile_pic;

                    return (
                      <div
                        key={
                          item.message_id
                        }
                        className={`chat-message-row ${
                          isMine
                            ? 'mine'
                            : 'other'
                        }`}
                      >
                        {!isMine && (
                          <div className="message-avatar">
                            {profilePic ? (
                              <img
                                src={
                                  profilePic
                                }
                                alt={
                                  item.username
                                }
                              />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                        )}

                        <div className="chat-message-content">
                          {selectedConversation.is_group &&
                            !isMine && (
                              <span className="chat-message-author">
                                {
                                  item.username
                                }
                              </span>
                            )}

                          <div className="chat-message-line">
                            <div
                              className={`chat-message-bubble ${
                                isMine
                                  ? 'mine'
                                  : 'other'
                              }`}
                            >
                              <p>
                                {
                                  item.message
                                }
                              </p>

                              <span>
                                {formatTime(
                                  item.timestamp,
                                )}
                              </span>
                            </div>

                            {isMine && (
                              <button
                                className="chat-delete-message"
                                onClick={() =>
                                  deleteMessage(
                                    item.message_id,
                                  )
                                }
                                title="Delete message"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>

                          <div className="chat-message-date">
                            {formatDate(
                              item.timestamp,
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                {showMentions &&
                  filteredMentionMembers.length >
                    0 && (
                    <div className="chat-mentions-dropdown">
                      <div className="chat-mentions-header">
                        Mention member
                      </div>

                      {filteredMentionMembers.map(
                        (member) => (
                          <button
                            type="button"
                            key={
                              member.user_id
                            }
                            className="chat-mention-option"
                            onMouseDown={(
                              event,
                            ) => {
                              event.preventDefault();

                              insertMention(
                                member.username,
                              );
                            }}
                          >
                            {renderAvatar(
                              member,
                            )}

                            <div>
                              <strong>
                                @
                                {
                                  member.username
                                }
                              </strong>

                              <span>
                                {
                                  member.email
                                }
                              </span>
                            </div>
                          </button>
                        ),
                      )}
                    </div>
                  )}

                <textarea
                  ref={
                    messageInputRef
                  }
                  value={message}
                  onChange={
                    handleMessageChange
                  }
                  onKeyDown={
                    handleMessageKeyDown
                  }
                  onBlur={() => {
                    setTimeout(() => {
                      setShowMentions(
                        false,
                      );
                    }, 150);
                  }}
                  placeholder={
                    selectedConversation.is_group
                      ? 'Write a message... Use @ to mention someone'
                      : 'Write a message...'
                  }
                  rows={1}
                />
              </div>

              <button
                className="chat-send-button"
                onClick={sendMessage}
                disabled={
                  !message.trim()
                }
                title="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        )}
      </main>

      {showNewChat && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-header">
              <div>
                <h3>New Chat</h3>

                <p>
                  Select a user to start
                  a conversation.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowNewChat(
                    false,
                  );
                  setSelectedUserId(
                    null,
                  );
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="chat-user-list">
              {filteredUsers.map(
                (user) => (
                  <button
                    key={
                      user.user_id
                    }
                    className={`chat-user-option ${
                      Number(
                        selectedUserId,
                      ) ===
                      Number(
                        user.user_id,
                      )
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedUserId(
                        user.user_id,
                      )
                    }
                  >
                    {renderAvatar(
                      user,
                    )}

                    <div>
                      <strong>
                        {
                          user.username
                        }
                      </strong>

                      <span>
                        {user.email}
                      </span>
                    </div>
                  </button>
                ),
              )}
            </div>

            <button
              className="chat-modal-primary"
              onClick={
                createPrivateChat
              }
              disabled={
                !selectedUserId ||
                creating
              }
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {showNewGroup && (
        <div className="chat-modal-overlay">
          <div className="chat-modal">
            <div className="chat-modal-header">
              <div>
                <h3>New Group</h3>

                <p>
                  Create a group
                  conversation.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowNewGroup(
                    false,
                  );
                  setGroupName('');
                  setSelectedGroupUsers(
                    [],
                  );
                }}
              >
                <FaTimes />
              </button>
            </div>

            <input
              className="chat-group-name-input"
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(event) =>
                setGroupName(
                  event.target.value,
                )
              }
            />

            <div className="chat-group-selected">
              {selectedGroupUsers.length >
                0 && (
                <span>
                  {
                    selectedGroupUsers.length
                  }{' '}
                  selected
                </span>
              )}
            </div>

            <div className="chat-user-list">
              {filteredUsers.map(
                (user) => {
                  const selected =
                    selectedGroupUsers.includes(
                      Number(
                        user.user_id,
                      ),
                    );

                  return (
                    <button
                      key={
                        user.user_id
                      }
                      className={`chat-user-option ${
                        selected
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        toggleGroupUser(
                          user.user_id,
                        )
                      }
                    >
                      {renderAvatar(
                        user,
                      )}

                      <div>
                        <strong>
                          {
                            user.username
                          }
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>

                      <div
                        className={`chat-checkbox ${
                          selected
                            ? 'checked'
                            : ''
                        }`}
                      >
                        {selected
                          ? '✓'
                          : ''}
                      </div>
                    </button>
                  );
                },
              )}
            </div>

            <button
              className="chat-modal-primary"
              onClick={
                createGroupChat
              }
              disabled={
                !groupName.trim() ||
                selectedGroupUsers.length ===
                  0 ||
                creating
              }
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;