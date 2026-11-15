import { AnimatePresence, motion } from 'motion/react';
import { Cherry, Crown, Rocket, Spade, Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GameRankEntry } from '../../types';
import { FruitPartyGame } from './FruitPartyGame';
import { GameRankingList } from './GameRankingList';
import { GatesOfOlympusGame } from './GatesOfOlympusGame';
import { RocketGame } from './RocketGame';
import { TeenPattiGame } from './TeenPattiGame';

export type GameId = 'fruit' | 'rocket' | 'olympus' | 'teenpatti';

const GAME_TITLES: Record<GameId, string> = {
  fruit: 'Fruit Party',
  rocket: 'Rocket',
  olympus: 'GatesOfOlympus',
  teenpatti: 'Teen Patti',
};

interface PartyGamesModalProps {
  isOpen: boolean;
  initialGame?: GameId;
  coins: number;
  userName: string;
  isRedUser?: boolean;
  ranking: GameRankEntry[];
  onClose: () => void;
  onBalanceDelta: (delta: number) => void;
  onGamePlayed: () => void;
  onRecordWin: (gameName: string, winAmount: number) => void;
}

export function PartyGamesModal({
  isOpen,
  initialGame = 'fruit',
  coins,
  userName,
  isRedUser = false,
  ranking,
  onClose,
  onBalanceDelta,
  onGamePlayed,
  onRecordWin,
}: PartyGamesModalProps) {
  const [activeGame, setActiveGame] = useState<GameId>(initialGame);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveGame(initialGame);
      setShowRanking(false);
    }
  }, [isOpen, initialGame]);

  const handleGameBalanceDelta = (delta: number) => {
    onBalanceDelta(delta);
    if (delta > 0) {
      onRecordWin(GAME_TITLES[activeGame], delta);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="glass-elevated max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-5"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20 sm:hidden" />

            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-white">Game Center</h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowRanking((prev) => !prev)}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors ${
                    showRanking
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F0A1E]'
                      : 'border border-amber-400/35 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Top Ranking</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close game center"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-2xl bg-[#130C26] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveGame('fruit');
                  setShowRanking(false);
                }}
                className={`flex min-h-[38px] items-center justify-center gap-1 rounded-xl px-1.5 text-[11px] font-bold transition-colors ${
                  !showRanking && activeGame === 'fruit'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Cherry className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Fruit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGame('rocket');
                  setShowRanking(false);
                }}
                className={`flex min-h-[38px] items-center justify-center gap-1 rounded-xl px-1.5 text-[11px] font-bold transition-colors ${
                  !showRanking && activeGame === 'rocket'
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Rocket className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Rocket</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGame('olympus');
                  setShowRanking(false);
                }}
                className={`flex min-h-[38px] items-center justify-center gap-1 rounded-xl px-1.5 text-[11px] font-bold transition-colors ${
                  !showRanking && activeGame === 'olympus'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Crown className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Olympus</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGame('teenpatti');
                  setShowRanking(false);
                }}
                className={`flex min-h-[38px] items-center justify-center gap-1 rounded-xl px-1.5 text-[11px] font-bold transition-colors ${
                  !showRanking && activeGame === 'teenpatti'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Spade className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">TeenPatti</span>
              </button>
            </div>

            {showRanking ? (
              <GameRankingList ranking={ranking} compact />
            ) : (
              <>
                {activeGame === 'fruit' && (
                  <FruitPartyGame
                    coins={coins}
                    userName={userName}
                    isRedUser={isRedUser}
                    onBalanceDelta={handleGameBalanceDelta}
                    onGamePlayed={onGamePlayed}
                  />
                )}
                {activeGame === 'rocket' && (
                  <RocketGame
                    coins={coins}
                    userName={userName}
                    isRedUser={isRedUser}
                    onBalanceDelta={handleGameBalanceDelta}
                    onGamePlayed={onGamePlayed}
                  />
                )}
                {activeGame === 'olympus' && (
                  <GatesOfOlympusGame
                    coins={coins}
                    userName={userName}
                    isRedUser={isRedUser}
                    onBalanceDelta={handleGameBalanceDelta}
                    onGamePlayed={onGamePlayed}
                  />
                )}
                {activeGame === 'teenpatti' && (
                  <TeenPattiGame
                    coins={coins}
                    userName={userName}
                    isRedUser={isRedUser}
                    onBalanceDelta={handleGameBalanceDelta}
                    onGamePlayed={onGamePlayed}
                  />
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
