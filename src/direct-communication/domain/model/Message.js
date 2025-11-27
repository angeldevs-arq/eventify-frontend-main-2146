
export class Message {
  constructor({
                id,
                text,
                senderId,
                receiverId,
                conversationId,
                timestamp,
                status = 'sent', // sent, delivered, read
                type = 'text', // text, image, file
                metadata = {},
              }) {
    this.id = id;
    this.text = text;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.conversationId = conversationId;
    this.timestamp = timestamp;
    this.status = status;
    this.type = type;
    this.metadata = metadata;
  }

  static fromPubNubMessage(pubnubMsg, conversationId) {
    return new Message({
      id: pubnubMsg.timetoken || Date.now().toString(),
      text: pubnubMsg.message.text,
      senderId: pubnubMsg.message.senderId,
      receiverId: pubnubMsg.message.receiverId,
      conversationId,
      timestamp: pubnubMsg.message.timestamp,
      status: pubnubMsg.message.status || 'sent',
      type: pubnubMsg.message.type || 'text',
      metadata: pubnubMsg.message.metadata || {},
    });
  }

  toPubNubFormat() {
    return {
      text: this.text,
      senderId: this.senderId,
      receiverId: this.receiverId,
      timestamp: this.timestamp,
      status: this.status,
      type: this.type,
      metadata: this.metadata,
    };
  }

  isOwnMessage(userId) {
    return this.senderId === userId;
  }

  markAsRead() {
    this.status = 'read';
  }

  markAsDelivered() {
    this.status = 'delivered';
  }
}
