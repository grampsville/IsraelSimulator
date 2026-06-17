import React from 'react';
import { motion } from 'framer-motion';

export default function LeaderDice({ leader, isSelected, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(leader.id)}
      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${leader.color}33 0%, ${leader.color}11 100%)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${isSelected ? leader.color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isSelected ? `0 0 20px ${leader.color}44` : 'none',
      }}
    >
      {/* Background glow */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 20% 50%, ${leader.color}22 0%, transparent 70%)` }}
        />
      )}

      {/* Emoji avatar */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
        style={{
          background: `${leader.color}22`,
          border: `2px solid ${leader.color}55`,
        }}
      >
        {leader.emoji}
      </motion.div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{leader.name}</div>
        <div className="text-xs truncate" style={{ color: leader.color }}>{leader.party}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">
            {leader.bloc === 'right' ? 'ימין' :
             leader.bloc === 'center' ? 'מרכז' :
             leader.bloc === 'left' ? 'שמאל' :
             leader.bloc === 'haredi' ? 'חרדי' : 'ערבי'}
          </span>
        </div>
      </div>

      {/* Mandate badge */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-black"
        style={{ background: leader.color, color: '#fff' }}
      >
        <span className="text-base leading-none">{leader.startingMandates}</span>
        <span className="text-xs opacity-80 leading-none">מנד׳</span>
      </div>
    </motion.div>
  );
}
