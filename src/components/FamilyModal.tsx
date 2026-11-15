import { AnimatePresence, motion } from 'motion/react';
import {
  Crown,
  Flame,
  LogOut,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { FamilyGroup, FamilyNameColor, UserProfile } from '../types';
import {
  formatMillionLabel,
  getFamilyBadgeClass,
  getFamilyNameColorClass,
  getNameColorClass,
} from '../utils/vip';
import { AvatarBadge } from './AvatarBadge';

interface FamilyModalProps {
  isOpen: boolean;
  user: UserProfile;
  families: FamilyGroup[];
  onClose: () => void;
  onJoinFamily: (familyId: string) => { ok: boolean; message: string };
  onLeaveFamily: () => { ok: boolean; message: string };
  onCreateFamily: (payload: {
    name: string;
    tag: string;
    slogan: string;
    nameColor: FamilyNameColor;
  }) => { ok: boolean; message: string };
}

type FamilyTab = 'my' | 'all' | 'create';

export function FamilyModal({
  isOpen,
  user,
  families,
  onClose,
  onJoinFamily,
  onLeaveFamily,
  onCreateFamily,
}: FamilyModalProps) {
  const isOfficialOwner = user.uid === '100001';
  const myFamily = useMemo(
    () =>
      families.find(
        (f) => f.id === user.familyId || f.members.some((m) => m.uid === user.uid)
      ) || null,
    [families, user.familyId, user.uid]
  );

  const [tab, setTab] = useState<FamilyTab>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [sloganInput, setSloganInput] = useState('');
  const [colorInput, setColorInput] = useState<FamilyNameColor>('pink');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const filteredFamilies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return families;
    return families.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.tag.toLowerCase().includes(q) ||
        f.slogan.toLowerCase().includes(q)
    );
  }, [families, searchQuery]);

  const handleJoin = (familyId: string) => {
    const res = onJoinFamily(familyId);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setTab('my');
    }
  };

  const handleLeave = () => {
    const res = onLeaveFamily();
    setFeedback({ ok: res.ok, text: res.message });
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onCreateFamily({
      name: nameInput.trim(),
      tag: tagInput.trim().toUpperCase(),
      slogan: sloganInput.trim(),
      nameColor: colorInput,
    });
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setNameInput('');
      setTagInput('');
      setSloganInput('');
      setColorInput('pink');
      setTab('my');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:pb-4"
          >
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-tr from-red-600/30 via-[#7C3AED]/40 to-[#EC4899]/40 text-red-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Zariya Family</h2>
                  <p className="text-xs text-slate-400">
                    {myFamily ? (
                      <>
                        Active Family:{' '}
                        <span
                          className={`font-bold ${getFamilyNameColorClass(
                            myFamily.nameColor,
                            myFamily.name
                          )}`}
                        >
                          {myFamily.name}
                        </span>
                      </>
                    ) : (
                      'Join ya apni new Family banayein'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close family modal"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setTab('my');
                  setFeedback(null);
                }}
                className={`min-h-[38px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
                  tab === 'my'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                    : 'border border-white/10 bg-[#140E28] text-slate-300 hover:text-white'
                }`}
              >
                My Family
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('all');
                  setFeedback(null);
                }}
                className={`min-h-[38px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
                  tab === 'all'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                    : 'border border-white/10 bg-[#140E28] text-slate-300 hover:text-white'
                }`}
              >
                All Families ({families.length})
              </button>
              {!isOfficialOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setTab('create');
                    setFeedback(null);
                  }}
                  className={`min-h-[38px] flex-1 rounded-xl px-3 text-xs font-bold transition-colors ${
                    tab === 'create'
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                      : 'border border-white/10 bg-[#140E28] text-slate-300 hover:text-white'
                  }`}
                >
                  + Create
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {feedback && (
                <div
                  className={`rounded-2xl border px-3.5 py-2.5 text-xs font-semibold ${
                    feedback.ok
                      ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
                      : 'border-rose-400/35 bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {tab === 'my' && (
                <>
                  {myFamily ? (
                    <div className="space-y-4">
                      {/* Family Hero Card */}
                      <div
                        className={`rounded-3xl border p-4 ${
                          myFamily.nameColor === 'red' || myFamily.name.toLowerCase() === 'jutt'
                            ? 'border-red-500/45 bg-gradient-to-br from-red-500/15 via-[#181030] to-[#120B24]'
                            : 'border-white/12 bg-gradient-to-br from-violet-500/15 via-[#181030] to-[#120B24]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg ${
                                myFamily.nameColor === 'red' ||
                                myFamily.name.toLowerCase() === 'jutt'
                                  ? 'border-red-500/50 bg-red-500/20 text-red-500'
                                  : 'border-pink-400/40 bg-pink-500/20 text-pink-300'
                              }`}
                            >
                              <Crown className="h-7 w-7" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`font-display text-2xl font-extrabold ${getFamilyNameColorClass(
                                    myFamily.nameColor,
                                    myFamily.name
                                  )}`}
                                >
                                  {myFamily.name}
                                </h3>
                                <span
                                  className={`rounded-lg border px-2 py-0.5 font-mono text-[11px] font-extrabold ${getFamilyBadgeClass(
                                    myFamily.nameColor,
                                    myFamily.name
                                  )}`}
                                >
                                  {myFamily.tag}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-300">{myFamily.slogan}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl border border-white/8 bg-black/25 p-2.5 text-center">
                            <p className="font-mono text-sm font-bold text-white tabular-nums">
                              Lv.{myFamily.level}
                            </p>
                            <p className="text-[10px] text-slate-400">Family Level</p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-black/25 p-2.5 text-center">
                            <p className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                              {formatMillionLabel(myFamily.points)}
                            </p>
                            <p className="text-[10px] text-slate-400">Honor Points</p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-black/25 p-2.5 text-center">
                            <p className="font-mono text-sm font-bold text-white tabular-nums">
                              {myFamily.members.length}
                            </p>
                            <p className="text-[10px] text-slate-400">Members</p>
                          </div>
                        </div>
                      </div>

                      {/* Members List */}
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h4 className="flex items-center gap-1.5 font-display text-sm font-bold text-white">
                            <Users className="h-4 w-4 text-pink-400" />
                            <span>Family Members ({myFamily.members.length})</span>
                          </h4>
                          {user.uid !== myFamily.leaderUid && (
                            <button
                              type="button"
                              onClick={handleLeave}
                              className="inline-flex min-h-[32px] items-center gap-1 rounded-xl border border-rose-400/30 bg-rose-500/15 px-2.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/25"
                            >
                              <LogOut className="h-3 w-3" />
                              <span>Leave</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {myFamily.members.map((member) => {
                            const memberNameColor = getNameColorClass(
                              member.vipLevel ?? 0,
                              member.uid,
                              'text-white'
                            );
                            return (
                              <div
                                key={member.uid}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#140E28] px-3.5 py-2.5"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <AvatarBadge
                                    name={member.name}
                                    avatarId={member.avatar}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className={`truncate text-sm font-bold ${memberNameColor}`}>
                                        {member.name}
                                      </p>
                                      <span
                                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getFamilyBadgeClass(
                                          myFamily.nameColor,
                                          myFamily.name
                                        )}`}
                                      >
                                        {myFamily.name}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                      {member.role}
                                      {member.uid !== '100001' ? ` · UID ${member.uid}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-semibold text-amber-300 tabular-nums">
                                  {formatMillionLabel(member.contribution ?? 0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-[#140E28] p-6 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7C3AED]/30 to-[#EC4899]/30 text-pink-300">
                        <Shield className="h-7 w-7" />
                      </div>
                      <h3 className="font-display text-base font-bold text-white">
                        Abhi Koi Family Join Nahi Ki
                      </h3>
                      <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400">
                        All Families mein ja kar{' '}
                        <span className="font-bold text-red-500">Jutt</span> ya koi bhi family join
                        karein, ya apni new family create karein.
                      </p>
                      <div className="mt-4 flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTab('all')}
                          className="min-h-[42px] flex-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 text-xs font-bold text-white"
                        >
                          Browse Families
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab('create')}
                          className="min-h-[42px] flex-1 rounded-xl border border-white/15 bg-white/8 px-4 text-xs font-bold text-white hover:bg-white/15"
                        >
                          Create Family
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === 'all' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search family name or tag..."
                      className="min-h-[42px] w-full rounded-xl border border-white/10 bg-[#120C24] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2.5">
                    {filteredFamilies.map((family) => {
                      const isMember =
                        myFamily?.id === family.id ||
                        family.members.some((m) => m.uid === user.uid);
                      const isRedFamily =
                        family.nameColor === 'red' || family.name.toLowerCase() === 'jutt';
                      return (
                        <div
                          key={family.id}
                          className={`rounded-2xl border p-4 ${
                            isRedFamily
                              ? 'border-red-500/45 bg-gradient-to-r from-red-500/12 via-[#16102B] to-[#140E28]'
                              : 'border-white/10 bg-[#140E28]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4
                                  className={`font-display text-lg font-extrabold ${getFamilyNameColorClass(
                                    family.nameColor,
                                    family.name
                                  )}`}
                                >
                                  {family.name}
                                </h4>
                                <span
                                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-extrabold ${getFamilyBadgeClass(
                                    family.nameColor,
                                    family.name
                                  )}`}
                                >
                                  {family.tag}
                                </span>
                                {family.leaderUid === '100001' && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-red-500/35 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                    <Flame className="h-3 w-3" />
                                    <span>Official</span>
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-slate-300">{family.slogan}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                <span>Lv.{family.level}</span>
                                <span>·</span>
                                <span>{family.members.length} Members</span>
                                <span>·</span>
                                <span className="font-mono text-amber-300">
                                  {formatMillionLabel(family.points)} Pts
                                </span>
                              </div>
                            </div>

                            {isMember ? (
                              <span className="shrink-0 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                                Joined
                              </span>
                            ) : isOfficialOwner ? null : (
                              <button
                                type="button"
                                onClick={() => handleJoin(family.id)}
                                className="min-h-[36px] shrink-0 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3.5 text-xs font-bold text-white transition-transform active:scale-95 hover:brightness-110"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'create' && !isOfficialOwner && (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="family-name-input"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Family Name
                    </label>
                    <input
                      id="family-name-input"
                      type="text"
                      maxLength={20}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Royal Tigers"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="family-tag-input"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Family Badge Tag (2–5 letters)
                    </label>
                    <input
                      id="family-tag-input"
                      type="text"
                      maxLength={5}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value.toUpperCase())}
                      placeholder="e.g. TIGER"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 font-mono text-sm uppercase text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="family-slogan-input"
                      className="mb-1.5 block text-xs font-medium text-slate-300"
                    >
                      Family Slogan
                    </label>
                    <input
                      id="family-slogan-input"
                      type="text"
                      maxLength={60}
                      value={sloganInput}
                      onChange={(e) => setSloganInput(e.target.value)}
                      placeholder="Ek saath, ek awaaz!"
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#120C24] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-medium text-slate-300">
                      Family Name Color
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'pink', label: 'Neon Pink', cls: 'text-pink-300' },
                          { id: 'gold', label: 'Royal Gold', cls: 'text-amber-400' },
                          { id: 'red', label: 'Crimson Red', cls: 'text-red-500' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setColorInput(opt.id)}
                          className={`min-h-[42px] rounded-xl border px-3 text-xs font-bold transition-colors ${
                            colorInput === opt.id
                              ? 'border-pink-400 bg-pink-500/20'
                              : 'border-white/10 bg-[#140E28]'
                          } ${opt.cls}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Family</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
