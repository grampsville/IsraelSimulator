import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelsStore } from '../../store/levelsStore.js';
import { canFormCoalition } from '../../engine/gameEngine.js';

const ROUND_LABELS = ['יום 1–7', 'יום 8–14', 'יום 15–21', 'יום 22–28'];

const BLOC_COLORS = {
  right: '#0038b8',
  haredi: '#8B4513',
  center: '#00AEEF',
  left: '#CC0033',
  arab: '#006400',
};

export default function CoalitionPhase() {
  const {
    humanLeader, humanMandates, leverage,
    rivals, coalitionPartners, coalitionMandates,
    rivalCoalitionMandates, rivalCoalitionPotential,
    coalitionRound, coalitionLog,
    inviteToCoalition, passCoalitionRound,
  } = useLevelsStore();

  if (!humanLeader) return null;

  // Available partners: not ally, not eliminated, compatible
  const available = rivals.filter(
    r => !r.isAlly && canFormCoalition(humanLeader, r.leader)
  );

  // Top rival for display
  const topRival = [...rivals].sort((a, b) => b.mandates - a.mandates)[0];

  const rivalDanger = rivalCoalitionMandates > 45;
  const maxBar = Math.max(61, coalitionMandates, rivalCoalitionMandates);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* 28-day countdown visualization */}
      <div>
        <div className="text-center text-gray-400 text-xs mb-2">📅 28 יום לגיבוש קואליציה</div>
        <div className="flex gap-1">
          {ROUND_LABELS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm h-2"
                style={{
                  background: i < coalitionRound
                    ? '#4ade80'
                    : i === coalitionRound
                      ? '#ffd700'
                      : 'rgba(255,255,255,0.1)',
                }}
              />
              <span className="text-gray-600 text-xs leading-tight text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coalition race */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-xs text-gray-500 mb-3">מרוץ הקואליציה — נדרש: 61 מנד׳</div>

        {/* Human coalition bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-yellow-400 font-bold">הקואליציה שלך</span>
            <span className="text-yellow-400 font-black">{coalitionMandates} / 61</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 12, background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              animate={{ width: `${Math.min(100, (coalitionMandates / 61) * 100)}%` }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #ffd700, #ffaa00)' }}
            />
          </div>
          {/* Coalition member chips */}
          {coalitionPartners.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}
              >
                <span>{humanLeader.emoji}</span>
                <span>{humanMandates}</span>
              </div>
              {coalitionPartners.map(p => (
                <div
                  key={p.leader.id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: `${p.leader.color}22`,
                    border: `1px solid ${p.leader.color}55`,
                    color: p.leader.color,
                  }}
                >
                  <span>{p.leader.emoji}</span>
                  <span>{p.mandates}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rival coalition bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: rivalDanger ? '#f87171' : '#9ca3af' }}>
              {rivalDanger ? '⚠️ מאיים!' : 'גוש מתחרה'}
              {topRival && ` (${topRival.leader.emoji} ${topRival.leader.nickname})`}
            </span>
            <span
              className="font-black"
              style={{ color: rivalDanger ? '#f87171' : '#9ca3af' }}
            >
              {rivalCoalitionMandates} / 61
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 12, background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              animate={{ width: `${Math.min(100, (rivalCoalitionMandates / 61) * 100)}%` }}
              className="h-full rounded-full"
              style={{ background: rivalDanger ? '#ef4444' : '#f97316' }}
            />
          </div>
        </div>
      </div>

      {/* Available partners */}
      <div>
        <div className="text-sm text-gray-400 mb-2 font-bold">שותפים פוטנציאליים</div>
        {available.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-4">
            אין שותפים זמינים — כל המפלגות התאפיות הוזמנו
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map(r => (
              <motion.div
                key={r.leader.id}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-2xl">{r.leader.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{r.leader.nickname}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${BLOC_COLORS[r.leader.bloc] || '#888'}22`,
                        color: BLOC_COLORS[r.leader.bloc] || '#888',
                        border: `1px solid ${BLOC_COLORS[r.leader.bloc] || '#888'}44`,
                      }}
                    >
                      {r.leader.bloc}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">{r.mandates} מנדטים</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => inviteToCoalition(r.leader.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    background: 'rgba(0,100,255,0.2)',
                    border: '1px solid rgba(0,100,255,0.4)',
                    color: '#60a5fa',
                  }}
                >
                  הזמן
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pass button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={passCoalitionRound}
        className="w-full py-2.5 rounded-xl font-bold text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#9ca3af',
        }}
      >
        פסה סיבוב
      </motion.button>

      {/* Coalition log */}
      {coalitionLog.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs text-gray-600 mb-2">יומן שיחות</div>
          {coalitionLog.slice(-3).map((entry, i) => (
            <div key={i} className="text-xs text-gray-400 py-0.5">
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
