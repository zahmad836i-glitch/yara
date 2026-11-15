import { AnimatePresence, motion } from 'motion/react';
import { ArrowRightLeft, CheckCircle2, Coins, Send, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { RechargeRecord, UidDirectoryEntry, UserProfile } from '../types';
import { calculateVipLevel, getNameColorClass } from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';
import { VipWalletLockScreen } from './VipWalletLockScreen';

interface RechargeModalProps {
  isOpen: boolean;
  user: UserProfile;
  directory: UidDirectoryEntry[];
  history: RechargeRecord[];
  isWalletUnlocked: boolean;
  onUnlockWallet: () => void;
  onUpdateWalletPassword: (nextWalletPassword: string | undefined) => void;
  onClose: () => void;
  onRechargeUid: (targetUid: string, amount: number) => { ok: boolean; message: string };
}

const PRESET_AMOUNTS = [
  { label: '10M (VIP1)', value: 10_000_000 },
  { label: '20M (VIP2)', value: 20_000_000 },
  { label: '30M (VIP3)', value: 30_000_000 },
  { label: '40M (VIP4)', value: 40_000_000 },
  { label: '70M (VIP5)', value: 70_000_000 },
  { label: '100M', value: 100_000_000 },
];

export function RechargeModal({
  isOpen,
  user,
  directory,
  history,
  isWalletUnlocked,
  onUnlockWallet,
  onUpdateWalletPassword,
  onClose,
  onRechargeUid,
}: RechargeModalProps) {
  const isLocked = Boolean(user.walletPassword && user.walletPassword.length > 0) && !isWalletUnlocked;
  const [targetUid, setTargetUid] = useState(directory[0]?.uid || '100002');
  const [amountInput, setAmountInput] = useState('1000000');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const cleanedPreviewUid = targetUid.replace(/^uid\s*:?\s*/i, '').trim();
  const matchedRecipient = directory.find((entry) => entry.uid === cleanedPreviewUid);
  const parsedPreviewAmount = Number(amountInput.replace(/,/g, '').trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedUid = targetUid.replace(/^uid\s*:?\s*/i, '').trim();
    const numericAmount = Number(amountInput.replace(/,/g, '').trim());

    if (!cleanedUid) {
      setFeedback({ ok: false, text: 'Please enter a recipient ID.' });
      return;
    }
    if (cleanedUid === user.uid) {
      setFeedback({ ok: false, text: 'Enter another user ID to transfer coins.' });
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFeedback({ ok: false, text: 'Please enter a valid coin amount.' });
      return;
    }

    const res = onRechargeUid(cleanedUid, Math.floor(numericAmount));
    setFeedback({ ok: res.ok, text: res.message });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="glass-elevated max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-5"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">UID Coin Recharge</h2>
                  <p className="font-mono text-xs text-slate-300 tabular-nums">
                    Balance: {user.coins.toLocaleString()} coins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close recharge modal"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* VIP Wallet Password Gate */}
            {isLocked ? (
              <VipWalletLockScreen
                user={user}
                title="VIP Recharge Locked"
                subtitle="Enter your VIP Wallet password to access UID coin recharge."
                onUnlock={onUnlockWallet}
                onResetWalletPassword={(nextPass) => onUpdateWalletPassword(nextPass)}
              />
            ) : (
              <>
                {/* Quick UID Directory */}
                <div className="mb-4">
                  <span className="mb-2 block text-xs font-medium text-slate-300">
                    Select User UID
                  </span>
                  <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto pr-0.5">
                    {directory.map((entry) => {
                      const selected = cleanedPreviewUid === entry.uid;
                      const entryVip = calculateVipLevel(entry.totalRecharged ?? 0, entry.uid);
                      const entryColor = getNameColorClass(entryVip, entry.uid, 'text-white');
                      return (
                        <button
                          key={entry.uid}
                          type="button"
                          onClick={() => {
                            setTargetUid(entry.uid);
                            setFeedback(null);
                          }}
                          className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-colors ${
                            selected
                              ? 'border-pink-400 bg-pink-500/20'
                              : 'border-white/10 bg-[#140E28] hover:border-white/25'
                          }`}
                        >
                          <AvatarBadge name={entry.name} avatarId={entry.avatar} size="xs" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className={`truncate text-xs font-bold ${entryColor}`}>{entry.name}</p>
                              {entryVip > 0 && (
                                <span className="shrink-0 rounded bg-amber-400/20 px-1 py-0.5 font-mono text-[9px] font-extrabold text-amber-300">
                                  VIP{entryVip}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-slate-300 tabular-nums">
                              {entry.uid} · {entry.coins.toLocaleString()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="recharge-uid-input"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Target ID (Any UID)
                    </label>
                    <input
                      id="recharge-uid-input"
                      type="text"
                      value={targetUid}
                      onChange={(e) => {
                        setTargetUid(e.target.value);
                        setFeedback(null);
                      }}
                      placeholder="Enter any user ID (e.g. 100002 or custom ID)"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 font-mono text-sm text-white focus:border-pink-400 focus:outline-none"
                    />
                    {cleanedPreviewUid && cleanedPreviewUid !== user.uid && (
                      <p className="mt-1.5 text-[11px] text-slate-300">
                        {matchedRecipient ? (
                          <>
                            Sending to <span className="font-bold text-white">{matchedRecipient.name}</span>{' '}
                            (Balance:{' '}
                            <span className="font-mono font-bold text-amber-300">
                              {matchedRecipient.coins.toLocaleString()}
                            </span>
                            )
                          </>
                        ) : (
                          <>
                            New ID <span className="font-mono font-bold text-cyan-300">{cleanedPreviewUid}</span> — coins
                            will be credited immediately for this ID.
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="recharge-amount-input"
                        className="block text-xs font-medium text-slate-300"
                      >
                        Coins Amount
                      </label>
                      {Number.isFinite(parsedPreviewAmount) && parsedPreviewAmount > 0 && (
                        <span className="font-mono text-[11px] font-bold text-amber-300 tabular-nums">
                          {Math.floor(parsedPreviewAmount).toLocaleString()} Coins
                        </span>
                      )}
                    </div>
                    <input
                      id="recharge-amount-input"
                      type="number"
                      min={1}
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 font-mono text-sm text-amber-300 focus:border-pink-400 focus:outline-none"
                    />
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setAmountInput(String(preset.value))}
                          className="min-h-[34px] rounded-lg border border-white/10 bg-[#191133] px-1 font-mono text-[10px] font-bold text-slate-200 hover:border-pink-400"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

              {feedback && (
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                    feedback.ok
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}
                >
                  {feedback.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  <span>{feedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>Send Coins Recharge</span>
              </button>
            </form>

            {history.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <h3 className="mb-2 text-xs font-semibold text-slate-300">Recent Recharges</h3>
                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                  {history.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-[#140E28] px-3 py-2 text-xs"
                    >
                      <span className="truncate text-slate-200">
                        UID {item.toUid} ({item.toName})
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono font-bold text-amber-300 tabular-nums">
                        <Coins className="h-3 w-3" />+{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
