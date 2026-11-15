import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Coins,
  Crown,
  Gamepad2,
  Gift,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Power,
  Send,
  Shield,
  ShieldCheck,
  Smile,
  Unlock,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { GIFT_CATALOG, QUICK_EMOJIS } from '../data/seedData';
import { GiftItem, MicSeat, UserProfile, VoiceRoom } from '../types';
import {
  calculateVipLevel,
  canBypassRoomBlock,
  getFamilyBadgeClass,
  getFamilyNameColorClass,
  getNameColorClass,
} from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';
import { SafeImage } from './SafeImage';
import { PreviewProfileTarget, UserProfilePreviewModal } from './UserProfilePreviewModal';

interface RoomViewProps {
  room: VoiceRoom;
  user: UserProfile;
  onLeaveRoom: () => void;
  onCloseRoom: (roomId: string) => void;
  onJoinMic: (roomId: string, preferredSeat?: number) => void;
  onLeaveMic: (roomId: string) => void;
  onToggleMute: (roomId: string) => void;
  onSendMessage: (roomId: string, text: string) => void;
  onSendGift: (
    roomId: string,
    gift: GiftItem,
    recipientName: string
  ) => { ok: boolean; luckyMultiplier?: number; luckyWinCoins?: number };
  onOpenGames: () => void;
  onToggleAdmin: (roomId: string, participantId: string) => void;
  onAdminSeatParticipant: (roomId: string, participantId: string) => void;
  onAdminMuteSeat: (roomId: string, seatNumber: number) => void;
  onAdminKickSeat: (roomId: string, seatNumber: number) => void;
  onAdminToggleLockSeat: (roomId: string, seatNumber: number) => void;
}

