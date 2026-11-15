import { Gamepad2, Home, MessageCircle, Plus, User } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  unreadCount: number;
  onSelectTab: (tab: AppTab) => void;
  onCreateRoom: () => void;
}

export function BottomNav({
  activeTab,
  unreadCount,
  onSelectTab,
  onCreateRoom,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="relative z-40 shrink-0 border-t border-white/10 bg-[#120C24]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-5 items-center px-1 sm:px-2">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
            activeTab === 'home' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('games')}
          className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
            activeTab === 'games' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="h-5 w-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Games</span>
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onCreateRoom}
            aria-label="Create Room"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-95 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('messages')}
          className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
            activeTab === 'messages' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium whitespace-nowrap">Messages</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
            activeTab === 'profile' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Profile</span>
        </button>
      </div>
    </nav>
  );
}
