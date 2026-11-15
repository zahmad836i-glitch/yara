import { AnimatePresence, motion } from 'motion/react';
import { Coins, Crown, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TeenPattiGameProps {
  coins: number;
  userName: string;
  isRedUser?: boolean;
  onBalanceDelta: (delta: number) => void;
  onGamePlayed: () => void;
}

type Suit = '♠' | '♥' | '♦' | '♣';

interface CardItem {
  rank: number;
  label: string;
  suit: Suit;
}

type BetSide = 'player' | 'boss' | 'pairplus';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_LABELS: Record<number, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

const BASE_CHIP_AMOUNTS = [
  { label: '5K', value: 5_000 },
  { label: '50K', value: 50_000 },
  { label: '200K', value: 200_000 },
  { label: '1M', value: 1_000_000 },
];

const VIP_15M_CHIP = { label: '15M', value: 15_000_000 };

function dealHands(): { player: CardItem[]; boss: CardItem[] } {
  const deck: CardItem[] = [];
  for (const suit of SUITS) {
    for (let r = 2; r <= 14; r += 1) {
      deck.push({ rank: r, label: RANK_LABELS[r], suit });
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return {
    player: deck.slice(0, 3),
    boss: deck.slice(3, 6),
  };
}

function evaluateTeenPatti(cards: CardItem[]): {
  tier: number;
  name: string;
  tieBreaker: number;
} {
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const [c1, c2, c3] = sorted.map((c) => c.rank);
  const allSameSuit = cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
  const isSeq = (c1 === c2 + 1 && c2 === c3 + 1) || (c1 === 14 && c2 === 3 && c3 === 2);
  const seqHigh = c1 === 14 && c2 === 3 && c3 === 2 ? 3 : c1;

  if (c1 === c2 && c2 === c3) {
    return { tier: 6, name: 'Trail (Trio)', tieBreaker: c1 };
  }
  if (allSameSuit && isSeq) {
    return { tier: 5, name: 'Pure Sequence', tieBreaker: seqHigh };
  }
  if (isSeq) {
    return { tier: 4, name: 'Sequence', tieBreaker: seqHigh };
  }
  if (allSameSuit) {
    return { tier: 3, name: 'Color', tieBreaker: c1 * 225 + c2 * 15 + c3 };
  }
  if (c1 === c2 || c2 === c3 || c1 === c3) {
    const pairRank = c1 === c2 ? c1 : c2 === c3 ? c2 : c1;
    const kicker = c1 === c2 ? c3 : c2 === c3 ? c1 : c2;
    return { tier: 2, name: 'Pair', tieBreaker: pairRank * 20 + kicker };
  }
  return { tier: 1, name: 'High Card', tieBreaker: c1 * 225 + c2 * 15 + c3 };
}

function PlayingCard({ card, hidden }: { card: CardItem | null; hidden: boolean }) {
  if (hidden || !card) {
    return (
      <div className="flex h-14 w-9 items-center justify-center rounded-lg border border-amber-300/40 bg-gradient-to-br from-[#2B175E] to-[#170C38] shadow-md sm:h-16 sm:w-11 sm:rounded-xl">
        <div className="h-10 w-6 rounded border border-amber-400/30 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),transparent)] sm:h-11 sm:w-7 sm:rounded-lg" />
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex h-14 w-9 flex-col justify-between rounded-lg border border-slate-200 bg-white p-1 shadow-md sm:h-16 sm:w-11 sm:rounded-xl sm:p-1.5"
    >
      <span
        className={`font-mono text-[10px] font-extrabold leading-none sm:text-xs ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {card.label}
      </span>
      <span
        className={`self-center text-base leading-none sm:text-lg ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {card.suit}
      </span>
      <span
        className={`self-end font-mono text-[9px] font-bold leading-none sm:text-[10px] ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {card.suit}
      </span>
    </motion.div>
  );
}

export function TeenPattiGame({
  coins,
  userName,
  isRedUser = false,
  onBalanceDelta,
  onGamePlayed,
}: TeenPattiGameProps) {
  const [selectedChip, setSelectedChip] = useState(5_000);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [bets, setBets] = useState<Record<BetSide, number>>({
    player: 0,
    boss: 0,
    pairplus: 0,
  });
  const [phase, setPhase] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [countdown, setCountdown] = useState(8);
  const [hands, setHands] = useState<{ player: CardItem[]; boss: CardItem[] }>(() => dealHands());
  const [history, setHistory] = useState<Array<'P' | 'B'>>(['P', 'B', 'P', 'P', 'B']);
  const [todayWin, setTodayWin] = useState(0);
  const [roundNum, setRoundNum] = useState(312);
  const [winnerBanner, setWinnerBanner] = useState<{
    winnerName: string | null;
    sideLabel: string;
    handName: string;
    prize: number;
    hadBet: boolean;
  } | null>(null);

  const betsRef = useRef<Record<BetSide, number>>({ player: 0, boss: 0, pairplus: 0 });
  const lastBetsRef = useRef<Record<BetSide, number>>({ player: 5_000, boss: 0, pairplus: 0 });
  const coinsRef = useRef(coins);
  const autoRef = useRef(autoRepeat);
  const userNameRef = useRef(userName);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    autoRef.current = autoRepeat;
  }, [autoRepeat]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    let timerId: number | null = null;

    if (phase === 'betting') {
      setWinnerBanner(null);
      const nextHands = dealHands();
      setHands(nextHands);

      if (autoRef.current) {
        const template = lastBetsRef.current;
        const cost = template.player + template.boss + template.pairplus;
        if (cost > 0 && coinsRef.current >= cost) {
          onBalanceDelta(-cost);
          onGamePlayed();
          betsRef.current = { ...template };
          setBets({ ...template });
        }
      }

      let sec = 8;
      setCountdown(sec);
      timerId = window.setInterval(() => {
        sec -= 1;
        if (sec > 0) {
          setCountdown(sec);
        } else {
          if (timerId) window.clearInterval(timerId);
          setPhase('dealing');
        }
      }, 1000);
    } else if (phase === 'dealing') {
      timerId = window.setTimeout(() => {
        const pEval = evaluateTeenPatti(hands.player);
        const bEval = evaluateTeenPatti(hands.boss);
        const playerWins =
          pEval.tier > bEval.tier ||
          (pEval.tier === bEval.tier && pEval.tieBreaker >= bEval.tieBreaker);

        const winSide: 'player' | 'boss' = playerWins ? 'player' : 'boss';
        const winEval = playerWins ? pEval : bEval;
        const myBets = betsRef.current;
        const totalPlaced = myBets.player + myBets.boss + myBets.pairplus;

        let myPayout = 0;
        if (winSide === 'player' && myBets.player > 0) {
          myPayout += myBets.player * 2;
        }
        if (winSide === 'boss' && myBets.boss > 0) {
          myPayout += myBets.boss * 2;
        }
        if (myBets.pairplus > 0 && (pEval.tier >= 3 || bEval.tier >= 3)) {
          myPayout += myBets.pairplus * 5;
        }

        if (myPayout > 0) {
          onBalanceDelta(myPayout);
          setTodayWin((prev) => prev + myPayout);
          setWinnerBanner({
            winnerName: userNameRef.current,
            sideLabel: playerWins ? 'Raja Wins' : 'Rani Wins',
            handName: winEval.name,
            prize: myPayout,
            hadBet: true,
          });
        } else {
          setWinnerBanner({
            winnerName: null,
            sideLabel: playerWins ? 'Raja Wins' : 'Rani Wins',
            handName: winEval.name,
            prize: 0,
            hadBet: totalPlaced > 0,
          });
        }

        const historyTag: 'P' | 'B' = playerWins ? 'P' : 'B';
        setHistory((prev) => [historyTag, ...prev].slice(0, 10));
        betsRef.current = { player: 0, boss: 0, pairplus: 0 };
        setBets({ player: 0, boss: 0, pairplus: 0 });
        setPhase('result');
      }, 900);
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

  const totalRoundBet = bets.player + bets.boss + bets.pairplus;

  const placeBet = (side: BetSide) => {
    if (phase !== 'betting') return;
    if (!Number.isFinite(selectedChip) || selectedChip <= 0) return;
    const currentTotal =
      betsRef.current.player + betsRef.current.boss + betsRef.current.pairplus;
    if (coinsRef.current < selectedChip) return;

    onBalanceDelta(-selectedChip);
    if (currentTotal === 0) {
      onGamePlayed();
    }
    const next = {
      ...betsRef.current,
      [side]: betsRef.current[side] + selectedChip,
    };
    betsRef.current = next;
    lastBetsRef.current = next;
    setBets(next);
  };

  const pEval = evaluateTeenPatti(hands.player);
  const bEval = evaluateTeenPatti(hands.boss);
  const revealCards = phase === 'dealing' || phase === 'result';

  return (
    <div className="space-y-3.5">
      {/* Royal Teen Patti Table */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#0E4431] via-[#0B3426] to-[#081F1A] p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-300" />
            <span className="font-display font-bold text-white">Teen Patti</span>
            <span className="font-mono text-[11px] text-emerald-200/80 tabular-nums">
              #{roundNum} · Up to {isRedUser ? '15M' : '1M'} · No Limit
            </span>
          </div>
          <span className="rounded-lg bg-black/35 px-2.5 py-1 font-mono text-xs font-bold text-amber-300 tabular-nums">
            {phase === 'betting'
              ? `${String(countdown).padStart(2, '0')}s`
              : phase === 'dealing'
                ? 'Dealing...'
                : 'Result'}
          </span>
        </div>

        {/* Two Card Hands */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-2 text-center sm:p-2.5">
            <p className="mb-1.5 text-xs font-bold text-cyan-300 sm:mb-2">Raja (2x)</p>
            <div className="flex justify-center gap-1 sm:gap-1.5">
              {hands.player.map((card, i) => (
                <PlayingCard key={`p-${i}`} card={card} hidden={!revealCards} />
              ))}
            </div>
            <p className="mt-1.5 min-h-[16px] text-[11px] font-semibold text-amber-200 sm:mt-2">
              {revealCards ? pEval.name : 'Tap Raja below'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-2 text-center sm:p-2.5">
            <p className="mb-1.5 text-xs font-bold text-pink-300 sm:mb-2">Rani (2x)</p>
            <div className="flex justify-center gap-1 sm:gap-1.5">
              {hands.boss.map((card, i) => (
                <PlayingCard key={`b-${i}`} card={card} hidden={!revealCards} />
              ))}
            </div>
            <p className="mt-1.5 min-h-[16px] text-[11px] font-semibold text-amber-200 sm:mt-2">
              {revealCards ? bEval.name : 'Tap Rani below'}
            </p>
          </div>
        </div>

        {/* Bet Zone Tiles */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={phase !== 'betting' || selectedChip <= 0 || coins < selectedChip}
            onClick={() => placeBet('player')}
            className={`flex min-h-[54px] flex-col items-center justify-center rounded-2xl border p-2 transition-transform active:scale-95 ${
              bets.player > 0
                ? 'border-cyan-300 bg-cyan-500/25'
                : 'border-white/15 bg-black/30 hover:border-cyan-400/50'
            } disabled:opacity-60`}
          >
            <span className="text-xs font-bold text-cyan-200">Bet Raja</span>
            <span className="font-mono text-[11px] font-bold text-amber-300 tabular-nums">
              {bets.player > 0 ? bets.player.toLocaleString() : '2x'}
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'betting' || selectedChip <= 0 || coins < selectedChip}
            onClick={() => placeBet('pairplus')}
            className={`flex min-h-[54px] flex-col items-center justify-center rounded-2xl border p-2 transition-transform active:scale-95 ${
              bets.pairplus > 0
                ? 'border-amber-300 bg-amber-500/25'
                : 'border-white/15 bg-black/30 hover:border-amber-400/50'
            } disabled:opacity-60`}
          >
            <span className="text-xs font-bold text-amber-200">Color / Seq</span>
            <span className="font-mono text-[11px] font-bold text-amber-300 tabular-nums">
              {bets.pairplus > 0 ? bets.pairplus.toLocaleString() : '5x'}
            </span>
          </button>

          <button
            type="button"
            disabled={phase !== 'betting' || selectedChip <= 0 || coins < selectedChip}
            onClick={() => placeBet('boss')}
            className={`flex min-h-[54px] flex-col items-center justify-center rounded-2xl border p-2 transition-transform active:scale-95 ${
              bets.boss > 0
                ? 'border-pink-300 bg-pink-500/25'
                : 'border-white/15 bg-black/30 hover:border-pink-400/50'
            } disabled:opacity-60`}
          >
            <span className="text-xs font-bold text-pink-200">Bet Rani</span>
            <span className="font-mono text-[11px] font-bold text-amber-300 tabular-nums">
              {bets.boss > 0 ? bets.boss.toLocaleString() : '2x'}
            </span>
          </button>
        </div>

        {/* Active Player Bet Row (only if placed) */}
        {totalRoundBet > 0 && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-black/35 px-3 py-1.5 text-xs">
            <span className={`font-bold ${isRedUser ? 'text-red-400' : 'text-white'}`}>
              {userName}
            </span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              Total Bet: {totalRoundBet.toLocaleString()}
            </span>
          </div>
        )}

        {/* History Strip */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="shrink-0 text-emerald-200/80">History:</span>
          {history.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex h-5 w-8 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold ${
                item === 'P' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-pink-500/30 text-pink-200'
              }`}
            >
              {item === 'P' ? 'Raja' : 'Rani'}
            </span>
          ))}
        </div>

        {/* Center Winner Overlay */}
        <AnimatePresence>
          {phase === 'result' && winnerBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#091D16]/90 p-4 text-center backdrop-blur-md"
            >
              <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-[#0F0A1E]">
                <Trophy className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-emerald-300">
                {winnerBanner.sideLabel} · {winnerBanner.handName}
              </p>

              {winnerBanner.winnerName ? (
                <>
                  <h3
                    className={`mt-0.5 font-display text-2xl font-extrabold ${
                      isRedUser ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    {winnerBanner.winnerName}
                  </h3>
                  <p className="mt-1 font-mono text-sm font-bold text-amber-300 tabular-nums">
                    +{winnerBanner.prize.toLocaleString()} Coins
                  </p>
                </>
              ) : (
                <p className="mt-1.5 text-xs font-medium text-slate-300">
                  {winnerBanner.hadBet
                    ? 'No winning bet this round'
                    : 'No bets placed this round'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chips (5K to 1M, plus 15M for special account) */}
      <div className={`grid gap-2 ${isRedUser ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {(isRedUser ? [...BASE_CHIP_AMOUNTS, VIP_15M_CHIP] : BASE_CHIP_AMOUNTS).map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setSelectedChip(chip.value)}
            className={`min-h-[40px] rounded-xl font-mono text-xs font-bold tabular-nums transition-transform active:scale-95 ${
              selectedChip === chip.value
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F0A1E] shadow-md shadow-amber-500/30'
                : 'border border-white/10 bg-[#17102E] text-slate-200 hover:border-amber-400/50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Bottom HUD */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/10 bg-[#17102E] px-3 py-2">
          <p className="text-[10px] text-slate-400">Mine</p>
          <p className="flex items-center gap-1 truncate font-mono text-xs font-bold text-amber-300 tabular-nums">
            <Coins className="h-3 w-3 shrink-0" />
            {coins.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#17102E] px-3 py-2">
          <p className="text-[10px] text-slate-400">Today Win</p>
          <p className="truncate font-mono text-xs font-bold text-emerald-300 tabular-nums">
            {todayWin.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAutoRepeat((prev) => !prev)}
          className={`flex items-center justify-center gap-1.5 rounded-2xl text-xs font-bold transition-colors ${
            autoRepeat
              ? 'bg-emerald-500 text-white'
              : 'border border-white/10 bg-[#17102E] text-slate-200 hover:border-pink-400/40'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{autoRepeat ? 'Auto On' : 'Auto'}</span>
        </button>
      </div>
    </div>
  );
}
