import type { Profile } from "./profile";

export type UserStatus = "online" | "away" | "offline";

// Database types matching Supabase schema
export interface DBConversation {
  id: string;
  created_at: string;
  updated_at: string | null;
  job_id: string;
  handyman_id: string;
  client_id: string;
  last_message_at: string | null;
}

export interface DBMessage {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
}

// Extended types with populated relations
export interface ConversationWithDetails extends DBConversation {
  client: Profile;
  job: {
    id: string;
    title: string;
    category: {
      name: string;
      icon_name: string;
      color: string;
    };
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

// UI display types
export interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isPinned: boolean;
  status: UserStatus;
  jobTitle: string;
  jobId: string;
  clientId: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  senderId: string;
  createdAt: string;
}
