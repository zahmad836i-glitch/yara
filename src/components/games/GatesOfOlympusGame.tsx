import { AnimatePresence, motion } from 'motion/react';
import { Coins, Crown, Sparkles, Trophy, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GatesOfOlympusGameProps {
  coins: number;
  userName: string;
  isRedUser?: boolean;
  onBalanceDelta: (delta: number) => void;
  onGamePlayed: () => void;
}

interface OlympusSymbol {
  id: string;
  emoji: string;
  label: string;
  weight: number;
  baseMult: number;
}

const SYMBOLS: OlympusSymbol[] = [
  { id: 'gem-blue', emoji: '🔷', label: 'Sapphire', weight: 15, baseMult: 1.0 },
  { id: 'gem-green', emoji: '💚', label: 'Emerald', weight: 15, baseMult: 1.3 },
  { id: 'gem-red', emoji: '♦️', label: 'Ruby', weight: 14, baseMult: 1.6 },
  { id: 'chalice', emoji: '🏆', label: 'Chalice', weight: 13, baseMult: 2.2 },
  { id: 'ring', emoji: '💍', label: 'Ring', weight: 12, baseMult: 3.0 },
  { id: 'hourglass', emoji: '⏳', label: 'Hourglass', weight: 11, baseMult: 4.0 },
  { id: 'crown', emoji: '👑', label: 'Zeus Crown', weight: 10, baseMult: 5.5 },
  { id: 'bolt', emoji: '⚡', label: 'Olympus Bolt', weight: 10, baseMult: 8.0 },
];

const BASE_BET_CHIPS = [
  { label: '5K', value: 5_000 },
  { label: '50K', value: 50_000 },
  { label: '200K', value: 200_000 },
  { label: '1M', value: 1_000_000 },
];

const VIP_15M_BET_CHIP = { label: '15M', value: 15_000_000 };

function pickWeightedSymbol(): OlympusSymbol {
  const total = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);
  let r = Math.random() * total;
  for (const sym of SYMBOLS) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return SYMBOLS[0];
}

function generateBoard(): OlympusSymbol[] {
  return Array.from({ length: 20 }, () => pickWeightedSymbol());
}

