import { Search, MessageCircle, Moon, Sun, Plus, Clapperboard } from 'lucide-react';
import type { Conversation, Message, User } from '@/types';
import { formatTime } from '@/lib/format';
import type { Theme } from '@/lib/theme';

interface SidebarProps {
  conversations: Conversation[];
  users: User[];
  messages: Message[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Sidebar({
  conversations,
  users,
  messages,
  currentUserId,
  selectedConversationId,
  onSelect,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const userById = (id: string) => users.find((u) => u.id === id);

  const lastMessageFor = (conversationId: string): Message | undefined => {
    const convoMessages = messages.filter((m) => m.conversationId === conversationId);
    return convoMessages[convoMessages.length - 1];
  };

  const filtered = conversations.filter((c) => {
    const user = userById(c.userId);
    if (!user) return false;
    return user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const reelUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <aside className="flex w-full max-w-sm flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Chatter</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Stay in touch</p>
        </div>
        <button
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Status / Reels strip */}
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="mb-2 flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <Clapperboard className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Reels</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {/* Your status / add reel */}
          <button
            className="group relative shrink-0"
            aria-label="Add a reel"
          >
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-dashed ring-slate-300 dark:ring-slate-700" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white ring-2 ring-white dark:ring-slate-900">
              <Plus className="h-3 w-3" />
            </span>
          </button>
          {reelUsers.map((user) => (
            <button
              key={user.id}
              className="group relative shrink-0"
              aria-label={`View ${user.username}'s reel`}
            >
              <div className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-500 p-[2px]">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover dark:border-slate-900"
                />
              </div>
              <span className="absolute -bottom-0.5 left-1/2 max-w-[3.5rem] -translate-x-1/2 truncate rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                {user.username.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:bg-slate-800 dark:focus:ring-sky-900/40"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Conversations
        </span>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{filtered.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No conversations found.
          </p>
        )}
        <ul className="space-y-1">
          {filtered.map((conversation) => {
            const user = userById(conversation.userId);
            if (!user) return null;
            const lastMessage = lastMessageFor(conversation.id);
            const isOwn = lastMessage?.senderId === currentUserId;
            const isActive = conversation.id === selectedConversationId;

            return (
              <li key={conversation.id}>
                <button
                  onClick={() => onSelect(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-sky-50 ring-1 ring-sky-100 dark:bg-sky-900/30 dark:ring-sky-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-semibold ${isActive ? 'text-sky-900 dark:text-sky-200' : 'text-slate-800 dark:text-slate-100'}`}>
                        {user.username}
                      </p>
                      {lastMessage && (
                        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {lastMessage
                        ? `${isOwn ? 'You: ' : ''}${lastMessage.text}`
                        : 'No messages yet'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
