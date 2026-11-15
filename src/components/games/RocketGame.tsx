import { AnimatePresence, motion } from 'motion/react';
import { Coins, Minus, Plus, Rocket, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RocketGameProps {
  coins: number;
  userName: string;
  isRedUser?: boolean;
  onBalanceDelta: (delta: number) => void;
  onGamePlayed: () => void;
}

const ROCKET_HIS_KEY = 'zariya_rocket_history_v1';
const DEFAULT_ROCKET_HISTORY = [1.44, 3.28, 1.29, 1.89, 5.03, 1.5];

function loadRocketHistory(): number[] {
  try {
    const raw = localStorage.getItem(ROCKET_HIS_KEY);
    if (!raw) return DEFAULT_ROCKET_HISTORY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n >= 1)
        .slice(0, 24);
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_ROCKET_HISTORY;
}

const BASE_FUEL_CHIPS = [
  { label: '5K', value: 5_000, color: 'from-blue-500 to-indigo-600' },
  { label: '50K', value: 50_000, color: 'from-purple-500 to-violet-600' },
  { label: '200K', value: 200_000, color: 'from-pink-500 to-rose-600' },
  { label: '1M', value: 1_000_000, color: 'from-fuchsia-500 to-purple-700' },
];

const VIP_15M_FUEL_CHIP = {
  label: '15M',
  value: 15_000_000,
  color: 'from-rose-500 to-amber-500',
};

interface LiveBetRow {
  name: string;
  amount: number;
  cashedMult?: number;
}

interface RoundResult {
  crashPoint: number;
  winnerName: string | null;
  prize: number;
  multiplier: number;
  hadBet: boolean;
}

export function RocketGame({
  coins,
  userName,
  isRedUser = false,
  onBalanceDelta,
  onGamePlayed,
}: RocketGameProps) {
  const [selectedChip, setSelectedChip] = useState(5_000);
  const [phase, setPhase] = useState<'betting' | 'flying' | 'result'>('betting');
  const [countdown, setCountdown] = useState(9);
  const [multiplier, setMultiplier] = useState(1.0);
  const [roundNum, setRoundNum] = useState(1762692);
  const [joinedBet, setJoinedBet] = useState(0);
  const [cashedOutMult, setCashedOutMult] = useState<number | null>(null);
  const [autoSpend, setAutoSpend] = useState(false);
  const [autoEscEnabled, setAutoEscEnabled] = useState(true);
  const [autoEscTarget, setAutoEscTarget] = useState(2.1);
  const [historyList, setHistoryList] = useState<number[]>(() => loadRocketHistory());
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [liveRows, setLiveRows] = useState<LiveBetRow[]>([]);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const joinedBetRef = useRef(0);
  const cashedOutRef = useRef<number | null>(null);
  const coinsRef = useRef(coins);
  const userNameRef = useRef(userName);
  const autoSpendRef = useRef(autoSpend);
  const selectedChipRef = useRef(selectedChip);
  const autoEscEnabledRef = useRef(autoEscEnabled);
  const autoEscTargetRef = useRef(autoEscTarget);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    autoSpendRef.current = autoSpend;
  }, [autoSpend]);

  useEffect(() => {
    selectedChipRef.current = selectedChip;
  }, [selectedChip]);

  useEffect(() => {
    autoEscEnabledRef.current = autoEscEnabled;
  }, [autoEscEnabled]);

  useEffect(() => {
    autoEscTargetRef.current = autoEscTarget;
  }, [autoEscTarget]);

  useEffect(() => {
    let timerId: number | null = null;

    if (phase === 'betting') {
      setMultiplier(1.0);
      setRoundResult(null);
      cashedOutRef.current = null;
      setCashedOutMult(null);
      joinedBetRef.current = 0;
      setJoinedBet(0);
      setLiveRows([]);

      if (
        autoSpendRef.current &&
        selectedChipRef.current > 0 &&
        coinsRef.current >= selectedChipRef.current
      ) {
        const amt = selectedChipRef.current;
        onBalanceDelta(-amt);
        onGamePlayed();
        joinedBetRef.current = amt;
        setJoinedBet(amt);
        setLiveRows([{ name: userNameRef.current, amount: amt }]);
      }

      let sec = 9;
      setCountdown(sec);
      timerId = window.setInterval(() => {
        sec -= 1;
        if (sec > 0) {
          setCountdown(sec);
        } else {
          if (timerId) window.clearInterval(timerId);
          setPhase('flying');
        }
      }, 1000);
    } else if (phase === 'flying') {
      const roll = Math.random();
      const crashPoint = Number(
        (roll < 0.25
          ? 1.08 + Math.random() * 0.42
          : roll < 0.72
            ? 1.5 + Math.random() * 1.65
            : roll < 0.94
              ? 3.15 + Math.random() * 4.5
              : 10 + Math.random() * 15
        ).toFixed(2)
      );

      let currentMult = 1.0;

      timerId = window.setInterval(() => {
        const stepped = Number((currentMult + 0.04 + currentMult * 0.015).toFixed(2));
        currentMult = Math.min(crashPoint, stepped);
        setMultiplier(currentMult);

        if (
          autoEscEnabledRef.current &&
          joinedBetRef.current > 0 &&
          !cashedOutRef.current &&
          currentMult >= autoEscTargetRef.current &&
          currentMult < crashPoint
        ) {
          const payout = Math.floor(joinedBetRef.current * currentMult);
          cashedOutRef.current = currentMult;
          setCashedOutMult(currentMult);
          onBalanceDelta(payout);
          setLiveRows((prev) =>
            prev.map((row) =>
              row.name === userNameRef.current ? { ...row, cashedMult: currentMult } : row
            )
          );
        }

        if (currentMult >= crashPoint) {
          if (timerId) window.clearInterval(timerId);

          setHistoryList((prev) => {
            const updated = [crashPoint, ...prev].slice(0, 24);
            try {
              localStorage.setItem(ROCKET_HIS_KEY, JSON.stringify(updated));
            } catch {
              // ignore storage errors
            }
            return updated;
          });

          const myBet = joinedBetRef.current;
          const myCashMult = cashedOutRef.current;

          if (myBet > 0 && myCashMult) {
            setRoundResult({
              crashPoint,
              winnerName: userNameRef.current,
              prize: Math.floor(myBet * myCashMult),
              multiplier: myCashMult,
              hadBet: true,
            });
          } else {
            setRoundResult({
              crashPoint,
              winnerName: null,
              prize: 0,
              multiplier: crashPoint,
              hadBet: myBet > 0,
            });
          }

          setPhase('result');
        }
      }, 80);
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

  const handleAddFuel = (chipValue: number) => {
    if (!Number.isFinite(chipValue) || chipValue <= 0) return;
    setSelectedChip(chipValue);
    if (phase !== 'betting') return;
    if (coinsRef.current < chipValue) return;

    onBalanceDelta(-chipValue);
    if (joinedBetRef.current === 0) {
      onGamePlayed();
    }
    const nextTotal = joinedBetRef.current + chipValue;
    joinedBetRef.current = nextTotal;
    setJoinedBet(nextTotal);
    setLiveRows([{ name: userNameRef.current, amount: nextTotal }]);
  };

  const handleCashOut = () => {
    if (phase !== 'flying' || joinedBetRef.current <= 0 || cashedOutRef.current) return;
    const cashMult = multiplier;
    const payout = Math.floor(joinedBetRef.current * cashMult);
    cashedOutRef.current = cashMult;
    setCashedOutMult(cashMult);
    onBalanceDelta(payout);
    setLiveRows((prev) =>
      prev.map((row) =>
        row.name === userNameRef.current ? { ...row, cashedMult: cashMult } : row
      )
    );
  };

  const fuelChips = isRedUser ? [...BASE_FUEL_CHIPS, VIP_15M_FUEL_CHIP] : BASE_FUEL_CHIPS;
  const rocketRisePct = Math.min(72, Math.max(0, (multiplier - 1) * 26));

  return (
    <div className="space-y-3">
      {/* Deep-Space Rocket Arena */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-[#0E1E2E] via-[#132539] to-[#0B1422] p-3.5 shadow-2xl">
        {/* Top Rocket Bar */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <div>
            <span className="font-display text-sm font-extrabold tracking-wide text-white">
              ROCKET
            </span>
            <p className="font-mono text-[10px] text-slate-400">
              Up to {isRedUser ? '15M' : '1M'} · No Limit
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 font-mono text-xs font-bold text-amber-300 tabular-nums">
              <Coins className="h-3.5 w-3.5" />
              <span>{coins.toLocaleString()}</span>
            </div>
            <p className="mt-0.5 font-mono text-[9px] text-slate-400 tabular-nums">
              round: {roundNum}
            </p>
          </div>
        </div>

        {/* Main Flight Stage */}
        <div className="relative h-56 overflow-hidden rounded-2xl border border-white/5 bg-[#0C1928]/80 p-3">
          {/* Left Live Player Feed (strictly real bettors only) */}
          <div className="relative z-10 w-36 space-y-1 text-[11px] sm:w-44">
            {liveRows.length === 0 ? (
              <p className="text-[11px] text-slate-500">No bets placed yet</p>
            ) : (
              liveRows.map((row, idx) => (
                <div
                  key={`${row.name}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-black/35 px-2 py-1"
                >
                  <span
                    className={`truncate font-semibold ${
                      isRedUser ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {row.name}
                  </span>
                  <span className="font-mono font-bold text-amber-300 tabular-nums">
                    {row.amount.toLocaleString()}
                    {row.cashedMult ? ` · ${row.cashedMult.toFixed(2)}x` : ''}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Right Y-Axis Scale */}
          <div className="pointer-events-none absolute bottom-10 right-2.5 top-3 flex flex-col justify-between font-mono text-[10px] text-slate-400 tabular-nums">
            <span>2.0x</span>
            <span>1.8x</span>
            <span>1.6x</span>
            <span>1.4x</span>
            <span>1.2x</span>
          </div>

          {/* Launchpad Planet Dome at Bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#EDE2B8] to-[#8C8469] opacity-85"
          />

          {/* Rocket & Digital Countdown */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center justify-end">
            <motion.div
              animate={
                phase === 'flying'
                  ? { y: -rocketRisePct, x: rocketRisePct * 0.45, rotate: 16 }
                  : { y: 0, x: 0, rotate: 0 }
              }
              transition={{ duration: 0.15 }}
              className="mb-1 flex flex-col items-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-cyan-300 text-[#0A1626] shadow-lg shadow-sky-400/40">
                <Rocket className="h-5 w-5" />
              </div>
              {phase === 'flying' && (
                <span className="mt-1 rounded-full bg-sky-500 px-2 py-0.5 font-mono text-[10px] font-extrabold text-white shadow">
                  {multiplier.toFixed(2)}x
                </span>
              )}
            </motion.div>

            {phase === 'betting' ? (
              <div className="text-center">
                <p className="font-mono text-3xl font-black italic text-amber-300 tabular-nums drop-shadow">
                  {String(countdown).padStart(2, '0')}s
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
                  count down
                </p>
              </div>
            ) : (
              <p
                className={`font-mono text-2xl font-black tabular-nums ${
                  phase === 'result' ? 'text-rose-400' : 'text-emerald-300'
                }`}
              >
                {multiplier.toFixed(2)}x
              </p>
            )}
          </div>

          {/* Center Result Overlay */}
          <AnimatePresence>
            {phase === 'result' && roundResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#091423]/90 p-4 text-center backdrop-blur-md"
              >
                <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-[#0F0A1E]">
                  <Trophy className="h-5 w-5" />
                </div>

                {roundResult.winnerName ? (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                      Winner
                    </span>
                    <h3
                      className={`mt-0.5 font-display text-2xl font-extrabold ${
                        isRedUser ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {roundResult.winnerName}
                    </h3>
                    <p className="mt-1 font-mono text-sm font-bold text-amber-300 tabular-nums">
                      +{roundResult.prize.toLocaleString()} Coins ({roundResult.multiplier.toFixed(2)}x)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-xl font-black text-rose-400 tabular-nums">
                      Crashed at {roundResult.crashPoint.toFixed(2)}x
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {roundResult.hadBet
                        ? 'Cashed out missed — better luck next round'
                        : 'No bets placed this round'}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Multipliers Strip */}
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 pt-2.5">
            <span className="shrink-0 font-mono text-slate-400">his:</span>
            {historyList.slice(0, 6).map((val, idx) => (
              <span
                key={`${idx}-${val}`}
                className={`relative shrink-0 rounded-full border px-2 py-0.5 font-mono font-bold tabular-nums ${
                  val >= 10
                    ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                    : val >= 3
                      ? 'border-violet-400/60 bg-violet-500/15 text-violet-300'
                      : 'border-sky-400/40 bg-sky-500/10 text-sky-300'
                }`}
              >
                {idx === 0 && (
                  <span className="absolute -right-1 -top-2 rounded bg-rose-500 px-1 text-[8px] font-black leading-tight text-white">
                    new
                  </span>
                )}
                {val.toFixed(2)}x
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAllHistory((prev) => !prev)}
            className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold transition-colors ${
              showAllHistory
                ? 'border-sky-400 bg-sky-500/25 text-white'
                : 'border-white/15 bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            ALL
          </button>
        </div>

        {showAllHistory && (
          <div className="mt-2 flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0A1421] p-2.5">
            {historyList.map((val, idx) => (
              <span
                key={`all-${idx}-${val}`}
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                  val >= 10
                    ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                    : val >= 3
                      ? 'border-violet-400/60 bg-violet-500/15 text-violet-300'
                      : 'border-sky-400/40 bg-sky-500/10 text-sky-300'
                }`}
              >
                {val.toFixed(2)}x
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fuel Bar + Canister Chips (5K to 1M, No Limit) */}
      <div className="rounded-3xl border border-slate-700/50 bg-[#14202E] p-3">
        <div className="mb-2.5 flex items-center justify-between rounded-xl border border-amber-400/30 bg-[#1B2A3C] px-3 py-1.5 text-xs">
          <span className="font-semibold text-slate-300">Fuel Bet (No Limit)</span>
          <span className="font-mono font-bold text-amber-300 tabular-nums">
            {joinedBet.toLocaleString()}
          </span>
        </div>

        <div className={`grid gap-1.5 ${isRedUser ? 'grid-cols-6' : 'grid-cols-5'}`}>
          {fuelChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              disabled={phase !== 'betting' || coins < chip.value}
              onClick={() => handleAddFuel(chip.value)}
              className={`flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-b ${chip.color} px-1 font-mono text-[11px] font-black text-white shadow transition-transform active:scale-95 ${
                selectedChip === chip.value ? 'ring-2 ring-white' : 'opacity-90'
              } disabled:opacity-50`}
            >
              {chip.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setAutoSpend((prev) => !prev)}
            className={`min-h-[44px] rounded-xl px-1 text-[9px] font-black leading-tight transition-colors ${
              autoSpend
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-b from-amber-400 to-amber-500 text-[#0F172A]'
            }`}
          >
            {autoSpend ? 'AUTO ON' : 'AUTO SPEND'}
          </button>
        </div>

        {/* Auto Esc Row + Cash Out Button */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setAutoEscEnabled((prev) => !prev)}
              className={`min-h-[36px] rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                autoEscEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
              }`}
            >
              auto esc {autoEscEnabled ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-1 rounded-lg bg-[#0F1824] px-1.5 py-0.5 font-mono text-xs text-white tabular-nums">
              <button
                type="button"
                onClick={() => setAutoEscTarget((v) => Math.max(1.2, Number((v - 0.2).toFixed(2))))}
                aria-label="Decrease auto cash out"
                className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[44px] text-center">{autoEscTarget.toFixed(2)}x</span>
              <button
                type="button"
                onClick={() => setAutoEscTarget((v) => Math.min(20, Number((v + 0.2).toFixed(2))))}
                aria-label="Increase auto cash out"
                className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {phase === 'flying' && joinedBet > 0 && !cashedOutMult && (
            <button
              type="button"
              onClick={handleCashOut}
              className="min-h-[40px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 text-xs font-black text-white shadow-md active:scale-95"
            >
              Cash Out {Math.floor(joinedBet * multiplier).toLocaleString()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
