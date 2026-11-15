import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightLeft,
  AudioLines,
  Cherry,
  Crown,
  Lock,
  Plus,
  Radio,
  Rocket,
  Search,
  Shield,
  Spade,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { ROOM_CATEGORIES } from '../data/seedData';
import { DailyTaskItem, RoomCategory, ShareRewardState, UserProfile, VoiceRoom } from '../types';
import {
  calculateVipLevel,
  canBypassRoomBlock,
  getFamilyBadgeClass,
  getNameColorClass,
} from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';
import { GameId } from './games/PartyGamesModal';
import { RewardsSection } from './RewardsSection';
import { SafeImage } from './SafeImage';

interface HomeViewProps {
  user: UserProfile;
  rooms: VoiceRoom[];
  dailyTasks: DailyTaskItem[];
  shareReward: ShareRewardState;
  onOpenRoom: (room: VoiceRoom) => void;
  onCreateRoomClick: () => void;
  onGoToProfile: () => void;
  onOpenWallet: () => void;
  onOpenRecharge: () => void;
  onOpenFamily: () => void;
  onOpenGame: (game: GameId) => void;
  onClaimTask: (taskId: DailyTaskItem['id']) => void;
  onShareInvite: () => void;
}

export function HomeView({
  user,
  rooms,
  dailyTasks,
  shareReward,
  onOpenRoom,
  onCreateRoomClick,
  onGoToProfile,
  onOpenWallet,
  onOpenRecharge,
  onOpenFamily,
  onOpenGame,
  onClaimTask,
  onShareInvite,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('All');
  const [lockedRoom, setLockedRoom] = useState<VoiceRoom | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const liveRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms
      .filter((room) => {
        if (!room.isLive) return false;
        const matchesCategory = selectedCategory === 'All' || room.topic === selectedCategory;
        const matchesQuery =
          !q ||
          room.name.toLowerCase().includes(q) ||
          room.hostName.toLowerCase().includes(q) ||
          room.topic.toLowerCase().includes(q) ||
          room.subtitle.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        const aTop = a.hostUid === '100001' || a.hostId === 'usr-100001' ? 1 : 0;
        const bTop = b.hostUid === '100001' || b.hostId === 'usr-100001' ? 1 : 0;
        return bTop - aTop;
      });
  }, [rooms, searchQuery, selectedCategory]);

  const myVipLevel = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
  const myNameColor = getNameColorClass(myVipLevel, user.uid, 'text-white');

  const handleRoomCardClick = (room: VoiceRoom) => {
    if (
      room.isPrivate &&
      room.hostId !== user.id &&
      !canBypassRoomBlock(myVipLevel, user.uid)
    ) {
      setLockedRoom(room);
      setPinInput('');
      setPinError('');
      return;
    }
    onOpenRoom(room);
  };

  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!lockedRoom) return;
    if (pinInput.trim() === (lockedRoom.password || '1234')) {
      const target = lockedRoom;
      setLockedRoom(null);
      setPinInput('');
      setPinError('');
      onOpenRoom(target);
    } else {
      setPinError('Incorrect room password. Please try again.');
    }
  };

  return (
    <div className="min-h-full pb-6">
      {/* Compact Sticky Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0F0A1E]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={onGoToProfile}
            aria-label="Open profile"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-2 rounded-2xl pr-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            <AvatarBadge name={user.name} avatarId={user.avatar} size="sm" />
            <div className="hidden text-left sm:block">
              <span className={`block font-display text-sm font-bold leading-tight ${myNameColor}`}>
                {user.name}
              </span>
              {user.uid !== '100001' && (
                <span className="block font-mono text-[10px] text-slate-400 tabular-nums">
                  UID: {user.uid}
                </span>
              )}
            </div>
          </button>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live rooms..."
              aria-label="Search live voice rooms"
              className="min-h-[42px] w-full rounded-2xl border border-white/10 bg-[#1A1330] pl-10 pr-9 text-sm text-white placeholder:text-slate-400 focus:border-pink-400/70 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {user.uid === '100001' && (
            <button
              type="button"
              onClick={onOpenRecharge}
              title="Recharge other UIDs"
              className="flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-2xl border border-pink-400/30 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-200 transition-colors hover:bg-pink-500/25"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Recharge</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenFamily}
            title="Open Zariya Family"
            className={`flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-1.5 transition-colors ${
              user.uid === '100001' || user.familyName?.toLowerCase() === 'jutt'
                ? 'border-red-500/35 bg-red-500/15 text-red-500 hover:bg-red-500/25'
                : 'border-white/15 bg-white/8 text-pink-200 hover:bg-white/15'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="hidden font-display text-xs font-extrabold sm:inline sm:text-sm">
              {user.uid === '100001' ? 'Jutt' : user.familyName || 'Family'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenWallet}
            title="Open Coins & Diamonds Wallet"
            className="flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-cyan-200 transition-colors hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Wallet className="h-4 w-4 shrink-0 text-cyan-300" />
            <span className="font-display text-xs font-bold sm:text-sm">Wallet</span>
            {user.walletPassword && <Lock className="h-3 w-3 shrink-0 text-amber-300" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-4 sm:px-6">
        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Room categories"
          className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          {ROOM_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md shadow-pink-500/20'
                    : 'border border-white/10 bg-[#18112E] text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Live Rooms Section */}
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              Live Voice Rooms
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">
              {liveRooms.length} {liveRooms.length === 1 ? 'room' : 'rooms'} live
            </span>
          </div>

          {liveRooms.length === 0 ? (
            <div className="glass-surface rounded-3xl px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED]/30 to-[#EC4899]/30 text-pink-300">
                <Radio className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                All Rooms Are Closed Right Now
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                Jab aap ya koi user naya room create ya open karega, woh yahan live show ho jayega.
              </p>
              <button
                type="button"
                onClick={onCreateRoomClick}
                className="mt-5 inline-flex min-h-[46px] items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-95 hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                <span>Create &amp; Open Room</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {liveRooms.map((room, index) => (
                <motion.button
                  key={room.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.03, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => handleRoomCardClick(room)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-[#17102B] text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-pink-400/35 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                    room.hostUid === '100001'
                      ? 'border-amber-400/45 shadow-lg shadow-amber-500/10'
                      : 'border-white/10'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <SafeImage
                      src={room.coverImage}
                      alt={`${room.name} cover`}
                      fallbackTitle={room.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#17102B] via-[#17102B]/30 to-black/25"
                    />

                    <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
                          <AudioLines className="h-3.5 w-3.5" />
                          <span>LIVE</span>
                        </span>
                        {room.hostUid === '100001' && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/40 bg-amber-400/20 px-2 py-1 text-[10px] font-extrabold tracking-wide text-amber-200 backdrop-blur-md">
                            <Crown className="h-3 w-3 text-amber-300" />
                            <span>OFFICIAL</span>
                          </span>
                        )}
                      </div>

                      {room.isPrivate && (
                        <span
                          aria-label="Private room"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-amber-300 backdrop-blur-md"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-xs text-slate-200">
                      <span className="truncate font-medium text-pink-200">{room.topic}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono font-medium text-white tabular-nums">
                        <Users className="h-3.5 w-3.5 text-pink-300" />
                        {room.listenersCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="truncate font-display text-base font-bold text-white">
                        {room.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{room.subtitle}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <AvatarBadge name={room.hostName} avatarId={room.hostAvatar} size="xs" />
                        <span
                          className={`truncate text-xs font-bold ${getNameColorClass(
                            room.hostVipLevel ?? 0,
                            room.hostUid,
                            'text-slate-200'
                          )}`}
                        >
                          {room.hostName}
                        </span>
                      </div>
                      {(room.hostFamilyName || room.hostUid === '100001') && (
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${getFamilyBadgeClass(
                            room.hostUid === '100001' ? 'red' : room.hostFamilyColor,
                            room.hostUid === '100001' ? 'Jutt' : room.hostFamilyName
                          )}`}
                        >
                          <Shield className="h-2.5 w-2.5" />
                          <span>{room.hostUid === '100001' ? 'Jutt' : room.hostFamilyName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </section>

        {/* Game Center Strip: Fruit Party, Rocket, GatesOfOlympus, Teen Patti */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold text-white">Game Center</h2>
            <span className="text-xs text-pink-300">Auto-Running Live Rounds</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => onOpenGame('fruit')}
              className="glass-surface flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-transform hover:border-pink-400/40 active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-md">
                <Cherry className="h-6 w-6" />
              </div>
              <span className="font-display text-xs font-bold text-white sm:text-sm">
                Fruit Party
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenGame('rocket')}
              className="glass-surface flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-transform hover:border-sky-400/40 active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-800 via-indigo-700 to-sky-500 text-white shadow-md">
                <Rocket className="h-6 w-6" />
              </div>
              <span className="font-display text-xs font-bold text-white sm:text-sm">Rocket</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenGame('olympus')}
              className="glass-surface flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-transform hover:border-amber-400/50 active:scale-95"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-purple-800 text-white shadow-md">
                <Crown className="h-6 w-6 text-amber-200" />
                <Zap className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-300" />
              </div>
              <span className="font-display text-xs font-bold text-white sm:text-sm">
                GatesOfOlympus
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenGame('teenpatti')}
              className="glass-surface flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-transform hover:border-emerald-400/50 active:scale-95"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-amber-500 text-white shadow-md">
                <Spade className="h-6 w-6" />
              </div>
              <span className="font-display text-xs font-bold text-white sm:text-sm">
                Teen Patti
              </span>
            </button>
          </div>
        </section>

        {/* Share 1 Person Win 1,000,000 + Daily Task 100,000 */}
        <RewardsSection
          uid={user.uid}
          dailyTasks={dailyTasks}
          shareReward={shareReward}
          onClaimTask={onClaimTask}
          onShareInvite={onShareInvite}
        />
      </main>

      {/* Private Room Password Modal */}
      <AnimatePresence>
        {lockedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-elevated w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-300">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Private Room</h3>
                    <p className="text-xs text-slate-300">{lockedRoom.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLockedRoom(null)}
                  aria-label="Close password modal"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="room-pin-input"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Enter Room Password
                  </label>
                  <input
                    id="room-pin-input"
                    type="password"
                    autoFocus
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter room password"
                    className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  />
                  {pinError && <p className="mt-1.5 text-xs text-rose-400">{pinError}</p>}
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLockedRoom(null)}
                    className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:brightness-110"
                  >
                    Unlock Room
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
