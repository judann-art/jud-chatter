import { supabase } from '@/lib/supabase';
import type { Conversation, Message, User } from '@/types';

export const CURRENT_USER_ID = 'u0';

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('chat_users')
    .select('id, username, avatar, online')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, user_id, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    lastReadAt: c.created_at,
  }));
}

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, text, timestamp')
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    text: m.text,
    timestamp: m.timestamp,
  }));
}

export async function sendMessage(
  conversationId: string,
  text: string
): Promise<Message> {
  const id = `m${Date.now()}`;
  const { data, error } = await supabase
    .from('messages')
    .insert({
      id,
      conversation_id: conversationId,
      sender_id: CURRENT_USER_ID,
      text,
    })
    .select('id, conversation_id, sender_id, text, timestamp')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderId: data.sender_id,
    text: data.text,
    timestamp: data.timestamp,
  };
}
