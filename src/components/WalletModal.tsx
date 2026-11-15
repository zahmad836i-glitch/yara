import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightLeft,
  Check,
  Coins,
  Copy,
  Eye,
  EyeOff,
  Gem,
  KeyRound,
  Lock,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { UserProfile, WalletTransaction } from '../types';
import { calculateVipLevel } from '../utils/vip';
import { VipWalletLockScreen } from './VipWalletLockScreen';

interface WalletModalProps {
  isOpen: boolean;
  user: UserProfile;
  transactions: WalletTransaction[];
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  onUpdateWalletPassword: (nextWalletPassword: string | undefined) => void;
  onClose: () => void;
  onConvert: (direction: 'coins_to_diamonds' | 'diamonds_to_coins', diamondUnits: number) => {
    ok: boolean;
    message: string;
  };
  onOpenRecharge: () => void;
}

const DIAMOND_RATE = 1000; // 1,000 Coins = 1 Diamond
const COIN_SELLER_NUMBER = '03449171924';

export function WalletModal({
  isOpen,
  user,
  transactions,
  isUnlocked,
  onUnlock,
  onLock,
  onUpdateWalletPassword,
  onClose,
  onConvert,
  onOpenRecharge,
}: WalletModalProps) {
  const [direction, setDirection] = useState<'coins_to_diamonds' | 'diamonds_to_coins'>(
    'coins_to_diamonds'
  );
  const [unitsInput, setUnitsInput] = useState('100');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [showPassSetup, setShowPassSetup] = useState(false);
  const [currentWalletPass, setCurrentWalletPass] = useState('');
  const [newWalletPass, setNewWalletPass] = useState('');
  const [confirmWalletPass, setConfirmWalletPass] = useState('');
  const [showPassChars, setShowPassChars] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedSeller, setCopiedSeller] = useState(false);

  const vipLevel = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
  const hasWalletPass = Boolean(user.walletPassword && user.walletPassword.length > 0);
  const isLocked = hasWalletPass && !isUnlocked;

  const handleCopySellerNumber = async () => {
    try {
      await navigator.clipboard?.writeText(COIN_SELLER_NUMBER);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedSeller(true);
    setTimeout(() => setCopiedSeller(false), 1800);
  };

  useEffect(() => {
    if (!isOpen) {
      setShowPassSetup(false);
      setCurrentWalletPass('');
      setNewWalletPass('');
      setConfirmWalletPass('');
      setShowPassChars(false);
      setPassFeedback(null);
      setCopiedSeller(false);
      setFeedback(null);
    }
  }, [isOpen]);

  const handleExchange = (e: FormEvent) => {
    e.preventDefault();
    const units = Math.floor(Number(unitsInput));
    if (!Number.isFinite(units) || units <= 0) {
      setFeedback({ ok: false, text: 'Enter a valid diamond amount.' });
      return;
    }
    const res = onConvert(direction, units);
    setFeedback({ ok: res.ok, text: res.message });
  };

  const handleSaveWalletPassword = (e: FormEvent) => {
    e.preventDefault();
    if (hasWalletPass && currentWalletPass.trim() !== user.walletPassword) {
      setPassFeedback({ ok: false, text: 'Current VIP Wallet password is incorrect.' });
      return;
    }
    const next = newWalletPass.trim();
    if (next.length < 4) {
      setPassFeedback({ ok: false, text: 'VIP Wallet password must be at least 4 characters.' });
      return;
    }
    if (next !== confirmWalletPass.trim()) {
      setPassFeedback({ ok: false, text: 'New password and confirm password do not match.' });
      return;
    }

    onUpdateWalletPassword(next);
    onUnlock();
    setCurrentWalletPass('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setPassFeedback({
      ok: true,
      text: hasWalletPass
        ? 'VIP Wallet password updated!'
        : 'VIP Wallet password enabled! Your wallet is now password-protected.',
    });
  };

  const handleRemoveWalletPassword = () => {
    if (hasWalletPass && currentWalletPass.trim() !== user.walletPassword) {
      setPassFeedback({
        ok: false,
        text: 'Enter your current VIP Wallet password to remove the lock.',
      });
      return;
    }
    onUpdateWalletPassword(undefined);
    setCurrentWalletPass('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setPassFeedback({ ok: true, text: 'VIP Wallet password lock removed.' });
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

            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate font-display text-lg font-bold text-white">
                      {vipLevel >= 1 ? 'VIP Wallet' : 'Zariya Wallet'}
                    </h2>
                    {vipLevel >= 1 && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        <span>VIP {vipLevel}</span>
                      </span>
                    )}
                  </div>
                  {user.uid !== '100001' && (
                    <p className="font-mono text-xs text-slate-300 tabular-nums">UID: {user.uid}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassSetup((prev) => !prev);
                      setPassFeedback(null);
                    }}
                    title={hasWalletPass ? 'Change VIP Wallet Password' : 'Set VIP Wallet Password'}
                    className={`inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-[11px] font-bold transition-colors ${
                      showPassSetup
                        ? 'border-amber-400/50 bg-amber-400/20 text-amber-200'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <KeyRound className="h-3.5 w-3.5 text-amber-300" />
                    <span>{hasWalletPass ? 'Pass' : 'Set Pass'}</span>
                  </button>
                )}

                {hasWalletPass && !isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassSetup(false);
                      onLock();
                    }}
                    title="Lock VIP Wallet"
                    aria-label="Lock VIP Wallet"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close wallet"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isLocked ? (
              <VipWalletLockScreen
                user={user}
                title={vipLevel >= 1 ? `VIP ${vipLevel} Wallet Locked` : 'Wallet Locked'}
                subtitle="Enter your VIP Wallet password to view coins, diamonds, convert, or recharge."
                onUnlock={onUnlock}
                onResetWalletPassword={(nextPass) => onUpdateWalletPassword(nextPass)}
              />
            ) : showPassSetup ? (
              <form
                onSubmit={handleSaveWalletPassword}
                className="space-y-3.5 rounded-2xl border border-amber-400/25 bg-[#140D28] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    <h3 className="font-display text-sm font-bold text-white">
                      {hasWalletPass ? 'Change VIP Wallet Password' : 'Set VIP Wallet Password'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassSetup(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Lock your VIP Wallet and Coin Recharge screen so only you can access balances and transfers.
                </p>

                {hasWalletPass && (
                  <div>
                    <label
                      htmlFor="wallet-pass-current"
                      className="mb-1 block text-xs font-medium text-slate-300"
                    >
                      Current VIP Wallet Password
                    </label>
                    <div className="relative">
                      <input
                        id="wallet-pass-current"
                        type={showPassChars ? 'text' : 'password'}
                        value={currentWalletPass}
                        onChange={(e) => setCurrentWalletPass(e.target.value)}
                        placeholder="Enter current wallet password"
                        className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-3.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassChars((prev) => !prev)}
                        aria-label={showPassChars ? 'Hide passwords' : 'Show passwords'}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {showPassChars ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="wallet-pass-new"
                    className="mb-1 block text-xs font-medium text-slate-300"
                  >
                    New VIP Wallet Password
                  </label>
                  <div className="relative">
                    <input
                      id="wallet-pass-new"
                      type={showPassChars ? 'text' : 'password'}
                      value={newWalletPass}
                      onChange={(e) => setNewWalletPass(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-3.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {!hasWalletPass && (
                      <button
                        type="button"
                        onClick={() => setShowPassChars((prev) => !prev)}
                        aria-label={showPassChars ? 'Hide passwords' : 'Show passwords'}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {showPassChars ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="wallet-pass-confirm"
                    className="mb-1 block text-xs font-medium text-slate-300"
                  >
                    Confirm VIP Wallet Password
                  </label>
                  <input
                    id="wallet-pass-confirm"
                    type={showPassChars ? 'text' : 'password'}
                    value={confirmWalletPass}
                    onChange={(e) => setConfirmWalletPass(e.target.value)}
                    placeholder="Re-enter wallet password"
                    className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {passFeedback && (
                  <p
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      passFeedback.ok
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {passFeedback.text}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassSetup(false)}
                    className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-slate-200"
                  >
                    Back to Wallet
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 text-xs font-bold text-white"
                  >
                    {hasWalletPass ? 'Update Pass' : 'Save Wallet Pass'}
                  </button>
                </div>

                {hasWalletPass && (
                  <button
                    type="button"
                    onClick={handleRemoveWalletPassword}
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Remove Wallet Password Lock
                  </button>
                )}
              </form>
            ) : (
              <>
                {/* VIP Wallet Password Security Banner */}
                {!hasWalletPass && (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-amber-300" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-amber-200">
                          VIP Wallet Security
                        </p>
                        <p className="truncate text-[11px] text-amber-100/80">
                          Add a password lock to protect your wallet
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassSetup(true);
                        setPassFeedback(null);
                      }}
                      className="min-h-[34px] shrink-0 rounded-xl bg-amber-400 px-3 text-xs font-extrabold text-[#120C24] hover:bg-amber-300"
                    >
                      Add Pass
                    </button>
                  </div>
                )}

                {/* Coins & Diamonds Balance Cards */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                      <Coins className="h-4 w-4 text-amber-300" />
                      <span>Coins</span>
                    </div>
                    <p className="mt-1.5 truncate font-mono text-base font-extrabold text-white tabular-nums">
                      {user.coins.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-200">
                      <Gem className="h-4 w-4 text-cyan-300" />
                      <span>Diamonds</span>
                    </div>
                    <p className="mt-1.5 truncate font-mono text-base font-extrabold text-white tabular-nums">
                      {user.diamonds.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Official Coin Seller Contact */}
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                        Official Coin Seller
                      </p>
                      <p className="font-mono text-sm font-extrabold text-white tabular-nums">
                        {COIN_SELLER_NUMBER}
                      </p>
                      <p className="truncate text-[10px] text-slate-300">
                        Coins &amp; VIP Recharge ke liye rabta karein
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopySellerNumber}
                      aria-label="Copy coin seller number"
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-xl border border-emerald-400/35 bg-emerald-500/20 px-2.5 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/30"
                    >
                      {copiedSeller ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`tel:${COIN_SELLER_NUMBER}`}
                      aria-label="Call coin seller"
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl bg-emerald-500 px-2.5 text-xs font-bold text-[#0F0A1E] hover:bg-emerald-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Exchange Section */}
                <form
                  onSubmit={handleExchange}
                  className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-[#140D28] p-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Convert Coins &amp; Diamonds</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      1 💎 = {DIAMOND_RATE.toLocaleString()} Coins
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDirection('coins_to_diamonds');
                        setFeedback(null);
                      }}
                      className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                        direction === 'coins_to_diamonds'
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                          : 'border border-white/10 bg-[#1C1438] text-slate-300'
                      }`}
                    >
                      Coins → Diamonds
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirection('diamonds_to_coins');
                        setFeedback(null);
                      }}
                      className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                        direction === 'diamonds_to_coins'
                          ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white'
                          : 'border border-white/10 bg-[#1C1438] text-slate-300'
                      }`}
                    >
                      Diamonds → Coins
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="wallet-diamond-units"
                      className="mb-1 block text-xs text-slate-300"
                    >
                      {direction === 'coins_to_diamonds'
                        ? 'Diamonds to Receive (1,000 Coins each)'
                        : 'Diamonds to Convert into Coins'}
                    </label>
                    <input
                      id="wallet-diamond-units"
                      type="number"
                      min={1}
                      value={unitsInput}
                      onChange={(e) => setUnitsInput(e.target.value)}
                      className="min-h-[42px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 font-mono text-sm text-white focus:border-pink-400 focus:outline-none"
                    />
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {[10, 100, 1000, 10000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setUnitsInput(String(val))}
                          className="min-h-[32px] rounded-lg border border-white/10 bg-[#1B1333] font-mono text-[11px] font-bold text-slate-200 hover:border-pink-400"
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {feedback && (
                    <p
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                        feedback.ok
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {feedback.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-xs font-bold text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Convert Now</span>
                  </button>
                </form>

                {/* Recharge UID Button (UID 100001 only) */}
                {user.uid === '100001' && (
                  <button
                    type="button"
                    onClick={onOpenRecharge}
                    className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-pink-400/35 bg-pink-500/15 px-4 text-sm font-bold text-pink-200 hover:bg-pink-500/25"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Recharge Another User&apos;s UID</span>
                  </button>
                )}

                {/* Wallet Activity */}
                {transactions.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <h3 className="mb-2 text-xs font-semibold text-slate-300">Wallet History</h3>
                    <div className="max-h-36 space-y-1.5 overflow-y-auto">
                      {transactions.slice(0, 8).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-[#140E28] px-3 py-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{tx.title}</p>
                            <p className="truncate text-[10px] text-slate-400">
                              {tx.detail} · {tx.time}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-[11px] font-bold text-amber-300 tabular-nums">
                            {tx.deltaLabel}
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
