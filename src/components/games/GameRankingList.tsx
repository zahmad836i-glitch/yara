import { Coins, Crown, Medal, Trophy } from 'lucide-react';
import { GameRankEntry } from '../../types';
import { getNameColorClass } from '../../utils/vip';
import { AvatarBadge } from '../AvatarBadge';

interface GameRankingListProps {
  ranking: GameRankEntry[];
  compact?: boolean;
  onSelectEntry?: (entry: GameRankEntry) => void;
}

export function GameRankingList({
  ranking,
  compact = false,
  onSelectEntry,
}: GameRankingListProps) {
  const sorted = [...ranking].sort((a, b) => b.totalWon - a.totalWon);

  return (
    <div className="glass-surface rounded-3xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-300" />
          <h3 className="font-display text-base font-bold text-white sm:text-lg">
            Game Top Ranking
          </h3>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          {sorted.length} {sorted.length === 1 ? 'winner' : 'winners'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#140E28] px-4 py-6 text-center">
          <Trophy className="mx-auto mb-2 h-7 w-7 text-amber-300/60" />
          <p className="text-sm font-semibold text-white">No rankings yet</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Place any bet and win in any game to enter the Top Ranking!
          </p>
        </div>
      ) : (
        <div className={compact ? 'max-h-72 space-y-2 overflow-y-auto' : 'space-y-2.5'}>
          {sorted.slice(0, 15).map((entry, idx) => {
            const rank = idx + 1;
            const entryNameColor = getNameColorClass(entry.vipLevel ?? 0, entry.uid, 'text-white');
            return (
              <div
                key={entry.uid}
                role={onSelectEntry ? 'button' : undefined}
                tabIndex={onSelectEntry ? 0 : undefined}
                onClick={onSelectEntry ? () => onSelectEntry(entry) : undefined}
                onKeyDown={
                  onSelectEntry
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectEntry(entry);
                        }
                      }
                    : undefined
                }
                className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 ${
                  onSelectEntry ? 'cursor-pointer transition-transform active:scale-[0.99] hover:border-pink-400/40' : ''
                } ${
                  rank === 1
                    ? 'border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-[#181130] to-[#140E28]'
                    : rank === 2
                      ? 'border-slate-300/30 bg-[#16102B]'
                      : rank === 3
                        ? 'border-orange-400/30 bg-[#16102B]'
                        : 'border-white/10 bg-[#140E28]'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {rank === 1 ? (
                      <Crown className="h-5 w-5 text-amber-300" />
                    ) : rank === 2 ? (
                      <Medal className="h-5 w-5 text-slate-200" />
                    ) : rank === 3 ? (
                      <Medal className="h-5 w-5 text-orange-300" />
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-400 tabular-nums">
                        #{rank}
                      </span>
                    )}
                  </div>

                  <AvatarBadge name={entry.name} avatarId={entry.avatar} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-display text-sm font-bold ${entryNameColor}`}>
                      {entry.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {entry.lastGame} · {entry.winsCount} {entry.winsCount === 1 ? 'win' : 'wins'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-amber-300 tabular-nums sm:text-sm">
                    <Coins className="h-3.5 w-3.5" />
                    <span>{entry.totalWon.toLocaleString()}</span>
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 tabular-nums">
                    Best: {entry.bestWin.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