export function RoomView({
  room,
  user,
  onLeaveRoom,
  onCloseRoom,
  onJoinMic,
  onLeaveMic,
  onToggleMute,
  onSendMessage,
  onSendGift,
  onOpenGames,
  onToggleAdmin,
  onAdminSeatParticipant,
  onAdminMuteSeat,
  onAdminKickSeat,
  onAdminToggleLockSeat,
}: RoomViewProps) {
  const [messageText, setMessageText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState(room.hostName);
  const [giftTab, setGiftTab] = useState<'normal' | 'lucky'>('normal');
  const [previewProfile, setPreviewProfile] = useState<PreviewProfileTarget | null>(null);
  const [coinWarning, setCoinWarning] = useState('');
  const [floatingGift, setFloatingGift] = useState<{
    id: string;
    emoji: string;
    name: string;
    sender: string;
    recipient: string;
    luckyMultiplier?: number;
    luckyWinCoins?: number;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const mySeat = room.seats.find((s) => s.occupantId === user.id);
  const isSeated = Boolean(mySeat);
  const isMuted = mySeat ? mySeat.isMuted : false;
  const isHost = room.hostId === user.id;
  const isAdmin = isHost || room.adminIds.includes(user.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.messages.length]);

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage(room.id, messageText.trim());
    setMessageText('');
    setShowEmojis(false);
  };

  const formatCompactCoins = (amount: number) => {
    if (amount >= 1_000_000) {
      const m = amount / 1_000_000;
      return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      const k = amount / 1_000;
      return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  const handleGiftSend = (gift: GiftItem) => {
    if (user.coins < gift.coins) {
      setCoinWarning(`Need ${(gift.coins - user.coins).toLocaleString()} more coins for ${gift.name}.`);
      return;
    }
    const res = onSendGift(room.id, gift, giftRecipient);
    if (res.ok) {
      setCoinWarning('');
      setShowGiftPanel(false);
      setFloatingGift({
        id: `${Date.now()}`,
        emoji: gift.emoji,
        name: gift.name,
        sender: user.name,
        recipient: giftRecipient,
        luckyMultiplier: res.luckyMultiplier,
        luckyWinCoins: res.luckyWinCoins,
      });
      setTimeout(() => {
        setFloatingGift(null);
      }, 2800);
    }
  };

  const handleSeatClick = (seat: MicSeat) => {
    const myVip = calculateVipLevel(user.totalRecharged ?? 0, user.uid);
    const hasAntiBlock = canBypassRoomBlock(myVip, user.uid);
    if (seat.isLocked && !isAdmin && !hasAntiBlock) return;
    if (!seat.occupantId) {
      if (seat.isLocked && isAdmin && !hasAntiBlock) {
        onAdminToggleLockSeat(room.id, seat.seatNumber);
        return;
      }
      onJoinMic(room.id, seat.seatNumber);
    } else if (seat.occupantId === user.id && !seat.isHost) {
      onLeaveMic(room.id);
    } else if (seat.occupantName && seat.occupantAvatar) {
      const occupantIsHost = seat.isHost;
      const occupantIsAdmin = occupantIsHost || room.adminIds.includes(seat.occupantId);
      const matchedParticipant = room.participants.find((p) => p.id === seat.occupantId);
      const occupantUid = occupantIsHost ? room.hostUid : seat.occupantUid || matchedParticipant?.uid;

      setPreviewProfile({
        id: seat.occupantId,
        uid: occupantUid,
        name: seat.occupantName,
        avatar: seat.occupantAvatar,
        vipLevel: occupantIsHost ? room.hostVipLevel : seat.occupantVipLevel,
        familyName: occupantIsHost
          ? room.hostUid === '100001'
            ? 'Jutt'
            : room.hostFamilyName
          : occupantUid === '100001'
          ? 'Jutt'
          : seat.occupantFamilyName,
        familyColor: occupantIsHost
          ? room.hostUid === '100001'
            ? 'red'
            : room.hostFamilyColor
          : occupantUid === '100001'
          ? 'red'
          : seat.occupantFamilyColor,
        roleLabel: occupantIsHost ? 'Room Host' : occupantIsAdmin ? 'Room Admin' : 'Speaker',
        isAdmin: occupantIsAdmin,
        bio: occupantIsHost ? room.subtitle : `Active on Mic #${seat.seatNumber} in ${room.name}`,
        canGift: true,
      });
    }
  };

  const seatedRecipients = Array.from(
    new Set(room.seats.filter((s) => s.occupantName).map((s) => s.occupantName as string))
  );

  return (
    <div className="relative flex min-h-full flex-col bg-[#0F0A1E]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <SafeImage
          src={room.coverImage}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-20 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0A1E]/40 via-[#0F0A1E]/85 to-[#0F0A1E]" />
      </div>

      {/* Top Room Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#120C24]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onLeaveRoom}
              aria-label="Back to rooms"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-bold text-white sm:text-lg">
                {room.name}
              </h1>
              <p className="truncate text-xs text-slate-300">
                Host:{' '}
                <span
                  className={`font-bold ${getNameColorClass(
                    room.hostVipLevel ?? 0,
                    room.hostUid,
                    'text-pink-300'
                  )}`}
                >
                  {room.hostName}
                </span>
                {(room.hostFamilyName || room.hostUid === '100001') && (
                  <>
                    {' '}
                    ·{' '}
                    <span
                      className={`font-extrabold ${getFamilyNameColorClass(
                        room.hostUid === '100001' ? 'red' : room.hostFamilyColor,
                        room.hostUid === '100001' ? 'Jutt' : room.hostFamilyName
                      )}`}
                    >
                      {room.hostUid === '100001' ? 'Jutt' : room.hostFamilyName}
                    </span>
                  </>
                )}
                {room.hostUid !== '100001' && (
                  <>
                    {' '}
                    · UID <span className="font-mono tabular-nums">{room.hostUid}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-slate-200">
              <Users className="h-3.5 w-3.5 text-pink-400" />
              <span className="font-mono tabular-nums">{room.listenersCount}</span>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAdminPanel(true)}
                className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-violet-400/35 bg-violet-500/20 px-2.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/30"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLeaveRoom}
              aria-label="Leave Room"
              className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Stage + Chat */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-4 pt-4 sm:px-6">
        <AnimatePresence>
          {floatingGift && (
            <motion.div
              key={floatingGift.id}
              initial={{ opacity: 0, scale: 0.7, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2"
            >
              <div className="glass-elevated flex items-center gap-3 rounded-3xl px-5 py-3 shadow-2xl shadow-pink-500/30">
                <span className="text-4xl">{floatingGift.emoji}</span>
                <div>
                  <p className="font-display text-sm font-bold text-white">
                    {floatingGift.sender} sent {floatingGift.name}
                  </p>
                  <p className="text-xs text-pink-300">to {floatingGift.recipient}</p>
                  {floatingGift.luckyWinCoins && floatingGift.luckyWinCoins > 0 ? (
                    <p className="mt-0.5 font-mono text-xs font-extrabold text-amber-300 tabular-nums">
                      Lucky Win x{floatingGift.luckyMultiplier} · +
                      {floatingGift.luckyWinCoins.toLocaleString()} Coins!
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 8 Mic Seats Stage */}
        <section aria-label="Voice stage seats" className="glass-surface rounded-3xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Voice Stage · {room.adminIds.length + 1} Admins
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-300 tabular-nums">
              <Coins className="h-3.5 w-3.5" />
              {user.coins.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {room.seats.map((seat) => {
              const occupied = Boolean(seat.occupantId);
              const isMe = seat.occupantId === user.id;
              const seatIsAdmin =
                seat.isHost || (seat.occupantId ? room.adminIds.includes(seat.occupantId) : false);

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  onClick={() => handleSeatClick(seat)}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  {occupied && seat.occupantName && seat.occupantAvatar ? (
                    <div className="relative">
                      <AvatarBadge
                        name={seat.occupantName}
                        avatarId={seat.occupantAvatar}
                        size="lg"
                        isSpeaking={seat.isSpeaking}
                        isMuted={seat.isMuted}
                      />
                      {seat.isHost ? (
                        <span
                          aria-label="Host"
                          className="absolute -top-1.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 text-[#0F0A1E] shadow"
                        >
                          <Crown className="h-3 w-3" />
                        </span>
                      ) : seatIsAdmin ? (
                        <span
                          aria-label="Admin"
                          className="absolute -top-1.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-violet-500 text-white shadow"
                        >
                          <Shield className="h-3 w-3" />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border border-dashed ${
                        seat.isLocked
                          ? 'border-amber-400/35 bg-amber-500/10 text-amber-300'
                          : 'border-white/20 bg-[#1B1333] text-slate-400 group-hover:border-pink-400 group-hover:text-pink-300'
                      }`}
                    >
                      {seat.isLocked ? <Lock className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </div>
                  )}

                  <span
                    className={`w-full truncate text-[11px] font-bold ${
                      isMe
                        ? getNameColorClass(
                            calculateVipLevel(user.totalRecharged ?? 0, user.uid),
                            user.uid,
                            'text-pink-300'
                          )
                        : seat.isHost
                          ? getNameColorClass(
                              room.hostVipLevel ?? 0,
                              room.hostUid,
                              'text-slate-100'
                            )
                          : occupied
                            ? getNameColorClass(
                                seat.occupantVipLevel ?? 0,
                                seat.occupantUid ?? undefined,
                                'text-slate-100'
                              )
                            : seat.isLocked
                              ? 'text-amber-300'
                              : 'text-slate-400 group-hover:text-pink-200'
                    }`}
                  >
                    {seat.isHost
                      ? `${seat.occupantName} (Host)`
                      : seatIsAdmin && occupied
                        ? `${seat.occupantName} (Admin)`
                        : isMe
                          ? `${seat.occupantName} (You)`
                          : seat.occupantName || (seat.isLocked ? 'Locked' : 'Join Mic')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-4">
            {isSeated ? (
              !mySeat?.isHost && (
                <button
                  type="button"
                  onClick={() => onLeaveMic(room.id)}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-rose-400/35 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-200 transition-colors hover:bg-rose-500/25"
                >
                  <MicOff className="h-4 w-4" />
                  <span>Leave Mic</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => onJoinMic(room.id)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-transform active:scale-95 hover:brightness-110"
              >
                <Mic className="h-4 w-4" />
                <span>Join Mic</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isSeated) {
                  onJoinMic(room.id);
                } else {
                  onToggleMute(room.id);
                }
              }}
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-colors ${
                isSeated && isMuted
                  ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                  : 'border-white/15 bg-white/8 text-white hover:bg-white/12'
              }`}
            >
              {isSeated && isMuted ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-pink-300" />
                  <span>{isSeated ? 'Mute' : 'Mic Off'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenGames}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-xs font-bold text-violet-200 transition-colors hover:bg-violet-500/25"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Games</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCoinWarning('');
                setShowGiftPanel(true);
              }}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-pink-400/35 bg-pink-500/15 px-4 py-2 text-xs font-bold text-pink-200 transition-colors hover:bg-pink-500/25"
            >
              <Gift className="h-4 w-4" />
              <span>Gift</span>
            </button>
          </div>
        </section>

        {/* Live Chat Section */}
        <section
          aria-label="Room chat"
          className="glass-surface flex flex-1 flex-col overflow-hidden rounded-3xl"
        >
          <div className="max-h-[340px] min-h-[210px] flex-1 space-y-2.5 overflow-y-auto p-4">
            {room.messages.map((msg) => {
              if (msg.type === 'system') {
                return (
                  <div
                    key={msg.id}
                    className="rounded-xl bg-white/5 px-3 py-1.5 text-center text-xs text-slate-300"
                  >
                    {msg.text}
                  </div>
                );
              }

              if (msg.type === 'gift' && msg.gift) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-pink-400/30 bg-gradient-to-r from-violet-600/25 to-pink-600/25 px-3.5 py-2.5"
                  >
                    <span className="text-2xl">{msg.gift.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white">
                        {msg.senderName} sent {msg.gift.name} to {msg.gift.recipientName}
                      </p>
                      <p className="font-mono text-[11px] text-amber-300 tabular-nums">
                        -{msg.gift.coins.toLocaleString()} coins · {msg.timestamp}
                      </p>
                      {msg.gift.isLucky && msg.gift.luckyWinCoins && msg.gift.luckyWinCoins > 0 ? (
                        <p className="mt-0.5 font-mono text-[11px] font-extrabold text-emerald-300 tabular-nums">
                          Lucky Win x{msg.gift.luckyMultiplier} (+
                          {msg.gift.luckyWinCoins.toLocaleString()} Coins!)
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <AvatarBadge name={msg.senderName} avatarId={msg.senderAvatar} size="xs" />
                  <div className="min-w-0 flex-1 rounded-2xl bg-[#1F163B] px-3.5 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`truncate text-xs font-bold ${getNameColorClass(
                            msg.senderId === user.id
                              ? calculateVipLevel(user.totalRecharged ?? 0, user.uid)
                              : msg.senderVipLevel ?? 0,
                            msg.senderId === user.id ? user.uid : msg.senderUid,
                            'text-pink-300'
                          )}`}
                        >
                          {msg.senderName}
                        </span>
                        {(msg.senderFamilyName ||
                          msg.senderUid === '100001' ||
                          (msg.senderId === user.id && (user.familyName || user.uid === '100001'))) && (
                          <span
                            className={`shrink-0 rounded border px-1 py-0.2 text-[9px] font-extrabold ${getFamilyBadgeClass(
                              (msg.senderId === user.id ? user.uid : msg.senderUid) === '100001'
                                ? 'red'
                                : msg.senderId === user.id
                                ? user.familyColor
                                : msg.senderFamilyColor,
                              (msg.senderId === user.id ? user.uid : msg.senderUid) === '100001'
                                ? 'Jutt'
                                : msg.senderId === user.id
                                ? user.familyName
                                : msg.senderFamilyName
                            )}`}
                          >
                            {(msg.senderId === user.id ? user.uid : msg.senderUid) === '100001'
                              ? 'Jutt'
                              : msg.senderId === user.id
                              ? user.familyName
                              : msg.senderFamilyName}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-slate-500 tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 break-words text-sm text-slate-100">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-white/10 bg-[#150F29]"
              >
                <div className="flex flex-wrap gap-1.5 p-2.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMessageText((prev) => `${prev}${emoji}`)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleChatSubmit}
            className="flex items-center gap-2 border-t border-white/10 bg-[#130D26] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <button
              type="button"
              onClick={() => setShowEmojis((prev) => !prev)}
              aria-label="Toggle emoji picker"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                showEmojis
                  ? 'border-pink-400 bg-pink-500/20 text-pink-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Smile className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Say something in the mehfil..."
              className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-[#1D1536] px-3.5 text-sm text-white placeholder:text-slate-400 focus:border-pink-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => {
                setCoinWarning('');
                setShowGiftPanel(true);
              }}
              aria-label="Open gift panel"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pink-400/30 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25"
            >
              <Gift className="h-5 w-5" />
            </button>

            <button
              type="submit"
              aria-label="Send chat message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white transition-transform active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>

      {/* Host & Admin Management Panel */}
      <AnimatePresence>
        {showAdminPanel && isAdmin && (
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
              className="glass-elevated max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-violet-300" />
                  <h2 className="font-display text-lg font-bold text-white">
                    Host &amp; Admin Controls
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminPanel(false)}
                  aria-label="Close admin panel"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Manage Mic Seats */}
              <div className="mb-5">
                <h3 className="mb-2 text-xs font-semibold text-slate-300">Mic Seat Controls</h3>
                <div className="space-y-2">
                  {room.seats
                    .filter((s) => !s.isHost)
                    .map((seat) => {
                      const seatProtected = canBypassRoomBlock(
                        seat.occupantVipLevel ?? 0,
                        seat.occupantUid ?? undefined
                      );
                      return (
                      <div
                        key={seat.seatNumber}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#140E28] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-white">
                              Seat #{seat.seatNumber} · {seat.occupantName || 'Empty'}
                            </p>
                            {seatProtected && (
                              <span className="shrink-0 rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                                Protected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {seat.isLocked ? 'Locked' : seat.occupantId ? 'Active' : 'Open'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {seat.occupantId && !seatProtected && (
                            <>
                              <button
                                type="button"
                                onClick={() => onAdminMuteSeat(room.id, seat.seatNumber)}
                                aria-label="Mute or unmute seat"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/15"
                              >
                                {seat.isMuted ? (
                                  <MicOff className="h-4 w-4 text-amber-300" />
                                ) : (
                                  <Mic className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => onAdminKickSeat(room.id, seat.seatNumber)}
                                aria-label="Remove from mic"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => onAdminToggleLockSeat(room.id, seat.seatNumber)}
                            aria-label="Lock or unlock seat"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/15"
                          >
                            {seat.isLocked ? (
                              <Unlock className="h-4 w-4 text-amber-300" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      );
                    })}
                </div>
              </div>

              {/* Manage Admins & Room Members */}
              <div className="mb-5">
                <h3 className="mb-2 text-xs font-semibold text-slate-300">
                  Room Members &amp; Admins
                </h3>
                <div className="space-y-2">
                  {room.participants.map((member) => {
                    const memberIsAdmin = room.adminIds.includes(member.id);
                    const memberSeated = room.seats.some((s) => s.occupantId === member.id);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#140E28] px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <AvatarBadge name={member.name} avatarId={member.avatar} size="xs" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">{member.name}</p>
                            <p className="font-mono text-[10px] text-slate-400 tabular-nums">
                              UID: {member.uid}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          {!memberSeated && (
                            <button
                              type="button"
                              onClick={() => onAdminSeatParticipant(room.id, member.id)}
                              className="inline-flex min-h-[34px] items-center gap-1 rounded-xl bg-white/10 px-2.5 text-[11px] font-semibold text-white hover:bg-white/15"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              <span>Invite Mic</span>
                            </button>
                          )}
                          {isHost && (
                            <button
                              type="button"
                              onClick={() => onToggleAdmin(room.id, member.id)}
                              className={`min-h-[34px] rounded-xl px-2.5 text-[11px] font-bold transition-colors ${
                                memberIsAdmin
                                  ? 'bg-violet-500 text-white'
                                  : 'border border-violet-400/35 bg-violet-500/15 text-violet-200'
                              }`}
                            >
                              {memberIsAdmin ? 'Admin' : 'Make Admin'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Room Button for Host */}
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPanel(false);
                    onCloseRoom(room.id);
                  }}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 px-4 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/30"
                >
                  <Power className="h-4 w-4" />
                  <span>Close This Room</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Panel Drawer */}
      <AnimatePresence>
        {showGiftPanel && (
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
              className="glass-elevated max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-5"
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Send a Gift</h2>
                  <p className="text-xs text-slate-300">
                    Your balance:{' '}
                    <span className="font-mono font-semibold text-amber-300 tabular-nums">
                      {user.coins.toLocaleString()} coins
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGiftPanel(false)}
                  aria-label="Close gift panel"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <span className="mb-1.5 block text-xs font-medium text-slate-300">Send to</span>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {seatedRecipients.map((recipient) => (
                    <button
                      key={recipient}
                      type="button"
                      onClick={() => setGiftRecipient(recipient)}
                      className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                        giftRecipient === recipient
                          ? 'bg-pink-500 text-white'
                          : 'border border-white/10 bg-[#140E28] text-slate-300'
                      }`}
                    >
                      {recipient}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Category Tabs: Gifts (up to 10M) vs Lucky Gifts (up to 50K) */}
              <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-[#130C26] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setGiftTab('normal');
                    setCoinWarning('');
                  }}
                  className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                    giftTab === 'normal'
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Gifts (Up to 10M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGiftTab('lucky');
                    setCoinWarning('');
                  }}
                  className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors ${
                    giftTab === 'lucky'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F0A1E]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Lucky Gifts (Up to 50K)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {GIFT_CATALOG.filter((g) => g.category === giftTab).map((gift) => {
                  const canAfford = user.coins >= gift.coins;
                  return (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => handleGiftSend(gift)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-transform active:scale-95 ${
                        canAfford
                          ? gift.category === 'lucky'
                            ? 'border-amber-400/30 bg-[#1B1336] hover:border-amber-300/60 hover:bg-[#241947]'
                            : 'border-white/15 bg-[#191133] hover:border-pink-400/50 hover:bg-[#221745]'
                          : 'border-white/8 bg-[#140E28]/70 opacity-75'
                      }`}
                    >
                      {gift.category === 'lucky' && gift.maxMultiplier && (
                        <span className="absolute right-2 top-2 rounded-md bg-amber-400/20 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-amber-300">
                          {gift.maxMultiplier}x
                        </span>
                      )}
                      <span className="text-3xl sm:text-4xl">{gift.emoji}</span>
                      <span className="mt-1.5 font-display text-sm font-bold text-white">
                        {gift.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{gift.urduTag}</span>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-400/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-300 tabular-nums">
                        <Coins className="h-3 w-3" />
                        {formatCompactCoins(gift.coins)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {coinWarning && (
                <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-200">
                  {coinWarning}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <UserProfilePreviewModal
        target={previewProfile}
        onClose={() => setPreviewProfile(null)}
        onSendGift={(recipientName) => {
          setGiftRecipient(recipientName);
          setCoinWarning('');
          setShowGiftPanel(true);
        }}
      />
    </div>
  );
}
