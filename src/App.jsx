import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore.js';
import TeamSelectScreen from './components/TeamSelect/TeamSelectScreen.jsx';
import GameBoard from './components/GameBoard/GameBoard.jsx';
import Button from './components/UI/Button.jsx';

// Coalition negotiation overlay
function CoalitionScreen() {
  const { players, winner, restartGame, gamePhase } = useGameStore();
  const humanPlayer = players.find(p => p.isHuman);

  const allyIds = winner ? [winner.id, ...(winner.coalitionAllies || [])] : [];
  const coalitionPlayers = players.filter(p => allyIds.includes(p.id) && !p.isEliminated);
  const totalMandates = coalitionPlayers.reduce((sum, p) => sum + p.mandates, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="rounded-2xl overflow-hidden w-full max-w-sm"
        style={{
          background: 'linear-gradient(160deg, #1a2a1a 0%, #0a0a0a 100%)',
          border: '2px solid #ffd700',
          boxShadow: '0 0 60px rgba(255,215,0,0.3)',
        }}
      >
        <div className="p-6 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl mb-3"
          >
            👑
          </motion.div>
          <h2 className="text-2xl font-black text-yellow-400 mb-1">קואליציה נוצרה!</h2>
          {winner && (
            <>
              <div className="text-4xl my-2">{winner.leader.emoji}</div>
              <div className="text-lg font-bold text-white">{winner.leader.name}</div>
              <div className="text-sm" style={{ color: winner.leader.color }}>{winner.leader.party}</div>
            </>
          )}
          <div className="text-3xl font-black text-yellow-400 mt-2">{totalMandates} מנדטים</div>
          <div className="text-sm text-gray-400">קואליציה של {coalitionPlayers.length} מפלגות</div>

          {coalitionPlayers.length > 0 && (
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {coalitionPlayers.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ background: `${p.leader.color}22`, border: `1px solid ${p.leader.color}55`, color: p.leader.color }}
                >
                  <span>{p.leader.emoji}</span>
                  <span>{p.leader.name.split(' ')[0]}</span>
                  <span className="font-bold">({p.mandates})</span>
                </div>
              ))}
            </div>
          )}

          {winner?.id === humanPlayer?.id ? (
            <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <div className="text-yellow-400 font-black text-lg">🎉 ניצחת!</div>
              <div className="text-gray-400 text-sm mt-1">הצלחת לגבש קואליציה!</div>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(139,0,0,0.2)', border: '1px solid rgba(139,0,0,0.4)' }}>
              <div className="text-red-400 font-black text-lg">😔 הפסדת</div>
              <div className="text-gray-400 text-sm mt-1">{winner?.leader.name} יצר/ה קואליציה ראשונה</div>
            </div>
          )}

          <div className="mt-4">
            <Button onClick={restartGame} variant="gold" size="lg" className="w-full">
              🔄 משחק חדש
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// End game screen
function EndScreen() {
  const { players, winner, restartGame, round } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.mandates - a.mandates);
  const humanPlayer = players.find(p => p.isHuman);
  const humanWon = winner?.id === humanPlayer?.id;

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Heebo, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Result header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{humanWon ? '🏆' : '📊'}</div>
          <h1 className="text-3xl font-black text-white">
            {humanWon ? 'ניצחת!' : 'המשחק הסתיים'}
          </h1>
          <div className="text-gray-400 mt-1">סיבוב {round} מתוך 21</div>
        </div>

        {/* Winner */}
        {winner && (
          <div
            className="rounded-2xl p-4 mb-4 text-center"
            style={{
              background: `${winner.leader.color}22`,
              border: `2px solid ${winner.leader.color}55`,
            }}
          >
            <div className="text-4xl mb-1">{winner.leader.emoji}</div>
            <div className="text-lg font-black text-white">{winner.leader.name}</div>
            <div className="font-bold" style={{ color: winner.leader.color }}>{winner.leader.party}</div>
            <div className="text-3xl font-black text-white mt-1">{winner.mandates} <span className="text-sm text-gray-400">מנדטים</span></div>
          </div>
        )}

        {/* Full results table */}
        <div
          className="rounded-xl overflow-hidden mb-4"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {sortedPlayers.map((player, i) => (
            <div
              key={player.id}
              className="flex items-center gap-3 px-3 py-2"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                borderBottom: i < sortedPlayers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                opacity: player.isEliminated ? 0.5 : 1,
              }}
            >
              <span className="w-5 text-center text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
              <span className="text-base">{player.isEliminated ? '💀' : player.leader.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{player.leader.name}</div>
                <div className="text-xs truncate" style={{ color: player.leader.color }}>{player.leader.party}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white">{player.isEliminated ? '—' : player.mandates}</div>
                {player.isHuman && <div className="text-xs text-yellow-400">אתה</div>}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={restartGame} variant="gold" size="xl" className="w-full">
          🔄 משחק חדש
        </Button>
      </motion.div>
    </div>
  );
}

export default function App() {
  const gamePhase = useGameStore(s => s.gamePhase);

  return (
    <div className="min-h-screen bg-game-bg" dir="rtl">
      <AnimatePresence mode="wait">
        {gamePhase === 'team_select' && (
          <motion.div key="team_select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TeamSelectScreen />
          </motion.div>
        )}

        {(gamePhase === 'game' || gamePhase === 'coalition') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameBoard />
            {gamePhase === 'coalition' && <CoalitionScreen />}
          </motion.div>
        )}

        {gamePhase === 'end' && (
          <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EndScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
