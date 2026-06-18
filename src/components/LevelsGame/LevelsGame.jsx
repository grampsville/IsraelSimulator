import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelsStore } from '../../store/levelsStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { leaders } from '../../data/leaders.js';
import CampaignPhase from './CampaignPhase.jsx';
import DebatePhase from './DebatePhase.jsx';
import ElectionPhase from './ElectionPhase.jsx';
import CoalitionPhase from './CoalitionPhase.jsx';

const BLOC_COLORS = {
  right: '#0038b8',
  haredi: '#8B4513',
  center: '#00AEEF',
  left: '#CC0033',
  arab: '#006400',
};

const PHASE_LABELS = {
  campaign: '🗓️ קמפיין',
  debate: '🎤 ויכוח',
  election: '🗳️ בחירות',
  coalition: '🏛️ קואליציה',
};

function LeaderPickScreen() {
  const { pickLeader } = useLevelsStore();
  const { restartGame } = useGameStore();
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="min-h-screen bg-game-bg flex flex-col"
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-white font-black text-lg">בחר את המנהיג שלך</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={restartGame}
          className="text-gray-400 text-sm px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          ← חזרה
        </motion.button>
      </div>

      {/* Leader grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {leaders.map(leader => {
            const isSelected = selected === leader.id;
            return (
              <motion.div
                key={leader.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(isSelected ? null : leader.id)}
                className="rounded-xl p-3 cursor-pointer transition-all"
                style={{
                  background: isSelected
                    ? `${leader.color}22`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? leader.color : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div className="text-3xl text-center mb-1">{leader.emoji}</div>
                <div className="text-white font-black text-sm text-center leading-tight">{leader.nickname}</div>
                <div className="text-xs text-center truncate mt-0.5" style={{ color: leader.color }}>{leader.party}</div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${BLOC_COLORS[leader.bloc] || '#888'}22`,
                      color: BLOC_COLORS[leader.bloc] || '#888',
                      border: `1px solid ${BLOC_COLORS[leader.bloc] || '#888'}44`,
                    }}
                  >
                    {leader.bloc}
                  </span>
                  <span className="text-gray-400 text-xs">{leader.startingMandates} מנד׳</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => selected && pickLeader(selected)}
          disabled={!selected}
          className="w-full py-3 rounded-xl font-black text-base"
          style={{
            background: selected ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'rgba(255,255,255,0.08)',
            color: selected ? '#1a1a1a' : '#666',
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          {selected ? `התחל עם ${leaders.find(l => l.id === selected)?.nickname}` : 'בחר מנהיג כדי להתחיל'}
        </motion.button>
      </div>
    </div>
  );
}

function ResultScreen() {
  const {
    winner, humanLeader, humanMandates,
    coalitionPartners, coalitionMandates,
    rivalCoalitionMandates, rivals,
    resetLevels,
  } = useLevelsStore();
  const { restartGame } = useGameStore();

  const topRival = [...rivals].sort((a, b) => b.mandates - a.mandates)[0];

  return (
    <div
      className="min-h-screen bg-game-bg flex items-center justify-center p-4"
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {winner === 'human' && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-3"
            >
              🏆
            </motion.div>
            <h2 className="text-3xl font-black text-yellow-400 mb-2">ניצחת!</h2>
            <p className="text-gray-300">הצלחת לגבש קואליציה!</p>
            <div
              className="rounded-xl p-4 mt-4"
              style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)' }}
            >
              <div className="text-yellow-400 font-bold text-sm mb-2">הקואליציה שלך</div>
              <div className="text-3xl font-black text-yellow-400">{coalitionMandates} מנדטים</div>
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {[{ leader: humanLeader, mandates: humanMandates }, ...coalitionPartners].map(p => (
                  <div
                    key={p.leader.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{
                      background: `${p.leader.color}22`,
                      border: `1px solid ${p.leader.color}55`,
                      color: p.leader.color,
                    }}
                  >
                    <span>{p.leader.emoji}</span>
                    <span>{p.leader.nickname}</span>
                    <span className="font-bold">({p.mandates})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {winner === 'rival' && (
          <div className="text-center">
            <div className="text-6xl mb-3">😔</div>
            <h2 className="text-3xl font-black text-red-400 mb-2">הפסדת</h2>
            {topRival && (
              <p className="text-gray-300">
                {topRival.leader.emoji} <strong>{topRival.leader.nickname}</strong> הקים קואליציה לפניך
              </p>
            )}
            <div
              className="rounded-xl p-4 mt-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="text-red-400 text-sm">הגוש המתחרה הגיע ל-{rivalCoalitionMandates} מנדטים</div>
              <div className="text-gray-400 text-sm mt-1">הקואליציה שלך: {coalitionMandates} מנדטים</div>
            </div>
          </div>
        )}

        {winner === 'draw' && (
          <div className="text-center">
            <div className="text-6xl mb-3">🔄</div>
            <h2 className="text-3xl font-black text-orange-400 mb-2">תיקו</h2>
            <p className="text-gray-300">לא נוצרה קואליציה — הולכים לבחירות מחדש</p>
            <div
              className="rounded-xl p-4 mt-4"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              <div className="text-orange-400 text-sm">שני הגושים לא הגיעו ל-61 מנדטים</div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={resetLevels}
            className="w-full py-3 rounded-xl font-black"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#1a1a1a' }}
          >
            נסה שוב
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={restartGame}
            className="w-full py-3 rounded-xl font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#9ca3af' }}
          >
            חזרה לתפריט
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LevelsGame() {
  const { levelsPhase, humanLeader, humanMandates, leverage } = useLevelsStore();

  if (levelsPhase === 'pick') return <LeaderPickScreen />;
  if (levelsPhase === 'result') return <ResultScreen />;

  const activePhases = ['campaign', 'debate', 'election', 'coalition'];
  const phaseIndex = activePhases.indexOf(levelsPhase);

  return (
    <div
      className="min-h-screen bg-game-bg flex flex-col"
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      {/* Persistent top bar */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{
          background: 'rgba(0,0,0,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{humanLeader?.emoji}</span>
          <span className="text-white font-bold text-sm">{humanLeader?.nickname}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-black text-sm">{humanMandates} מנד׳</span>
          <span className="text-blue-400 text-sm">💡 {leverage}</span>
        </div>
      </div>

      {/* Phase progress pills */}
      <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
        {activePhases.map((phase, i) => (
          <div
            key={phase}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all"
            style={{
              background: i < phaseIndex
                ? 'rgba(74,222,128,0.12)'
                : i === phaseIndex
                  ? 'rgba(255,215,0,0.15)'
                  : 'rgba(255,255,255,0.04)',
              color: i < phaseIndex
                ? '#4ade80'
                : i === phaseIndex
                  ? '#ffd700'
                  : '#666',
              border: `1px solid ${i === phaseIndex ? 'rgba(255,215,0,0.4)' : 'transparent'}`,
            }}
          >
            {i < phaseIndex ? '✓ ' : ''}{PHASE_LABELS[phase]}
          </div>
        ))}
      </div>

      {/* Phase content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={levelsPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {levelsPhase === 'campaign' && <CampaignPhase />}
            {levelsPhase === 'debate' && <DebatePhase />}
            {levelsPhase === 'election' && <ElectionPhase />}
            {levelsPhase === 'coalition' && <CoalitionPhase />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
