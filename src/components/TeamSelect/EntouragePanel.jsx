import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bgThemeMotifs = {
  coalition: '🏛️',
  street: '🔥',
  settlement: '🏕️',
  media: '📺',
  peace: '🕊️',
  secular: '🧊',
  community: '🕍',
  torah: '📖',
  integrity: '⭐',
  pragmatic: '🤝',
};

export default function EntouragePanel({ leader }) {
  if (!leader) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-center p-8">
        <div>
          <div className="text-5xl mb-3">🗳️</div>
          <div className="text-lg">בחר מנהיג</div>
          <div className="text-sm text-gray-700 mt-1">לצפות בנתוני הקבוצה</div>
        </div>
      </div>
    );
  }

  const motif = bgThemeMotifs[leader.bgTheme] || '🏛️';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={leader.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.35 }}
        className="h-full overflow-y-auto space-y-4 p-1"
      >
        {/* Leader header */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${leader.color}22 0%, #0a0a1a 100%)`,
            border: `2px solid ${leader.color}55`,
          }}
        >
          {/* Background motif */}
          <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-10 text-9xl pointer-events-none select-none">
            {motif}
          </div>

          <div className="relative flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${leader.color}33`, border: `2px solid ${leader.color}77` }}
            >
              {leader.emoji}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{leader.name}</h2>
              <div className="text-sm font-bold" style={{ color: leader.color }}>{leader.party}</div>
              <div className="text-xs text-gray-400 mt-0.5">{leader.nameEn} · {leader.partyEn}</div>
            </div>
          </div>

          {/* Bloc badge */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${leader.color}33`, color: leader.color, border: `1px solid ${leader.color}55` }}
            >
              {leader.bloc === 'right' ? 'גוש ימין' :
               leader.bloc === 'center' ? 'גוש מרכז' :
               leader.bloc === 'left' ? 'גוש שמאל' :
               leader.bloc === 'haredi' ? 'גוש חרדי' : 'גוש ערבי'}
            </span>
            <span className="text-xs text-gray-500">
              {leader.startingMandates} מנדטים ראשוניים
            </span>
          </div>
        </div>

        {/* Notable members */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">חברי קבוצה בולטים</h3>
          <div className="flex flex-wrap gap-2">
            {leader.notableMembers.map((member, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs px-2.5 py-1 rounded-full text-white"
                style={{ background: `${leader.color}22`, border: `1px solid ${leader.color}44` }}
              >
                {member}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Supporters */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-2">קהלי תמיכה</h3>
          <div className="space-y-1">
            {leader.supporters.map((sup, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span style={{ color: leader.color }}>●</span>
                {sup}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <h3 className="text-sm font-bold text-green-400 mb-2">✅ חוזקות</h3>
          <div className="flex flex-wrap gap-2">
            {leader.strengths.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-lg text-green-300"
                style={{ background: '#0a3a1a', border: '1px solid #1a5a2a' }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div>
          <h3 className="text-sm font-bold text-red-400 mb-2">❌ חולשות</h3>
          <div className="flex flex-wrap gap-2">
            {leader.weaknesses.map((w, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-lg text-red-300"
                style={{ background: '#3a0a0a', border: '1px solid #5a1a1a' }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Deck archetype */}
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-gray-400">סגנון משחק: </span>
          <span className="text-white font-bold">{leader.deckArchetype}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
