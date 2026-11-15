import { CheckCircle2, Coins, Gift, Share2 } from 'lucide-react';
import { useState } from 'react';
import { DailyTaskItem, ShareRewardState } from '../types';

interface RewardsSectionProps {
  uid: string;
  dailyTasks: DailyTaskItem[];
  shareReward: ShareRewardState;
  onClaimTask: (taskId: DailyTaskItem['id']) => void;
  onShareInvite: () => void;
}

export function RewardsSection({
  uid,
  dailyTasks,
  shareReward,
  onClaimTask,
  onShareInvite,
}: RewardsSectionProps) {
  const [shareFeedback, setShareFeedback] = useState('');

  const totalDailyCoins = dailyTasks.reduce((sum, t) => sum + t.reward, 0);
  const claimedDailyCoins = dailyTasks
    .filter((t) => t.claimed)
    .reduce((sum, t) => sum + t.reward, 0);

  const handleShareClick = async () => {
    const inviteText =
      uid === '100001'
        ? 'Join me on Zariya Live Voice Party Room and win coins: https://zariya.app/'
        : `Join me on Zariya Live Voice Party Room! Use my UID ${uid} and win coins: https://zariya.app/?ref=${uid}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Zariya - Live Voice Party Room',
          text: inviteText,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteText);
      }
    } catch {
      // Clipboard/share fallback still completes offline reward smoothly
    }

    onShareInvite();
    setShareFeedback('Invite shared with 1 person! +1,000,000 Coins added!');
    setTimeout(() => setShareFeedback(''), 3200);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 1 Person Share Win 1,000,000 */}
      <div className="glass-elevated flex flex-col justify-between rounded-3xl p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300">
              <Share2 className="h-4 w-4" />
              <span>Invite &amp; Win</span>
            </span>
            {uid !== '100001' && (
              <span className="font-mono text-xs text-slate-300 tabular-nums">
                UID: {uid}
              </span>
            )}
          </div>

          <h3 className="font-display text-xl font-bold text-white">
            1 Person Share = Win 1,000,000 Coins
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Apna Zariya invite link kisi 1 dost ko share karein aur turant{' '}
            <span className="font-mono font-bold text-amber-300 tabular-nums">1,000,000</span>{' '}
            coins jeetein.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#140D28] px-4 py-3 text-xs">
            <div>
              <p className="text-slate-400">Friends Shared</p>
              <p className="font-mono text-base font-bold text-white tabular-nums">
                {shareReward.sharesCount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Total Won</p>
              <p className="font-mono text-base font-bold text-amber-300 tabular-nums">
                {shareReward.totalEarned.toLocaleString()}
              </p>
            </div>
          </div>

          {shareFeedback && (
            <p className="mt-2.5 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
              {shareFeedback}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleShareClick}
          className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-[0.98] hover:brightness-110"
        >
          <Share2 className="h-4 w-4" />
          <span>Share with 1 Person &amp; Win 1,000,000</span>
        </button>
      </div>

      {/* Daily Tasks 100,000 */}
      <div className="glass-surface rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-300" />
            <h3 className="font-display text-lg font-bold text-white">Daily Tasks</h3>
          </div>
          <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
            {claimedDailyCoins.toLocaleString()} / {totalDailyCoins.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2.5">
          {dailyTasks.map((task) => {
            const isReady = task.progress >= task.target && !task.claimed;
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#140E28] px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{task.title}</p>
                  <p className="truncate text-xs text-slate-400">{task.subtitle}</p>
                </div>

                {task.claimed ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Claimed</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onClaimTask(task.id)}
                    className={`inline-flex min-h-[38px] shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-xs font-bold tabular-nums transition-transform active:scale-95 ${
                      isReady
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F0A1E] shadow'
                        : 'border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                    }`}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    <span>+{task.reward.toLocaleString()}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
