import React from 'react';
import { motion } from 'framer-motion';

export default function PlayerStatusBar({ player, isCurrentTurn }) {
  if (!player) return null;

  const isAtRisk = player.mandates <= 4 && !player.isEliminated;

  return (
    <motion.div
      animate={isAtRisk ? { borderColor: ['#ef4444', '#7f1d1d', '#ef4444'] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      className="rounded-xl p-2.5 flex items-center gap-2"
      style={{
        background: player.isEliminated
          ? 'rgba(255,255,255,0.02)'
          : isCurrentTurn
          ? `${player.leader.color}22`
          : 'rgba(255,255,255,0.04)',
        border: player.isEliminated
          ? '1px solid rgba(255,255,255,0.05)'
          : isCurrentTurn
          ? `2px solid ${player.leader.color}`
          : '1px solid rgba(255,255,255,0.1)',
        opacity: player.isEliminated ? 0.4 : 1,
      }}
    >
      <div className="text-xl">{player.isEliminated ? '💀' : player.leader.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white truncate">{player.leader.name.split(' ')[0]}</div>
        <div
          className="text-xs truncate"
          style={{ color: player.isEliminated ? '#444' : player.leader.color }}
        >
          {player.leader.party}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div
          className={`text-sm font-black ${isAtRisk ? 'text-red-400' : 'text-white'}`}
        >
          {player.isEliminated ? '—' : player.mandates}
        </div>
        <div className="text-xs text-gray-600">מנד׳</div>
      </div>
      {isCurrentTurn && !player.isEliminated && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: player.leader.color }}
        />
      )}
    </motion.div>
  );
}
