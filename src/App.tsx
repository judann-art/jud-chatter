import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { getInitialTheme, applyTheme, persistTheme, type Theme } from '@/lib/theme';
import ChatArea from '@/components/ChatArea';
import {
  fetchUsers,
  fetchConversations,
  fetchMessages,
  sendMessage,
  CURRENT_USER_ID,
} from '@/lib/chat';
import type { Conversation, Message, User } from '@/types';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, c, m] = await Promise.all([
          fetchUsers(),
          fetchConversations(),
          fetchMessages(),
        ]);
        if (cancelled) return;
        setUsers(u);
        setConversations(c);
        setMessages(m);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load chats.');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedConversation?.userId) ?? null,
    [users, selectedConversation]
  );

  const conversationMessages = useMemo(
    () => messages.filter((m) => m.conversationId === selectedId),
    [messages, selectedId]
  );

  const handleSend = async (text: string) => {
    if (!selectedId) return;
    try {
      const saved = await sendMessage(selectedId, text);
      setMessages((prev) => [...prev, saved]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
        <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-slate-900">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Something went wrong</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto`}>
        <Sidebar
          conversations={conversations}
          users={users}
          messages={messages}
          currentUserId={CURRENT_USER_ID}
          selectedConversationId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} h-full flex-1`}>
        <ChatArea
          conversation={selectedConversation}
          user={selectedUser}
          messages={conversationMessages}
          currentUserId={CURRENT_USER_ID}
          onSend={handleSend}
          onBack={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
