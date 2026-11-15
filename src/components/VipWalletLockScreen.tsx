import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, Star, Unlock } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { UserProfile } from '../types';
import { calculateVipLevel } from '../utils/vip';

interface VipWalletLockScreenProps {
  user: UserProfile;
  title?: string;
  subtitle?: string;
  onUnlock: () => void;
  onResetWalletPassword: (nextWalletPassword: string) => void;
}

export function VipWalletLockScreen({
  user,
  title = 'VIP Wallet Locked',
  subtitle = 'Enter your VIP Wallet password to view balances, convert coins, or recharge.',
  onUnlock,
  onResetWalletPassword,
}: VipWalletLockScreenProps) {
  const [passInput, setPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [accountPassInput, setAccountPassInput] = useState('');
  const [newWalletPass, setNewWalletPass] = useState('');
  const [confirmWalletPass, setConfirmWalletPass] = useState('');

  const vipLevel = calculateVipLevel(user.totalRecharged ?? 0, user.uid);

  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!passInput.trim()) {
      setError('Please enter your VIP Wallet password.');
      return;
    }
    if (passInput.trim() !== (user.walletPassword || '')) {
      setError('Incorrect VIP Wallet password.');
      return;
    }
    setError('');
    setPassInput('');
    onUnlock();
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    const expectedAccountPass = user.password || '1234';
    if (!accountPassInput.trim() || accountPassInput.trim() !== expectedAccountPass) {
      setError('Account login password is incorrect.');
      return;
    }
    if (newWalletPass.trim().length < 4) {
      setError('New VIP Wallet password must be at least 4 characters.');
      return;
    }
    if (newWalletPass.trim() !== confirmWalletPass.trim()) {
      setError('New VIP Wallet password and confirm password do not match.');
      return;
    }
    setError('');
    onResetWalletPassword(newWalletPass.trim());
    setAccountPassInput('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setRecoveryMode(false);
    onUnlock();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/12 via-[#191133] to-[#130C27] p-5 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#EC4899] to-amber-400 text-white shadow-lg shadow-pink-500/25">
          <Lock className="h-7 w-7" />
        </div>

        {vipLevel >= 1 && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>VIP {vipLevel} Protected</span>
          </span>
        )}

        <h3 className="mt-2 font-display text-lg font-extrabold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{subtitle}</p>
      </div>

      {!recoveryMode ? (
        <form onSubmit={handleUnlockSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="vip-wallet-unlock-pass"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              VIP Wallet Password
            </label>
            <div className="relative">
              <input
                id="vip-wallet-unlock-pass"
                type={showPass ? 'text' : 'password'}
                value={passInput}
                onChange={(e) => {
                  setPassInput(e.target.value);
                  setError('');
                }}
                placeholder="Enter VIP Wallet password"
                autoFocus
                className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-4 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-sm font-bold text-white shadow-lg shadow-pink-500/20"
          >
            <Unlock className="h-4 w-4" />
            <span>Unlock VIP Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRecoveryMode(true);
              setError('');
            }}
            className="w-full py-1 text-center text-xs font-medium text-amber-300 hover:text-amber-200"
          >
            Forgot VIP Wallet Password? Reset with Account Password
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-violet-300" />
            <span>Verify your account login password to set a new VIP Wallet password.</span>
          </div>

          <div>
            <label
              htmlFor="wallet-reset-account-pass"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Account Login Password
            </label>
            <input
              id="wallet-reset-account-pass"
              type={showPass ? 'text' : 'password'}
              value={accountPassInput}
              onChange={(e) => setAccountPassInput(e.target.value)}
              placeholder="Enter your account login password"
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="wallet-reset-new-pass"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              New VIP Wallet Password
            </label>
            <input
              id="wallet-reset-new-pass"
              type={showPass ? 'text' : 'password'}
              value={newWalletPass}
              onChange={(e) => setNewWalletPass(e.target.value)}
              placeholder="Minimum 4 characters"
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="wallet-reset-confirm-pass"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Confirm VIP Wallet Password
            </label>
            <input
              id="wallet-reset-confirm-pass"
              type={showPass ? 'text' : 'password'}
              value={confirmWalletPass}
              onChange={(e) => setConfirmWalletPass(e.target.value)}
              placeholder="Re-enter new wallet password"
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
          </button>

          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRecoveryMode(false);
                setError('');
              }}
              className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-slate-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 text-xs font-bold text-white"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Reset &amp; Unlock</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
