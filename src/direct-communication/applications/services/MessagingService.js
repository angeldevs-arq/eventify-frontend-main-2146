
import { Message } from '@/direct-communication/domain/model/Message.js'
import { Conversation } from '@/direct-communication/domain/model/Conversation.js'

export class MessagingService {
  constructor(pubNubAdapter) {
    this.pubNubAdapter = pubNubAdapter;
  }

  async sendMessage(conversationId, text, senderId, receiverId) {
    const message = new Message({
      id: Date.now().toString(),
      text,
      senderId,
      receiverId,
      conversationId,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text',
    });

    await this.pubNubAdapter.publish(conversationId, message.toPubNubFormat());
    return message;
  }

  async getConversationHistory(conversationId, limit = 50) {
    const history = await this.pubNubAdapter.getHistory(conversationId, limit);
    return history.map(item =>
      Message.fromPubNubMessage(item, conversationId)
    );
  }

  async markMessagesAsRead(conversationId, userId) {
    // Implementar lógica para marcar mensajes como leídos
    // Esto podría involucrar publicar un evento especial
    await this.pubNubAdapter.publish(conversationId, {
      type: 'read_receipt',
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  createConversation(user1Id, user2Id) {
    const channelName = Conversation.createChannelName(user1Id, user2Id);

    return new Conversation({
      id: channelName,
      participants: [
        { id: user1Id },
        { id: user2Id },
      ],
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
