import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore.js';

export default function ThresholdWarning() {
  const players = useGameStore(s => s.players);
  const thresholdPlayers = useGameStore(s => s.thresholdPlayers);

  const atRisk = players.filter(p => thresholdPlayers.includes(p.id) && !p.isEliminated);

  return (
    <AnimatePresence>
      {atRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="threshold-warning bg-red-900/80 border border-red-500 rounded-lg px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold text-lg">⚠️</span>
            <div>
              <div className="text-red-300 font-bold text-xs">סף חסימה!</div>
              <div className="text-red-200 text-xs">
                {atRisk.map(p => `${p.leader.name} — ${p.mandates} מנדטים`).join(' | ')}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
