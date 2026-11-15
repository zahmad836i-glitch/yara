import {
  Award,
  Cherry,
  Crown,
  Gamepad2,
  Rocket,
  Shield,
  Spade,
  Sparkles,
  UserCheck,
  UserPlus,
  Wallet,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { SPOTLIGHT_HOSTS } from '../data/seedData';
import { DailyTaskItem, FamilyNameColor, GameRankEntry, ShareRewardState } from '../types';
import { getFamilyBadgeClass } from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';
import { GameRankingList } from './games/GameRankingList';
import { GameId } from './games/PartyGamesModal';
import { RewardsSection } from './RewardsSection';
import { PreviewProfileTarget, UserProfilePreviewModal } from './UserProfilePreviewModal';

interface ExploreViewProps {
  uid: string;
  level: number;
  xp: number;
  familyName?: string;
  familyColor?: FamilyNameColor;
  gameRanking: GameRankEntry[];
  followedHostIds: string[];
  dailyTasks: DailyTaskItem[];
  shareReward: ShareRewardState;
  onToggleFollow: (hostId: string) => void;
  onOpenGame: (game: GameId) => void;
  onOpenWallet: () => void;
  onOpenFamily: () => void;
  onClaimTask: (taskId: DailyTaskItem['id']) => void;
  onShareInvite: () => void;
}

type GameCenterFilter = 'All' | 'Greedy' | 'Slots' | 'TeenPatti';

interface GameCenterItem {
  id: GameId;
  title: string;
  subtitle: string;
  categories: Exclude<GameCenterFilter, 'All'>[];
  gradient: string;
  badgeText: string;
}

const GAME_CENTER_ITEMS: GameCenterItem[] = [
  {
    id: 'fruit',
    title: 'Fruit Party',
    subtitle: 'Jackpot 40x Arcade',
    categories: ['Greedy', 'Slots'],
    gradient: 'from-violet-600 via-fuchsia-600 to-rose-500',
    badgeText: 'HOT',
  },
  {
    id: 'rocket',
    title: 'Rocket',
    subtitle: 'Space Crash Auto',
    categories: ['Greedy'],
    gradient: 'from-slate-800 via-indigo-700 to-sky-500',
    badgeText: 'CRASH',
  },
  {
    id: 'olympus',
    title: 'GatesOfOlympus',
    subtitle: 'Zeus Lightning 25x',
    categories: ['Slots'],
    gradient: 'from-amber-500 via-orange-600 to-purple-800',
    badgeText: 'ZEUS',
  },
  {
    id: 'teenpatti',
    title: 'Teen Patti',
    subtitle: 'Raja vs Rani 3-Card',
    categories: ['TeenPatti'],
    gradient: 'from-emerald-600 via-teal-700 to-amber-500',
    badgeText: '3-CARD',
  },
];

const GAME_FILTERS: GameCenterFilter[] = ['All', 'Greedy', 'Slots', 'TeenPatti'];

export function ExploreView({
  uid,
  level,
  xp,
  familyName,
  familyColor,
  gameRanking,
  followedHostIds,
  dailyTasks,
  shareReward,
  onToggleFollow,
  onOpenGame,
  onOpenWallet,
  onOpenFamily,
  onClaimTask,
  onShareInvite,
}: ExploreViewProps) {
  const [filter, setFilter] = useState<GameCenterFilter>('All');
  const [previewProfile, setPreviewProfile] = useState<PreviewProfileTarget | null>(null);

  const visibleGames =
    filter === 'All'
      ? GAME_CENTER_ITEMS
      : GAME_CENTER_ITEMS.filter((g) => g.categories.includes(filter));

  return (
    <div className="min-h-full pb-6">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0F0A1E]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <h1 className="font-display text-xl font-bold text-white">Game Center</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenFamily}
              className={`flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold ${
                familyName || uid === '100001'
                  ? getFamilyBadgeClass(
                      uid === '100001' ? 'red' : familyColor,
                      uid === '100001' ? 'Jutt' : familyName
                    )
                  : 'border-white/15 bg-white/8 text-pink-200 hover:bg-white/15'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>{uid === '100001' ? 'Jutt' : familyName || 'Family'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenWallet}
              className="flex min-h-[38px] items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20"
            >
              <Wallet className="h-4 w-4 text-cyan-300" />
              <span>Wallet</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 px-4 pt-5 sm:px-6">
        {/* Game Center Player Rank Banner (matching Screenshot 3) */}
        <section className="rounded-3xl border border-violet-400/25 bg-gradient-to-r from-[#5B21B6]/70 via-[#4C1D95]/70 to-[#3B0764]/80 p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-slate-800 to-indigo-950 text-amber-300 shadow-lg">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-extrabold text-white">
                    Zariya Player
                  </h2>
                  <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-200 tabular-nums">
                    Lv.{level}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-36 overflow-hidden rounded-full bg-black/35">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-pink-400"
                    style={{ width: `${Math.max(8, xp)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 text-left transition-colors hover:bg-black/40"
            >
              <div>
                <p className="text-[11px] text-purple-200">Play Games to Win Coins</p>
                <p className="font-display text-xs font-bold text-amber-300">Open Wallet →</p>
              </div>
            </button>
          </div>
        </section>

        {/* Game Center Category Tabs + App-Icon Grid */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-pink-400" />
              <h2 className="font-display text-lg font-bold text-white">Featured Games</h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {GAME_FILTERS.map((tab) => {
                const active = filter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={`min-h-[36px] shrink-0 rounded-full px-4 text-xs font-bold transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {visibleGames.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenGame(item.id)}
                className="group flex flex-col items-center rounded-3xl border border-white/10 bg-[#181030] p-4 text-center transition-transform hover:-translate-y-0.5 hover:border-pink-400/40 active:scale-[0.98]"
              >
                <div
                  className={`relative flex aspect-square w-full max-w-[128px] items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient} text-white shadow-xl transition-transform duration-200 group-hover:scale-105`}
                >
                  {item.id === 'fruit' && <Cherry className="h-12 w-12 drop-shadow-lg" />}
                  {item.id === 'rocket' && <Rocket className="h-12 w-12 drop-shadow-lg" />}
                  {item.id === 'olympus' && (
                    <div className="relative flex items-center justify-center">
                      <Crown className="h-12 w-12 text-amber-200 drop-shadow-lg" />
                      <Zap className="absolute -bottom-2 -right-2 h-6 w-6 text-yellow-300" />
                    </div>
                  )}
                  {item.id === 'teenpatti' && <Spade className="h-12 w-12 drop-shadow-lg" />}

                  <span className="absolute bottom-2 rounded-md bg-black/50 px-2 py-0.5 font-mono text-[10px] font-black tracking-wider text-amber-300 backdrop-blur-sm">
                    {item.badgeText}
                  </span>
                </div>

                <h3 className="mt-3 truncate font-display text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Game Top Ranking Leaderboard */}
        <GameRankingList
          ranking={gameRanking}
          onSelectEntry={(entry) =>
            setPreviewProfile({
              id: `usr-${entry.uid}`,
              uid: entry.uid,
              name: entry.name,
              avatar: entry.avatar,
              vipLevel: entry.vipLevel,
              roleLabel: `${entry.lastGame} Winner`,
              bio: `Total game winnings: ${entry.totalWon.toLocaleString()} coins (${entry.winsCount} wins)`,
              level: Math.min(50, entry.winsCount),
            })
          }
        />

        {/* Rewards: 1 Person Share 1,000,000 & Daily Tasks 100,000 */}
        <RewardsSection
          uid={uid}
          dailyTasks={dailyTasks}
          shareReward={shareReward}
          onClaimTask={onClaimTask}
          onShareInvite={onShareInvite}
        />

        {/* Top Hosts */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h2 className="font-display text-lg font-bold text-white">Top Voice Hosts</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SPOTLIGHT_HOSTS.map((host) => {
              const isFollowing = followedHostIds.includes(host.id);
              return (
                <div
                  key={host.id}
                  className="glass-surface flex flex-col justify-between rounded-2xl p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewProfile({
                        id: host.id,
                        name: host.name,
                        avatar: host.avatar,
                        roleLabel: `${host.specialty} Host`,
                        bio: `${host.handle} · ${host.specialty} Live Voice Host on Zariya`,
                        followersLabel: host.followers,
                        canFollow: true,
                        isFollowing,
                      })
                    }
                    className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-90"
                  >
                    <AvatarBadge name={host.name} avatarId={host.avatar} size="md" isSpeaking />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-sm font-bold text-white">
                        {host.name}
                      </h3>
                      <p className="truncate text-xs text-slate-400">{host.handle}</p>
                      <p className="mt-0.5 text-xs text-pink-300">
                        {host.specialty} ·{' '}
                        <span className="font-mono tabular-nums">{host.followers}</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFollow(host.id)}
                    className={`mt-4 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      isFollowing
                        ? 'border border-white/15 bg-white/8 text-slate-200 hover:bg-white/12'
                        : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white hover:brightness-110'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <UserProfilePreviewModal
        target={
          previewProfile
            ? {
                ...previewProfile,
                isFollowing: previewProfile.canFollow
                  ? followedHostIds.includes(previewProfile.id)
                  : undefined,
              }
            : null
        }
        onClose={() => setPreviewProfile(null)}
        onToggleFollow={onToggleFollow}
      />
    </div>
  );
}
