import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, KeyRound, Mic } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { GOOGLE_LOCAL_ACCOUNTS } from '../data/seedData';
import { UserProfile } from '../types';
import {
  allocateNewUserUid,
  authenticateWithUidAndPassword,
  findUidDirectoryAccountByEmail,
  upsertUidDirectoryAccount,
} from '../utils/storage';
import { AvatarBadge } from './AvatarBadge';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [activeMode, setActiveMode] = useState<'none' | 'google' | 'uid'>('none');
  const [uidInput, setUidInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const createNewGmailProfile = (
    name: string,
    avatar: string,
    email?: string
  ): UserProfile => {
    const existing = findUidDirectoryAccountByEmail(email);
    if (existing) {
      return existing;
    }

    const newUid = allocateNewUserUid();
    const profile: UserProfile = {
      id: `usr-${newUid}`,
      uid: newUid,
      name: name.trim(),
      avatar,
      isGuest: false,
      isVip: false,
      vipLevel: 0,
      totalRecharged: 0,
      email,
      password: '1234',
      coins: 500000,
      diamonds: 0,
      level: 0,
      xp: 0,
      followers: 0,
      following: 0,
      bio: 'Dil se awaaz, raat ki mehfil aur behtareen dosti.',
    };
    upsertUidDirectoryAccount(profile);
    return profile;
  };

  const handleUidLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateWithUidAndPassword(uidInput, passwordInput);
    if (res.error || !res.user) {
      setErrorMsg(res.error || 'Could not log in.');
      return;
    }
    setErrorMsg('');
    onLogin(res.user);
  };

  const handleGooglePreset = (account: (typeof GOOGLE_LOCAL_ACCOUNTS)[number]) => {
    onLogin(createNewGmailProfile(account.name, account.avatar, account.email));
  };

  const handleCustomGoogleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanedName = customGoogleName.trim();
    if (!cleanedName) {
      setErrorMsg('Enter your name for your Gmail Zariya account.');
      return;
    }
    const email =
      customGoogleEmail.trim() ||
      `${cleanedName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    setErrorMsg('');
    onLogin(createNewGmailProfile(cleanedName, 'fuchsia-amber', email));
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0F0A1E] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-700/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-pink-600/20 blur-[110px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] shadow-xl shadow-purple-700/30">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-white">
            ZARIYA
          </h1>
          <p className="mt-2 bg-gradient-to-r from-violet-300 via-pink-300 to-rose-300 bg-clip-text text-base font-semibold text-transparent">
            Live Voice Party Room
          </p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-300/80">
            Mehfil-e-Shayari, Music aur Late Night Gupshup — apni awaaz se duniya jodo.
          </p>
        </div>

        <div className="glass-surface rounded-3xl p-6 shadow-2xl">
          <div className="space-y-2.5">
            {/* Gmail / Google New User Login */}
            <button
              type="button"
              onClick={() => {
                setActiveMode(activeMode === 'google' ? 'none' : 'google');
                setErrorMsg('');
              }}
              className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-transform active:scale-[0.98] hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>Continue with Gmail (Get 500,000 Coins)</span>
            </button>

            <AnimatePresence initial={false}>
              {activeMode === 'google' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 rounded-2xl border border-white/10 bg-[#140D28] p-3">
                    <p className="px-1 text-xs font-medium text-slate-300">
                      New Gmail login starts at Level 0 with 500,000 Coins
                    </p>
                    {GOOGLE_LOCAL_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleGooglePreset(acc)}
                        className="flex min-h-[46px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/10"
                      >
                        <AvatarBadge name={acc.name} avatarId={acc.avatar} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-white">{acc.name}</div>
                          <div className="truncate text-xs text-slate-400">{acc.email}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-pink-400" />
                      </button>
                    ))}

                    <form
                      onSubmit={handleCustomGoogleSubmit}
                      className="space-y-2 border-t border-white/10 pt-2.5"
                    >
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="Or enter your Name"
                        className="min-h-[40px] w-full rounded-xl border border-white/15 bg-[#1A1233] px-3 text-xs text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                      />
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="Gmail address (optional)"
                        className="min-h-[40px] w-full rounded-xl border border-white/15 bg-[#1A1233] px-3 text-xs text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="min-h-[40px] w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-xs font-bold text-white"
                      >
                        Login with Gmail
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* UID & Password Login */}
            <button
              type="button"
              onClick={() => {
                setActiveMode(activeMode === 'uid' ? 'none' : 'uid');
                setErrorMsg('');
              }}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-pink-400/35 bg-pink-500/15 px-5 py-3 text-sm font-semibold text-pink-100 transition-colors hover:bg-pink-500/25 active:scale-[0.98]"
            >
              <KeyRound className="h-4 w-4 text-pink-300" />
              <span>Login with UID &amp; Password</span>
            </button>

            <AnimatePresence initial={false}>
              {activeMode === 'uid' && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleUidLoginSubmit}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-[#140D28] p-4">
                    <div>
                      <label
                        htmlFor="login-uid-input"
                        className="mb-1 block text-xs font-medium text-slate-300"
                      >
                        User UID
                      </label>
                      <input
                        id="login-uid-input"
                        type="text"
                        value={uidInput}
                        onChange={(e) => setUidInput(e.target.value)}
                        placeholder="Enter your UID"
                        className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#1B1333] px-3.5 font-mono text-sm text-white focus:border-pink-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="login-password-input"
                        className="mb-1 block text-xs font-medium text-slate-300"
                      >
                        Password
                      </label>
                      <input
                        id="login-password-input"
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password"
                        className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#1B1333] px-3.5 text-sm text-white focus:border-pink-400 focus:outline-none"
                      />
                    </div>

                    {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

                    <button
                      type="submit"
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25"
                    >
                      <span>Login with UID</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
