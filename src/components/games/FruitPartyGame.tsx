import { AnimatePresence, motion } from 'motion/react';
import { Coins, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FruitPartyGameProps {
  coins: number;
  userName: string;
  isRedUser?: boolean;
  onBalanceDelta: (delta: number) => void;
  onGamePlayed: () => void;
}

interface FruitSlot {
  id: string;
  emoji: string;
  name: string;
  mult: number;
  glow: string;
}

const FRUIT_RING: FruitSlot[] = [
  { id: 'lemon', emoji: '🍋', name: 'Lemon', mult: 5, glow: 'from-amber-400/25 to-yellow-500/10' },
  { id: 'raspberry', emoji: '🍇', name: 'Raspberry', mult: 5, glow: 'from-rose-500/25 to-pink-500/10' },
  { id: 'kiwi', emoji: '🥝', name: 'Kiwi', mult: 5, glow: 'from-lime-400/25 to-emerald-500/10' },
  { id: 'plum', emoji: '🍑', name: 'Plum', mult: 5, glow: 'from-purple-500/25 to-fuchsia-500/10' },
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry', mult: 10, glow: 'from-rose-500/25 to-red-500/10' },
  { id: 'mango', emoji: '🥭', name: 'Mango', mult: 10, glow: 'from-orange-400/25 to-amber-500/10' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon', mult: 20, glow: 'from-emerald-400/25 to-rose-500/10' },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', mult: 40, glow: 'from-pink-500/35 to-purple-600/20' },
];

const GRID_CELLS: Array<number | null> = [0, 1, 2, 7, null, 3, 6, 5, 4];

const BASE_CHIPS = [
  { label: '5K', value: 5_000, color: 'from-pink-500 to-rose-500' },
  { label: '50K', value: 50_000, color: 'from-orange-500 to-amber-500' },
  { label: '200K', value: 200_000, color: 'from-violet-500 to-fuchsia-500' },
  { label: '1M', value: 1_000_000, color: 'from-sky-500 to-indigo-500' },
];

const VIP_15M_CHIP = {
  label: '15M',
  value: 15_000_000,
  color: 'from-rose-500 to-amber-500',
};

function formatCompactChip(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

export function FruitPartyGame({
  coins,
  userName,
  isRedUser = false,
  onBalanceDelta,
  onGamePlayed,
}: FruitPartyGameProps) {
  const [selectedChip, setSelectedChip] = useState(5_000);
  const [betsByFruit, setBetsByFruit] = useState<Record<string, number>>({});
  const [autoMode, setAutoMode] = useState(false);
  const [phase, setPhase] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [countdown, setCountdown] = useState(10);
  const [activeRingIdx, setActiveRingIdx] = useState(1);
  const [roundNum, setRoundNum] = useState(853);
  const [jackpot, setJackpot] = useState(445_069_865);
  const [todayWin, setTodayWin] = useState(0);
  const [resultHistory, setResultHistory] = useState<string[]>([
    '🍇',
    '🍇',
    '🍑',
    '🍓',
    '🥝',
    '🍇',
    '🍒',
    '🍓',
  ]);
  const [roundOutcome, setRoundOutcome] = useState<{
    winnerName: string | null;
    fruitEmoji: string;
    fruitName: string;
    mult: number;
    prize: number;
    hadBet: boolean;
  } | null>(null);

  const betsRef = useRef<Record<string, number>>({});
  const lastBetsRef = useRef<Record<string, number>>({ lemon: 5_000 });
  const coinsRef = useRef(coins);
  const userNameRef = useRef(userName);
  const autoRef = useRef(autoMode);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    autoRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    let timerId: number | null = null;

    if (phase === 'betting') {
      setRoundOutcome(null);

      if (autoRef.current) {
        const template = lastBetsRef.current;
        const totalAutoCost = Object.values(template).reduce((s, v) => s + v, 0);
        if (totalAutoCost > 0 && coinsRef.current >= totalAutoCost) {
          onBalanceDelta(-totalAutoCost);
          onGamePlayed();
          betsRef.current = { ...template };
          setBetsByFruit({ ...template });
        }
      }

      let sec = 10;
      setCountdown(sec);
      timerId = window.setInterval(() => {
        setJackpot((prev) => prev + Math.floor(Math.random() * 1450) + 320);
        sec -= 1;
        if (sec > 0) {
          setCountdown(sec);
        } else {
          if (timerId) window.clearInterval(timerId);
          setPhase('spinning');
        }
      }, 1000);
    } else if (phase === 'spinning') {
      const roll = Math.random();
      const targetRingIdx =
        roll < 0.21
          ? 0
          : roll < 0.42
            ? 1
            : roll < 0.63
              ? 2
              : roll < 0.8
                ? 3
                : roll < 0.88
                  ? 4
                  : roll < 0.94
                    ? 5
                    : roll < 0.98
                      ? 6
                      : 7;

      const totalSteps = 18 + targetRingIdx;
      let step = 0;

      const tick = () => {
        step += 1;
        setActiveRingIdx(step % FRUIT_RING.length);

        if (step < totalSteps) {
          const delay = 55 + Math.floor((step / totalSteps) * 130);
          timerId = window.setTimeout(tick, delay);
        } else {
          const winFruit = FRUIT_RING[targetRingIdx];
          const myBetOnWin = betsRef.current[winFruit.id] || 0;
          const totalPlaced = Object.values(betsRef.current).reduce((s, v) => s + v, 0);

          setResultHistory((prev) => [winFruit.emoji, ...prev].slice(0, 8));

          if (myBetOnWin > 0) {
            const prize = myBetOnWin * winFruit.mult;
            onBalanceDelta(prize);
            setTodayWin((prev) => prev + prize);
            setRoundOutcome({
              winnerName: userNameRef.current,
              fruitEmoji: winFruit.emoji,
              fruitName: winFruit.name,
              mult: winFruit.mult,
              prize,
              hadBet: true,
            });
          } else {
            setRoundOutcome({
              winnerName: null,
              fruitEmoji: winFruit.emoji,
              fruitName: winFruit.name,
              mult: winFruit.mult,
              prize: 0,
              hadBet: totalPlaced > 0,
            });
          }

          betsRef.current = {};
          setBetsByFruit({});
          setPhase('result');
        }
      };

      tick();
    } else if (phase === 'result') {
      timerId = window.setTimeout(() => {
        setRoundNum((prev) => prev + 1);
        setPhase('betting');
      }, 3200);
    }

    return () => {
      if (timerId) {
        window.clearInterval(timerId);
        window.clearTimeout(timerId);
      }
    };
  }, [phase]);

  const chips = isRedUser ? [...BASE_CHIPS, VIP_15M_CHIP] : BASE_CHIPS;
  const totalRoundBet = Object.values(betsByFruit).reduce((s, v) => s + v, 0);

  const handlePlaceChip = (fruitId: string) => {
    if (phase !== 'betting') return;
    if (selectedChip <= 0 || !Number.isFinite(selectedChip)) return;
    const currentTotal = Object.values(betsRef.current).reduce((s, v) => s + v, 0);
    if (coinsRef.current < selectedChip) return;

    onBalanceDelta(-selectedChip);
    if (currentTotal === 0) {
      onGamePlayed();
    }

    const updated = {
      ...betsRef.current,
      [fruitId]: (betsRef.current[fruitId] || 0) + selectedChip,
    };
    betsRef.current = updated;
    lastBetsRef.current = updated;
    setBetsByFruit(updated);
  };

  return (
    <div className="space-y-3">
      {/* Purple Arcade Cabinet */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-violet-400/50 bg-gradient-to-b from-[#6D4CE8] via-[#4C32B8] to-[#2F1C7C] p-3.5 shadow-2xl">
        {/* Round & Bet Range Header */}
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-violet-100">
          <span className="font-mono tabular-nums">Round:{roundNum}</span>
          <span className="font-mono text-amber-300 tabular-nums">
            Up to {isRedUser ? '15M' : '1M'} · No Limit ({totalRoundBet.toLocaleString()} placed)
          </span>
        </div>

        <div className="mb-2.5 rounded-2xl border border-amber-300/60 bg-gradient-to-b from-[#3A166C] to-[#220B47] px-2.5 py-1.5 text-center shadow-inner sm:mb-3 sm:px-3 sm:py-2">
          <p className="font-display text-xs font-black tracking-wider text-amber-300 drop-shadow sm:text-sm">
            JACKPOT
          </p>
          <p className="font-mono text-xl font-black tracking-tight text-yellow-300 tabular-nums sm:text-2xl">
            {jackpot.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            {['+2', '+2', '+2'].map((tag, i) => (
              <span
                key={i}
                className="rounded-lg border border-amber-300/50 bg-gradient-to-b from-amber-100 to-amber-300 px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#4B1A7B] shadow sm:px-2.5 sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 3x3 Cabinet Grid with Center LED Countdown */}
        <div className="relative rounded-2xl border border-indigo-300/30 bg-[#1B1046] p-2 sm:p-2.5">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {GRID_CELLS.map((ringIdx, cellIdx) => {
              if (ringIdx === null) {
                return (
                  <div
                    key={`center-${cellIdx}`}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-rose-500/80 bg-[#120416] p-2 shadow-[inset_0_0_16px_rgba(244,63,94,0.45)]"
                  >
                    <span className="font-mono text-3xl font-black tracking-widest text-yellow-300 tabular-nums">
                      {phase === 'betting'
                        ? String(countdown).padStart(2, '0')
                        : phase === 'spinning'
                          ? 'GO'
                          : roundOutcome?.fruitEmoji || 'WIN'}
                    </span>
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300">
                      {phase === 'betting' ? 'SEC' : phase === 'spinning' ? 'SPIN' : 'RESULT'}
                    </span>
                  </div>
                );
              }

              const fruit = FRUIT_RING[ringIdx];
              const isHighlighted = activeRingIdx === ringIdx;
              const chipTotal = betsByFruit[fruit.id] || 0;

              return (
                <button
                  key={fruit.id}
                  type="button"
                  onClick={() => handlePlaceChip(fruit.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border bg-gradient-to-b ${fruit.glow} p-1.5 transition-all active:scale-95 ${
                    isHighlighted
                      ? 'border-sky-300 bg-sky-400/25 shadow-[0_0_16px_rgba(56,189,248,0.65)] ring-2 ring-sky-300/80'
                      : chipTotal > 0
                        ? 'border-amber-300/80 bg-indigo-900/80'
                        : 'border-indigo-400/25 bg-[#24165E] hover:border-pink-300/60'
                  }`}
                >
                  <span className="text-3xl leading-none drop-shadow">{fruit.emoji}</span>
                  <span className="mt-1 font-mono text-[10px] font-bold text-slate-100 tabular-nums">
                    {fruit.mult} times
                  </span>

                  {chipTotal > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full border border-white/60 bg-gradient-to-r from-rose-500 to-amber-500 px-1.5 py-0.5 font-mono text-[9px] font-black text-white shadow">
                      {formatCompactChip(chipTotal)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Center Result / Winner Overlay (Only real bettors win) */}
          <AnimatePresence>
            {phase === 'result' && roundOutcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#150834]/92 p-4 text-center backdrop-blur-md"
              >
                <div className="mb-1 text-4xl">{roundOutcome.fruitEmoji}</div>
                <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>
                    {roundOutcome.fruitName} ({roundOutcome.mult}x)
                  </span>
                </div>

                {roundOutcome.winnerName ? (
                  <>
                    <h3
                      className={`mt-1 font-display text-2xl font-extrabold ${
                        isRedUser ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {roundOutcome.winnerName}
                    </h3>
                    <p className="mt-1 font-mono text-sm font-bold text-amber-300 tabular-nums">
                      +{roundOutcome.prize.toLocaleString()} Coins
                    </p>
                  </>
                ) : (
                  <p className="mt-1.5 text-xs font-medium text-slate-300">
                    {roundOutcome.hadBet
                      ? 'No winning bet on this fruit'
                      : 'No bets placed this round'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Player Bet Summary (only shown when bet placed) */}
        {totalRoundBet > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-400/30 bg-[#1B1046] px-3 py-1.5 text-xs">
            <span className={`font-bold ${isRedUser ? 'text-red-400' : 'text-white'}`}>
              {userName}
            </span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              Bet: {totalRoundBet.toLocaleString()} Coins
            </span>
          </div>
        )}

        {/* Result History Strip */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-[#1E124A] px-2.5 py-1.5">
          <span className="text-[11px] font-bold text-violet-200">Result</span>
          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
            {resultHistory.map((emoji, idx) => (
              <div key={idx} className="relative flex shrink-0 flex-col items-center">
                <span className="text-base leading-none">{emoji}</span>
                {idx === 0 && (
                  <span className="mt-0.5 rounded bg-sky-400 px-1 text-[7px] font-black text-slate-950">
                    NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arcade Chip Buttons (5K to 1M, plus 15M for special account) */}
        <div className={`mt-2.5 grid gap-2 ${isRedUser ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {chips.map((chip) => {
            const active = selectedChip === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSelectedChip(chip.value)}
                className={`flex min-h-[42px] items-center justify-center rounded-2xl bg-gradient-to-b ${chip.color} px-1.5 font-mono text-xs font-black text-white shadow-md transition-transform active:scale-95 ${
                  active ? 'scale-[1.03] ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom HUD: Mine | Today Win | Auto */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-[#1B123A] px-3 py-2">
          <p className="text-[10px] text-slate-400">Mine</p>
          <p className="flex items-center gap-1 truncate font-mono text-xs font-bold text-amber-300 tabular-nums">
            <Coins className="h-3.5 w-3.5 shrink-0" />
            {coins.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#1B123A] px-3 py-2">
          <p className="text-[10px] text-slate-400">Today Win</p>
          <p className="truncate font-mono text-xs font-bold text-emerald-300 tabular-nums">
            {todayWin.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAutoMode((prev) => !prev)}
          className={`flex items-center justify-center gap-1.5 rounded-2xl text-xs font-bold transition-colors ${
            autoMode
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'border border-white/15 bg-[#23184A] text-slate-100 hover:border-pink-400/50'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{autoMode ? 'Auto On' : 'Auto'}</span>
        </button>
      </div>
    </div>
  );
}
