import React from 'react';
import { motion } from 'framer-motion';

export default function CoalitionMeter({ players, humanPlayer }) {
  if (!humanPlayer) return null;

  const allyIds = [humanPlayer.id, ...(humanPlayer.coalitionAllies || [])];
  const alliedPlayers = players.filter(p => allyIds.includes(p.id) && !p.isEliminated);
  const totalMandates = alliedPlayers.reduce((sum, p) => sum + p.mandates, 0);
  const progress = Math.min(100, (totalMandates / 61) * 100);
  const hasCoalition = totalMandates >= 61;

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: hasCoalition ? 'rgba(253, 224, 71, 0.1)' : 'rgba(255,255,255,0.04)',
        border: hasCoalition ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400">קואליציה שלך</span>
        <span className={`text-xs font-black ${hasCoalition ? 'text-yellow-400' : 'text-white'}`}>
          {totalMandates} / 61
        </span>
      </div>

      {/* Bar */}
      <div className="h-3 rounded-full overflow-hidden bg-white/10 relative">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{
            background: hasCoalition
              ? 'linear-gradient(90deg, #ffd700, #ff9f00)'
              : `linear-gradient(90deg, ${humanPlayer.leader.color}88, ${humanPlayer.leader.color})`,
          }}
        />
        {/* 61 marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
          style={{ left: '100%' }}
        />
      </div>

      {/* Allied parties */}
      {alliedPlayers.length > 1 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {alliedPlayers.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs"
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

      {hasCoalition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-2 text-yellow-400 text-xs font-black"
        >
          🎉 קואליציה אפשרית!
        </motion.div>
      )}
    </div>
  );
}
