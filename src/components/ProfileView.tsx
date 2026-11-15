import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRightLeft,
  Award,
  Camera,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Lock,
  Plus,
  Power,
  Radio,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { AVATAR_PRESETS } from '../data/seedData';
import { DailyTaskItem, ShareRewardState, UserProfile, VoiceRoom } from '../types';
import { processAvatarFile } from '../utils/imageUpload';
import {
  calculateVipLevel,
  formatMillionLabel,
  getFamilyBadgeClass,
  getFamilyNameColorClass,
  getNameColorClass,
  getNextVipInfo,
  VIP_TIERS,
} from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';
import { RewardsSection } from './RewardsSection';

interface ProfileViewProps {
  user: UserProfile;
  rooms: VoiceRoom[];
  dailyTasks: DailyTaskItem[];
  shareReward: ShareRewardState;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onUpdateWalletPassword: (nextWalletPassword: string | undefined) => void;
  onOpenRoom: (room: VoiceRoom) => void;
  onToggleRoomLive: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onCreateRoomClick: () => void;
  onOpenWallet: () => void;
  onOpenRecharge: () => void;
  onOpenFamily: () => void;
  onClaimTask: (taskId: DailyTaskItem['id']) => void;
  onShareInvite: () => void;
  onLogout: () => void;
}

