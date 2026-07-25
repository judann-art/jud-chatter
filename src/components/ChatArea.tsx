import { useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation, Message, User } from '@/types';
import { formatTime } from '@/lib/format';

interface ChatAreaProps {
  conversation: Conversation | null;
  user: User | null;
  messages: Message[];
  currentUserId: string;
  onSend: (text: string) => void;
  onBack: () => void;
}

export default function ChatArea({
  conversation,
  user,
  messages,
  currentUserId,
  onSend,
  onBack,
}: ChatAreaProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, conversation?.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  };

  if (!conversation || !user) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-8 text-center dark:bg-slate-950">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 dark:bg-sky-900/40 dark:text-sky-400">
          <Send className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Select a conversation</h2>
        <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-slate-500">
          Choose a contact from the sidebar to start viewing and sending messages.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative shrink-0">
          <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
          {user.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">{user.username}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {user.online ? 'Active now' : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Call">
            <Phone className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Video call">
            <Video className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-6 sm:px-8">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-md ${
                  isOwn
                    ? 'rounded-br-md bg-sky-500 text-white'
                    : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`mt-1 text-right text-[10px] ${isOwn ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${user.username}`}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:bg-slate-800 dark:focus:ring-sky-900/40"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </section>
  );
}
