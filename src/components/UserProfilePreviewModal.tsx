import { AnimatePresence, motion } from 'motion/react';
import { Award, Gift, Shield, Sparkles, Star, UserCheck, UserPlus, X } from 'lucide-react';
import { FamilyNameColor } from '../types';
import { getFamilyBadgeClass, getNameColorClass } from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';

export interface PreviewProfileTarget {
  id: string;
  uid?: string;
  name: string;
  avatar: string;
  vipLevel?: number;
  familyName?: string;
  familyColor?: FamilyNameColor;
  roleLabel: string;
  bio?: string;
  level?: number;
  followersLabel?: string;
  isAdmin?: boolean;
  canGift?: boolean;
  canFollow?: boolean;
  isFollowing?: boolean;
}

interface UserProfilePreviewModalProps {
  target: PreviewProfileTarget | null;
  onClose: () => void;
  onSendGift?: (recipientName: string) => void;
  onToggleFollow?: (targetId: string) => void;
}

export function UserProfilePreviewModal({
  target,
  onClose,
  onSendGift,
  onToggleFollow,
}: UserProfilePreviewModalProps) {
  const isRedUid = target?.uid === '100001';
  const targetVip = target?.vipLevel ?? 0;
  const targetNameColor = getNameColorClass(targetVip, target?.uid, 'text-white');

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated max-h-[88dvh] w-full max-w-md overflow-hidden rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-5"
          >
            {/* Cover Banner */}
            <div className="relative h-24 bg-gradient-to-r from-[#7C3AED]/60 via-[#EC4899]/50 to-[#311B6B]">
              <div className="mx-auto pt-2.5 sm:hidden">
                <div className="mx-auto h-1.5 w-10 rounded-full bg-white/30" />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile view"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/35 text-white backdrop-blur-md hover:bg-black/55"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="-mt-10 px-5">
              <div className="flex items-end justify-between gap-3">
                <div className="rounded-full ring-4 ring-[#191133]">
                  <AvatarBadge name={target.name} avatarId={target.avatar} size="xl" isSpeaking />
                </div>

                <div className="mb-1 flex items-center gap-2">
                  {target.isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-violet-400/35 bg-violet-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-200">
                      <Shield className="h-3 w-3" />
                      <span>Admin</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                    <Sparkles className="h-3 w-3 text-pink-300" />
                    <span>{target.roleLabel}</span>
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`font-display text-xl font-extrabold ${targetNameColor}`}>
                    {target.name}
                  </h2>
                  {!isRedUid && targetVip > 0 && targetVip <= 5 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>VIP {targetVip}</span>
                    </span>
                  )}
                  {(target.familyName || isRedUid) && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-extrabold ${getFamilyBadgeClass(
                        isRedUid ? 'red' : target.familyColor,
                        isRedUid ? 'Jutt' : target.familyName
                      )}`}
                    >
                      <Shield className="h-3 w-3" />
                      <span>{isRedUid ? 'Jutt' : target.familyName}</span>
                    </span>
                  )}
                  <span className="rounded-lg bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-200">
                    Verified
                  </span>
                </div>

                {target.uid && !isRedUid && (
                  <p className="mt-1 font-mono text-xs font-semibold text-pink-300 tabular-nums">
                    UID: {target.uid}
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-300">
                  {target.bio || 'Dil se awaaz, raat ki mehfil aur behtareen dosti.'}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-[#140E28] px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Award className="h-3.5 w-3.5 text-pink-400" />
                    <span>Level</span>
                  </span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white tabular-nums">
                    Lv.{target.level ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#140E28] px-3.5 py-2.5">
                  <span className="text-[11px] text-slate-400">Followers</span>
                  <p className="mt-0.5 font-mono text-sm font-bold text-white tabular-nums">
                    {target.followersLabel ?? '0'}
                  </p>
                </div>
              </div>

              {(target.canGift || target.canFollow) && (
                <div className="mt-4 flex gap-2.5">
                  {target.canFollow && onToggleFollow && (
                    <button
                      type="button"
                      onClick={() => onToggleFollow(target.id)}
                      className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-bold transition-colors ${
                        target.isFollowing
                          ? 'border border-white/15 bg-white/10 text-slate-200'
                          : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                      }`}
                    >
                      {target.isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}

                  {target.canGift && onSendGift && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSendGift(target.name);
                      }}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-xs font-bold text-white shadow-lg shadow-pink-500/20"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Send Gift</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
