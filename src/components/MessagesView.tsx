import { ArrowLeft, Radio, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { DirectThread, VoiceRoom } from '../types';
import { AvatarBadge } from './AvatarBadge';

interface MessagesViewProps {
  threads: DirectThread[];
  rooms: VoiceRoom[];
  onSelectThread: (threadId: string) => void;
  onSendDirectMessage: (threadId: string, text: string) => void;
  onOpenRoom: (room: VoiceRoom) => void;
}

export function MessagesView({
  threads,
  rooms,
  onSelectThread,
  onSendDirectMessage,
  onOpenRoom,
}: MessagesViewProps) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threads[0]?.id || null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [draft, setDraft] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  const handleOpenThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setMobileShowChat(true);
    onSelectThread(threadId);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeThread || !draft.trim()) return;
    onSendDirectMessage(activeThread.id, draft.trim());
    setDraft('');
  };

  const linkedRoom = activeThread?.roomId
    ? rooms.find((r) => r.id === activeThread.roomId)
    : undefined;

  return (
    <div className="min-h-full pb-6">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0F0A1E]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <h1 className="font-display text-xl font-bold text-white">Messages</h1>
          <span className="text-xs text-slate-400">Gupshup Inbox</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          {/* Thread List */}
          <div className={`${mobileShowChat ? 'hidden md:block' : 'block'} space-y-2`}>
            {threads.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = activeThread?.id === thread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => handleOpenThread(thread.id)}
                  className={`flex min-h-[68px] w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-pink-400/40 bg-[#1F153B]'
                      : 'border-white/8 bg-[#17102B] hover:bg-[#1C1434]'
                  }`}
                >
                  <AvatarBadge name={thread.peerName} avatarId={thread.peerAvatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-display text-sm font-bold text-white">
                        {thread.peerName}
                      </span>
                      {lastMsg && (
                        <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                          {lastMsg.time}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {lastMsg ? lastMsg.text : thread.peerStatus}
                    </p>
                  </div>
                  {thread.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 font-mono text-[11px] font-bold text-white tabular-nums">
                      {thread.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Conversation */}
          {activeThread && (
            <div
              className={`${
                mobileShowChat ? 'flex' : 'hidden md:flex'
              } glass-surface min-h-[460px] flex-col overflow-hidden rounded-3xl`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileShowChat(false)}
                    aria-label="Back to messages"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <AvatarBadge
                    name={activeThread.peerName}
                    avatarId={activeThread.peerAvatar}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-sm font-bold text-white">
                      {activeThread.peerName}
                    </h2>
                    <p className="truncate text-xs text-pink-300">{activeThread.peerStatus}</p>
                  </div>
                </div>

                {linkedRoom && (
                  <button
                    type="button"
                    onClick={() => onOpenRoom(linkedRoom)}
                    className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Join Room</span>
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.fromMe
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                          : 'bg-[#231942] text-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 px-1 font-mono text-[10px] text-slate-500 tabular-nums">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-white/10 bg-[#140E27] p-3"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeThread.peerName}...`}
                  className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-[#1D1536] px-4 text-sm text-white placeholder:text-slate-400 focus:border-pink-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white transition-transform active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
