export interface User {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  lastReadAt: string;
}