export function GatesOfOlympusGame({
  coins,
  userName,
  isRedUser = false,
  onBalanceDelta,
  onGamePlayed,
}: GatesOfOlympusGameProps) {
  const [bet, setBet] = useState(5_000);
  const [board, setBoard] = useState<OlympusSymbol[]>(() => generateBoard());
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [zeusMultiplier, setZeusMultiplier] = useState<number>(1);
  const [winningIds, setWinningIds] = useState<string[]>([]);
  const [todayWin, setTodayWin] = useState(0);
  const [activeBetShown, setActiveBetShown] = useState<number | null>(null);
  const [winPopup, setWinPopup] = useState<{
    name: string;
    prize: number;
    zeusMult: number;
    matchedLabel: string;
  } | null>(null);

  const coinsRef = useRef(coins);
  const betRef = useRef(bet);
  const spinningRef = useRef(spinning);
  const userNameRef = useRef(userName);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    betRef.current = bet;
  }, [bet]);

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  const triggerSpin = () => {
    if (spinningRef.current) return;
    const currentBet = betRef.current;
    if (!Number.isFinite(currentBet) || currentBet <= 0 || coinsRef.current < currentBet) {
      setAutoSpin(false);
      return;
    }

    onBalanceDelta(-currentBet);
    onGamePlayed();
    setActiveBetShown(currentBet);
    setSpinning(true);
    spinningRef.current = true;
    setWinPopup(null);
    setWinningIds([]);

    let ticks = 0;
    const rollInterval = window.setInterval(() => {
      ticks += 1;
      setBoard(generateBoard());

      if (ticks >= 7) {
        window.clearInterval(rollInterval);
        const finalBoard = generateBoard();
        setBoard(finalBoard);

        const counts = new Map<string, number>();
        for (const item of finalBoard) {
          counts.set(item.id, (counts.get(item.id) || 0) + 1);
        }

        const matchedSymbols = SYMBOLS.filter((s) => (counts.get(s.id) || 0) >= 6);

        if (matchedSymbols.length > 0) {
          const orbRoll = Math.random();
          const lightningOrb =
            orbRoll < 0.72 ? 1 : orbRoll < 0.9 ? 2 : orbRoll < 0.97 ? 3 : orbRoll < 0.995 ? 5 : 10;
          setZeusMultiplier(lightningOrb);

          let totalMult = 0;
          for (const sym of matchedSymbols) {
            const count = counts.get(sym.id) || 6;
            totalMult += sym.baseMult * (1 + (count - 6) * 0.25);
          }
          const finalPrize = Math.floor(currentBet * totalMult * lightningOrb);
          onBalanceDelta(finalPrize);
          setTodayWin((prev) => prev + finalPrize);
          setWinningIds(matchedSymbols.map((m) => m.id));
          setWinPopup({
            name: userNameRef.current,
            prize: finalPrize,
            zeusMult: lightningOrb,
            matchedLabel: matchedSymbols.map((m) => `${m.emoji} ${m.label}`).join(' · '),
          });
        } else {
          setZeusMultiplier(1);
        }

        setSpinning(false);
        spinningRef.current = false;
      }
    }, 95);
  };

  useEffect(() => {
    if (!autoSpin || spinning) return;
    const id = window.setTimeout(() => {
      triggerSpin();
    }, 1400);
    return () => window.clearTimeout(id);
  }, [autoSpin, spinning]);

  return (
    <div className="space-y-3.5">
      {/* Olympus Temple Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-b from-[#2B175A] via-[#1B103D] to-[#12092B] p-3.5 shadow-xl">
        {/* Zeus Top Banner */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-amber-500/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#1A0D36] shadow">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-xs font-extrabold tracking-wide text-amber-200">
                GATES OF OLYMPUS
              </h3>
              <p className="text-[10px] text-purple-200">
                Up to {isRedUser ? '15M' : '1M'} · 6+ matching win
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-amber-300/40 bg-[#160B33] px-2.5 py-1 font-mono text-xs font-extrabold text-amber-300 tabular-nums">
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>{zeusMultiplier}x</span>
          </div>
        </div>

        {/* 5x4 Olympus Reel Grid */}
        <div className="grid grid-cols-5 gap-1.5 rounded-2xl border border-amber-300/20 bg-[#120A29] p-2">
          {board.map((sym, idx) => {
            const isWin = winningIds.includes(sym.id);
            return (
              <motion.div
                key={`${idx}-${sym.id}`}
                animate={
                  spinning
                    ? { y: [-3, 3, 0], opacity: [0.7, 1] }
                    : isWin
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                }
                transition={{ duration: 0.18 }}
                className={`flex aspect-square items-center justify-center rounded-xl border text-2xl transition-colors ${
                  isWin
                    ? 'border-amber-300 bg-amber-400/25 shadow-md shadow-amber-400/25'
                    : 'border-white/8 bg-[#1E1442]'
                }`}
              >
                <span>{sym.emoji}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Active Spin Bet Row (only shown once a bet is placed) */}
        {activeBetShown !== null && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-black/35 px-3 py-1.5 text-xs">
            <span className={`font-bold ${isRedUser ? 'text-red-400' : 'text-white'}`}>
              {userName}
            </span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              Bet: {activeBetShown.toLocaleString()} Coins
            </span>
          </div>
        )}

        {/* Center Winner Overlay */}
        <AnimatePresence>
          {winPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#180C38]/90 p-4 text-center backdrop-blur-md"
            >
              <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#1A0D36] shadow-lg">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-bold text-amber-200">
                Zeus Lightning {winPopup.zeusMult}x · {winPopup.matchedLabel}
              </p>
              <h3
                className={`mt-1 font-display text-2xl font-extrabold ${
                  isRedUser ? 'text-red-500' : 'text-white'
                }`}
              >
                {winPopup.name}
              </h3>
              <p className="mt-1 font-mono text-base font-extrabold text-amber-300 tabular-nums">
                +{winPopup.prize.toLocaleString()} Coins
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet Selector (5K to 1M, plus 15M for special account) */}
      <div className={`grid gap-2 ${isRedUser ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {(isRedUser ? [...BASE_BET_CHIPS, VIP_15M_BET_CHIP] : BASE_BET_CHIPS).map((chip) => (
          <button
            key={chip.label}
            type="button"
            disabled={spinning}
            onClick={() => setBet(chip.value)}
            className={`min-h-[40px] rounded-xl font-mono text-xs font-bold tabular-nums transition-transform active:scale-95 ${
              bet === chip.value
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F0A1E] shadow-md shadow-amber-500/30'
                : 'border border-white/10 bg-[#17102E] text-slate-200 hover:border-amber-400/40'
            } disabled:opacity-60`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Spin & Auto Controls */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-[#17102E] px-3 py-2">
          <p className="text-[10px] text-slate-400">Mine</p>
          <p className="flex items-center gap-1 truncate font-mono text-xs font-bold text-amber-300 tabular-nums">
            <Coins className="h-3 w-3 shrink-0" />
            {coins.toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          disabled={spinning || bet <= 0 || coins < bet}
          onClick={triggerSpin}
          className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 text-xs font-extrabold text-white shadow-lg shadow-pink-500/25 transition-transform active:scale-95 disabled:opacity-60"
        >
          <Zap className="h-4 w-4 text-amber-300" />
          <span>{spinning ? 'Spinning...' : 'Spin'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAutoSpin((prev) => !prev)}
          className={`flex min-h-[46px] flex-col items-center justify-center rounded-2xl text-xs font-bold transition-colors ${
            autoSpin
              ? 'bg-emerald-500 text-white'
              : 'border border-white/10 bg-[#17102E] text-slate-200 hover:border-pink-400/40'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {autoSpin ? 'Auto On' : 'Auto'}
          </span>
          <span className="font-mono text-[10px] opacity-80 tabular-nums">
            Win: {todayWin.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}
