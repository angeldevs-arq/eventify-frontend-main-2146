// src/bounded-contexts/messaging/domain/models/Conversation.js

export class Conversation {
  constructor({
                id,
                participants,
                lastMessage,
                unreadCount = 0,
                createdAt,
                updatedAt,
                metadata = {},
              }) {
    this.id = id;
    this.participants = participants; // Array de user IDs
    this.lastMessage = lastMessage;
    this.unreadCount = unreadCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.metadata = metadata;
  }

  static createChannelName(user1Id, user2Id) {
    const ids = [user1Id, user2Id].sort();
    return `chat-${ids[0]}-${ids[1]}`;
  }

  getOtherParticipant(currentUserId) {
    return this.participants.find(p => p.id !== currentUserId);
  }

  incrementUnreadCount() {
    this.unreadCount++;
  }

  resetUnreadCount() {
    this.unreadCount = 0;
  }

  updateLastMessage(message) {
    this.lastMessage = message;
    this.updatedAt = new Date().toISOString();
  }
}