export function ProfileView({
  user,
  rooms,
  dailyTasks,
  shareReward,
  onUpdateProfile,
  onUpdateWalletPassword,
  onOpenRoom,
  onToggleRoomLive,
  onDeleteRoom,
  onCreateRoomClick,
  onOpenWallet,
  onOpenRecharge,
  onOpenFamily,
  onClaimTask,
  onShareInvite,
  onLogout,
}: ProfileViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMyRooms, setShowMyRooms] = useState(true);
  const [copiedUid, setCopiedUid] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [uploadError, setUploadError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassValues, setShowPassValues] = useState(false);
  const [passwordTab, setPasswordTab] = useState<'account' | 'wallet'>('account');
  const [passwordFeedback, setPasswordFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [currentWalletPass, setCurrentWalletPass] = useState('');
  const [newWalletPass, setNewWalletPass] = useState('');
  const [confirmWalletPass, setConfirmWalletPass] = useState('');
  const [walletPassFeedback, setWalletPassFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  const myRooms = rooms.filter((r) => r.hostUid === user.uid || r.hostId === user.id);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard?.writeText(user.uid);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 1800);
  };

  const handleQuickDpUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processAvatarFile(file);
      onUpdateProfile({ avatar: dataUrl });
      setEditAvatar(dataUrl);
      setUploadError('');
    } catch {
      setUploadError('Could not load this image. Try another photo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleModalDpUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processAvatarFile(file);
      setEditAvatar(dataUrl);
      setUploadError('');
    } catch {
      setUploadError('Could not load this image. Try another photo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateProfile({
      name: editName.trim(),
      bio: editBio.trim() || 'Dil se awaaz, raat ki mehfil aur behtareen dosti.',
      avatar: editAvatar,
    });
    setShowEditModal(false);
  };

  const openPasswordSettings = (defaultTab: 'account' | 'wallet' = 'account') => {
    setPasswordTab(defaultTab);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentWalletPass('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setShowPassValues(false);
    setPasswordFeedback(null);
    setWalletPassFeedback(null);
    setShowPasswordModal(true);
  };

  const handleChangeWalletPassword = (e: FormEvent) => {
    e.preventDefault();
    const hasExisting = Boolean(user.walletPassword);
    if (hasExisting && currentWalletPass.trim() !== user.walletPassword) {
      setWalletPassFeedback({ ok: false, text: 'Current VIP Wallet password is incorrect.' });
      return;
    }
    const next = newWalletPass.trim();
    if (next.length < 4) {
      setWalletPassFeedback({
        ok: false,
        text: 'VIP Wallet password must be at least 4 characters.',
      });
      return;
    }
    if (next !== confirmWalletPass.trim()) {
      setWalletPassFeedback({
        ok: false,
        text: 'New wallet password and confirm password do not match.',
      });
      return;
    }

    onUpdateWalletPassword(next);
    setCurrentWalletPass('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setWalletPassFeedback({
      ok: true,
      text: hasExisting
        ? 'VIP Wallet password updated!'
        : 'VIP Wallet password enabled! Your wallet is now locked.',
    });
  };

  const handleRemoveWalletPassword = () => {
    if (user.walletPassword && currentWalletPass.trim() !== user.walletPassword) {
      setWalletPassFeedback({
        ok: false,
        text: 'Enter your current VIP Wallet password to remove the lock.',
      });
      return;
    }
    onUpdateWalletPassword(undefined);
    setCurrentWalletPass('');
    setNewWalletPass('');
    setConfirmWalletPass('');
    setWalletPassFeedback({ ok: true, text: 'VIP Wallet password lock removed.' });
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    const expectedCurrent = user.password || '1234';
    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!current || current !== expectedCurrent) {
      setPasswordFeedback({ ok: false, text: 'Current password is incorrect.' });
      return;
    }
    if (next.length < 4) {
      setPasswordFeedback({ ok: false, text: 'New password must be at least 4 characters.' });
      return;
    }
    if (next !== confirm) {
      setPasswordFeedback({ ok: false, text: 'New password and confirm password do not match.' });
      return;
    }

    onUpdateProfile({ password: next });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({
      ok: true,
      text: 'Password updated! Use your new password next time you log in.',
    });
  };

  const isRedUid = user.uid === '100001';
  const hasWalletPass = Boolean(user.walletPassword && user.walletPassword.length > 0);
  const totalRecharged = user.totalRecharged ?? 0;
  const vipLevel = calculateVipLevel(totalRecharged, user.uid);
  const nameColorClass = getNameColorClass(vipLevel, user.uid, 'text-white');
  const nextVip = isRedUid ? null : getNextVipInfo(vipLevel);

  return (
    <div className="min-h-full pb-6">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0F0A1E]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <h1 className="font-display text-xl font-bold text-white">Profile</h1>
          <div className="flex items-center gap-2">
            {!isRedUid && (
              <button
                type="button"
                onClick={handleCopyUid}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-xs text-slate-200 tabular-nums hover:bg-white/10"
              >
                <span>UID: {user.uid}</span>
                {copiedUid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-pink-300" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => openPasswordSettings('account')}
              aria-label="Password Settings"
              title="Password & Security Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-pink-400/40 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 pt-5 sm:px-6">
        {/* Profile Header Card */}
        <section className="glass-surface overflow-hidden rounded-3xl">
          <div className="relative h-24 bg-gradient-to-r from-[#7C3AED]/55 via-[#EC4899]/40 to-[#1D123B] sm:h-28">
            <button
              type="button"
              onClick={() => {
                setEditName(user.name);
                setEditBio(user.bio);
                setEditAvatar(user.avatar);
                setUploadError('');
                setShowEditModal(true);
              }}
              aria-label="Edit profile"
              className="absolute right-3 top-3 inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-white/15 bg-black/35 px-3 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/55"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-11 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              {/* Avatar with direct Change DP button */}
              <div className="relative shrink-0 rounded-full ring-4 ring-[#130D26]">
                <AvatarBadge name={user.name} avatarId={user.avatar} size="xl" isSpeaking />
                <input
                  ref={quickFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQuickDpUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  aria-label="Upload custom DP"
                  title="Change DP"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white shadow-lg ring-2 ring-[#0F0A1E] transition-transform active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className={`font-display text-2xl font-extrabold ${nameColorClass}`}>
                    {user.name}
                  </h2>
                  {isRedUid ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>VIP 6</span>
                    </span>
                  ) : vipLevel > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-300 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>VIP {vipLevel}</span>
                    </span>
                  ) : null}
                  {(user.familyName || isRedUid) && (
                    <button
                      type="button"
                      onClick={onOpenFamily}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-extrabold transition-opacity hover:opacity-90 ${getFamilyBadgeClass(
                        isRedUid ? 'red' : user.familyColor,
                        isRedUid ? 'Jutt' : user.familyName
                      )}`}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>{isRedUid ? 'Jutt' : user.familyName}</span>
                    </button>
                  )}
                  <span className="rounded-lg bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-200">
                    Verified
                  </span>
                </div>

                {(!isRedUid || user.email) && (
                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 sm:justify-start">
                    {!isRedUid && (
                      <span className="font-mono font-semibold text-pink-300 tabular-nums">
                        UID: {user.uid}
                      </span>
                    )}
                    {user.email && <span>{!isRedUid ? `· ${user.email}` : user.email}</span>}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 text-center text-sm text-slate-300 sm:text-left">{user.bio}</p>

            {uploadError && (
              <p className="mt-2 text-center text-xs text-rose-400 sm:text-left">{uploadError}</p>
            )}

            {/* Level + Progress Bar */}
            <div className="mt-4 rounded-2xl border border-white/8 bg-[#130D26] p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-display font-bold text-white">
                  <Award className="h-4 w-4 text-pink-400" />
                  Level {user.level}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {user.xp}% to Level {user.level + 1}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899]"
                  style={{ width: `${user.xp}%` }}
                />
              </div>
            </div>

            {/* VIP Tier & Recharge Perks Card */}
            <div className="mt-3 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 via-[#150E2A] to-violet-500/10 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-display font-bold text-amber-300">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {vipLevel === 6 ? 'VIP 6 Status' : `VIP ${vipLevel} Status`}
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-300 tabular-nums">
                  {vipLevel >= 5
                    ? 'Red Name · Not Block Any Room'
                    : vipLevel === 4
                      ? 'Gold ID Name Unlocked'
                      : nextVip
                        ? `${formatMillionLabel(totalRecharged)} / ${formatMillionLabel(nextVip.requiredRecharge)} → ${nextVip.label}`
                        : ''}
                </span>
              </div>

              {!isRedUid && nextVip && (
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{
                        width: `${Math.min(100, Math.round((totalRecharged / nextVip.requiredRecharge) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Next unlock ({nextVip.label} at {formatMillionLabel(nextVip.requiredRecharge)}):{' '}
                    <span className="font-semibold text-amber-200">{nextVip.perk}</span>
                  </p>
                </div>
              )}

              {!isRedUid && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {VIP_TIERS.map((tier) => {
                    const unlocked = vipLevel >= tier.level;
                    return (
                      <span
                        key={tier.level}
                        className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold ${
                          unlocked
                            ? 'border border-amber-400/40 bg-amber-400/20 text-amber-200'
                            : 'border border-white/10 bg-white/5 text-slate-400'
                        }`}
                      >
                        {tier.label}: {formatMillionLabel(tier.requiredRecharge)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

          {/* Stats Row: Followers & Following only (Coins & Diamonds live in Wallet) */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-center">
            <div className="rounded-2xl bg-[#140E28] p-3">
              <p className="font-mono text-base font-bold text-white tabular-nums sm:text-lg">
                {user.followers}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Followers</p>
            </div>
            <div className="rounded-2xl bg-[#140E28] p-3">
              <p className="font-mono text-base font-bold text-white tabular-nums sm:text-lg">
                {user.following}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Following</p>
            </div>
          </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onOpenWallet}
            className="glass-elevated flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-cyan-400/50"
          >
            <Wallet className="h-5 w-5 shrink-0 text-cyan-300" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-display text-sm font-bold text-white">
                  {vipLevel >= 1 ? 'VIP Wallet' : 'Wallet'}
                </p>
                {hasWalletPass && <Lock className="h-3 w-3 shrink-0 text-amber-300" />}
              </div>
              <p className="truncate text-xs text-slate-400">
                {hasWalletPass ? 'Pass Protected' : vipLevel >= 1 ? 'Set VIP Pass' : 'Coins & Gems'}
              </p>
            </div>
          </button>

          {isRedUid && (
            <button
              type="button"
              onClick={onOpenRecharge}
              className="glass-elevated flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-pink-400/50"
            >
              <ArrowRightLeft className="h-5 w-5 shrink-0 text-pink-400" />
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-white">Recharge</p>
                <p className="truncate text-xs text-slate-400">Send coins</p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenFamily}
            className="glass-surface flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-red-500/45"
          >
            <Shield
              className={`h-5 w-5 shrink-0 ${
                user.familyName || isRedUid
                  ? getFamilyNameColorClass(
                      isRedUid ? 'red' : user.familyColor,
                      isRedUid ? 'Jutt' : user.familyName
                    )
                  : 'text-pink-400'
              }`}
            />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">Family</p>
              <p
                className={`truncate text-xs font-bold ${
                  user.familyName || isRedUid
                    ? getFamilyNameColorClass(
                        isRedUid ? 'red' : user.familyColor,
                        isRedUid ? 'Jutt' : user.familyName
                      )
                    : 'text-slate-400'
                }`}
              >
                {isRedUid ? 'Jutt' : user.familyName || 'Join / Create'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowMyRooms((prev) => !prev)}
            className="glass-surface flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-pink-400/35"
          >
            <Radio className="h-5 w-5 shrink-0 text-pink-400" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">My Rooms</p>
              <p className="text-xs text-slate-400 tabular-nums">{myRooms.length} rooms</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditName(user.name);
              setEditBio(user.bio);
              setEditAvatar(user.avatar);
              setUploadError('');
              setShowEditModal(true);
            }}
            className="glass-surface flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-pink-400/35"
          >
            <Edit3 className="h-5 w-5 shrink-0 text-violet-400" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">Edit Profile</p>
              <p className="truncate text-xs text-slate-400">DP &amp; Name</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => openPasswordSettings('wallet')}
            className="glass-surface flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:border-pink-400/35"
          >
            <KeyRound className="h-5 w-5 shrink-0 text-amber-300" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">Security &amp; Pass</p>
              <p className="truncate text-xs text-slate-400">
                {hasWalletPass ? 'VIP Wallet Locked' : 'Login & Wallet Pass'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-[54px] items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-left transition-colors hover:bg-rose-500/20"
          >
            <LogOut className="h-5 w-5 shrink-0 text-rose-400" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-rose-200">Logout</p>
              <p className="truncate text-xs text-rose-300/75">Exit session</p>
            </div>
          </button>
        </section>

        {/* My Rooms Management */}
        <AnimatePresence initial={false}>
          {showMyRooms && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-surface rounded-3xl p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">My Rooms</h3>
                    <p className="text-[11px] text-slate-400">1 open room max per ID</p>
                  </div>
                  <button
                    type="button"
                    onClick={onCreateRoomClick}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Room</span>
                  </button>
                </div>

                {myRooms.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">
                    All rooms are currently closed. Tap New Room to open your live room!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {myRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#140E28] p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-display text-sm font-bold text-white">
                            {room.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {room.topic} · {room.isLive ? 'Live' : 'Closed'} ·{' '}
                            {room.isPrivate ? 'Private' : 'Public'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleRoomLive(room.id)}
                            className={`inline-flex min-h-[36px] items-center gap-1 rounded-xl px-3 text-xs font-semibold ${
                              room.isLive
                                ? 'border border-rose-400/30 bg-rose-500/15 text-rose-200'
                                : 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span>{room.isLive ? 'Close' : 'Open'}</span>
                          </button>
                          {room.isLive && (
                            <button
                              type="button"
                              onClick={() => onOpenRoom(room)}
                              className="min-h-[36px] rounded-xl bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
                            >
                              Enter
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteRoom(room.id)}
                            aria-label={`Delete ${room.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-400 hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Share 1 Person Win 1,000,000 + Daily Task 100,000 */}
        <RewardsSection
          uid={user.uid}
          dailyTasks={dailyTasks}
          shareReward={shareReward}
          onClaimTask={onClaimTask}
          onShareInvite={onShareInvite}
        />
      </main>

      {/* Edit Profile & Custom DP Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass-elevated max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">Edit Profile &amp; DP</h2>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close edit profile"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <AvatarBadge name={editName || user.name} avatarId={editAvatar} size="lg" />
                  <div className="flex-1">
                    <input
                      ref={modalFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleModalDpUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-pink-400/40 bg-pink-500/15 px-3.5 text-xs font-bold text-pink-200 hover:bg-pink-500/25"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Custom DP</span>
                    </button>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Choose any photo from gallery or pick a style below.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-xs font-medium text-slate-300">
                    Or Pick Avatar Style
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setEditAvatar(preset.id)}
                        className={`rounded-full p-0.5 transition-transform ${
                          editAvatar === preset.id
                            ? 'scale-110 ring-2 ring-pink-400'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <AvatarBadge name={editName || user.name} avatarId={preset.id} size="md" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-stage-name"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Stage Name
                  </label>
                  <input
                    id="edit-stage-name"
                    type="text"
                    maxLength={24}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 text-sm font-bold focus:border-pink-400 focus:outline-none ${nameColorClass}`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-bio"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Bio
                  </label>
                  <textarea
                    id="edit-bio"
                    rows={2}
                    maxLength={100}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#120C24] px-4 py-2.5 text-sm text-white focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-sm font-bold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Setting Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass-elevated max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-6"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Security &amp; Passwords</h2>
                    <p className="text-xs text-slate-400">
                      Manage Account Login &amp; VIP Wallet Password
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  aria-label="Close password settings"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#120C24] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordTab('wallet');
                    setWalletPassFeedback(null);
                  }}
                  className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
                    passwordTab === 'wallet'
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>VIP Wallet Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordTab('account');
                    setPasswordFeedback(null);
                  }}
                  className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
                    passwordTab === 'account'
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Account Login</span>
                </button>
              </div>

              {passwordTab === 'wallet' ? (
                <form onSubmit={handleChangeWalletPassword} className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs">
                    <span className="font-semibold text-amber-200">VIP Wallet Lock Status</span>
                    <span
                      className={`font-mono font-bold ${
                        hasWalletPass ? 'text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      {hasWalletPass ? 'ACTIVE' : 'NOT SET'}
                    </span>
                  </div>

                  {hasWalletPass && (
                    <div>
                      <label
                        htmlFor="profile-wallet-current-password"
                        className="mb-1.5 block text-xs font-medium text-slate-300"
                      >
                        Current VIP Wallet Password
                      </label>
                      <div className="relative">
                        <input
                          id="profile-wallet-current-password"
                          type={showPassValues ? 'text' : 'password'}
                          value={currentWalletPass}
                          onChange={(e) => setCurrentWalletPass(e.target.value)}
                          placeholder="Enter current VIP Wallet password"
                          className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-4 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassValues((prev) => !prev)}
                          aria-label={showPassValues ? 'Hide passwords' : 'Show passwords'}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                        >
                          {showPassValues ? (
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
                      htmlFor="profile-wallet-new-password"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      {hasWalletPass ? 'New VIP Wallet Password' : 'Create VIP Wallet Password'}
                    </label>
                    <div className="relative">
                      <input
                        id="profile-wallet-new-password"
                        type={showPassValues ? 'text' : 'password'}
                        value={newWalletPass}
                        onChange={(e) => setNewWalletPass(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-4 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                      {!hasWalletPass && (
                        <button
                          type="button"
                          onClick={() => setShowPassValues((prev) => !prev)}
                          aria-label={showPassValues ? 'Hide passwords' : 'Show passwords'}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                        >
                          {showPassValues ? (
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
                      htmlFor="profile-wallet-confirm-password"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Confirm VIP Wallet Password
                    </label>
                    <input
                      id="profile-wallet-confirm-password"
                      type={showPassValues ? 'text' : 'password'}
                      value={confirmWalletPass}
                      onChange={(e) => setConfirmWalletPass(e.target.value)}
                      placeholder="Re-enter VIP Wallet password"
                      className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {walletPassFeedback && (
                    <p
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                        walletPassFeedback.ok
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {walletPassFeedback.text}
                    </p>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-sm font-bold text-white"
                    >
                      {hasWalletPass ? 'Update Wallet Pass' : 'Set Wallet Pass'}
                    </button>
                  </div>

                  {hasWalletPass && (
                    <button
                      type="button"
                      onClick={handleRemoveWalletPassword}
                      className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                    >
                      Remove VIP Wallet Password Lock
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="settings-current-password"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="settings-current-password"
                        type={showPassValues ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] pl-4 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassValues((prev) => !prev)}
                        aria-label={showPassValues ? 'Hide passwords' : 'Show passwords'}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {showPassValues ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="settings-new-password"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      New Password
                    </label>
                    <input
                      id="settings-new-password"
                      type={showPassValues ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-confirm-password"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="settings-confirm-password"
                      type={showPassValues ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="min-h-[46px] w-full rounded-xl border border-white/15 bg-[#120C24] px-4 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  {passwordFeedback && (
                    <p
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                        passwordFeedback.ok
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {passwordFeedback.text}
                    </p>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-sm font-bold text-white"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
