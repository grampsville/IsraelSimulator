import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelsStore } from '../../store/levelsStore.js';

export default function ElectionPhase() {
  const {
    electionResults, electionRevealed, humanLeader,
    humanMandates, revealElection, proceedToCoalition,
  } = useLevelsStore();

  const [revealing, setRevealing] = useState(false);

  const handleReveal = () => {
    setRevealing(true);
    setTimeout(() => {
      revealElection();
      setRevealing(false);
    }, 1200);
  };

  const originalMandates = humanLeader?.startingMandates || 0;
  const diff = humanMandates - originalMandates;

  const maxMandates = Math.max(...(electionResults.map(r => r.mandates)), 1);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Title */}
      <div className="text-center">
        <div className="text-4xl mb-2">🗳️</div>
        <h2 className="text-2xl font-black text-white">יום הבחירות</h2>
      </div>

      {!electionRevealed && (
        <motion.div
          className="flex flex-col items-center gap-4 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {revealing ? (
            <motion.div
              className="text-center"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-300 text-lg font-bold">ספירת הקולות מתבצעת...</p>
              <p className="text-gray-500 text-sm mt-1">נא להמתין לתוצאות</p>
            </motion.div>
          ) : (
            <>
              <div className="text-5xl">🏛️</div>
              <p className="text-gray-300 text-center">
                הקמפיין הסתיים. הציבור הצביע.
                <br />
                מוכן לתוצאות?
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-8 py-3 rounded-xl font-black text-base"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                  color: '#1a1a1a',
                }}
              >
                גלה תוצאות
              </motion.button>
            </>
          )}
        </motion.div>
      )}

      {electionRevealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-3"
        >
          {/* Results list */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {electionResults.map((result, i) => (
              <motion.div
                key={result.leader.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3 px-3 py-3"
                style={{
                  background: result.isHuman
                    ? 'rgba(255,215,0,0.08)'
                    : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                  borderBottom: i < electionResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  borderRight: result.isHuman ? '3px solid #ffd700' : 'none',
                }}
              >
                <span className="text-gray-500 text-xs w-5">{i + 1}</span>
                <span className="text-xl">{result.leader.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white truncate">{result.leader.nickname}</span>
                    {result.isHuman && (
                      <span className="text-yellow-400 text-xs">(אתה)</span>
                    )}
                  </div>
                  <div className="mt-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(result.mandates / maxMandates) * 100}%` }}
                      transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{
                        background: result.isHuman ? '#ffd700' : (result.leader.color || '#888'),
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-base font-black"
                  style={{ color: result.isHuman ? '#ffd700' : '#fff' }}
                >
                  {result.mandates}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Human result summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: electionResults.length * 0.15 + 0.2 }}
            className="rounded-xl p-4 text-center"
            style={{
              background: diff >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${diff >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}
          >
            <div className="text-2xl mb-1">{humanLeader?.emoji}</div>
            <div className="text-white font-bold">{humanLeader?.nickname}</div>
            <div className="text-2xl font-black mt-1" style={{ color: diff >= 0 ? '#4ade80' : '#f87171' }}>
              {humanMandates} מנדטים
            </div>
            <div className="text-sm mt-1" style={{ color: diff >= 0 ? '#4ade80' : '#f87171' }}>
              {diff >= 0 ? '+' : ''}{diff} מהנקודת ההתחלה
            </div>
          </motion.div>

          {/* Proceed button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: electionResults.length * 0.15 + 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={proceedToCoalition}
            className="w-full py-3 rounded-xl font-black text-base"
            style={{
              background: 'linear-gradient(135deg, #0038b8, #4a90d9)',
              color: '#fff',
            }}
          >
            עבור לשיחות קואליציה →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
