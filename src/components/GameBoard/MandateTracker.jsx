import React from 'react';
import { motion } from 'framer-motion';

const THRESHOLD = 4;
const COALITION_TARGET = 61;
const MAX_DISPLAY = 40;

export default function MandateTracker({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.mandates - a.mandates);

  return (
    <div className="bg-card-surface rounded-xl p-3 space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">מנדטים</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-yellow-400">61+ = קואליציה</span>
          <span className="text-red-400">≤4 = סף חסימה</span>
        </div>
      </div>

      {sortedPlayers.map((player, i) => {
        const pct = Math.min(100, (player.mandates / MAX_DISPLAY) * 100);
        const isAtRisk = player.mandates <= THRESHOLD && !player.isEliminated;
        const isEliminated = player.isEliminated;

        return (
          <div key={player.id} className="flex items-center gap-2">
            {/* Rank */}
            <span className="text-xs text-gray-600 w-4 text-center">{isEliminated ? '💀' : i + 1}</span>

            {/* Emoji */}
            <span className="text-base w-6 text-center">{player.leader.emoji}</span>

            {/* Name */}
            <span
              className="text-xs font-bold truncate w-20"
              style={{ color: isEliminated ? '#444' : player.leader.color }}
            >
              {player.leader.name.split(' ')[0]}
            </span>

            {/* Bar */}
            <div className="flex-1 relative h-4 rounded-full overflow-hidden"
              style={{ background: isEliminated ? '#1a1a1a' : 'rgba(255,255,255,0.06)' }}
            >
              {/* 61 marker */}
              <div
                className="absolute top-0 bottom-0 w-px z-10"
                style={{
                  right: `${100 - (COALITION_TARGET / MAX_DISPLAY) * 100}%`,
                  background: '#ffd700',
                }}
              />
              {/* 4 threshold marker */}
              <div
                className="absolute top-0 bottom-0 w-px z-10"
                style={{
                  right: `${100 - (THRESHOLD / MAX_DISPLAY) * 100}%`,
                  background: '#ef4444',
                }}
              />

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: isEliminated
                    ? '#333'
                    : isAtRisk
                    ? 'linear-gradient(90deg, #7f1d1d, #ef4444)'
                    : `linear-gradient(90deg, ${player.leader.color}88, ${player.leader.color})`,
                }}
              />
            </div>

            {/* Mandate count */}
            <span
              className={`text-xs font-black w-6 text-center ${isAtRisk ? 'text-red-400 threshold-warning' : isEliminated ? 'text-gray-600' : 'text-white'}`}
            >
              {isEliminated ? '—' : player.mandates}
            </span>
          </div>
        );
      })}
    </div>
  );
}
