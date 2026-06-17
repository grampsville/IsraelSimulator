import React from 'react';
import { motion } from 'framer-motion';

const typeColors = {
  campaign: { bg: '#1a3a6e', border: '#3a6aae', label: 'קמפיין' },
  attack: { bg: '#6e1a1a', border: '#ae3a3a', label: 'תקיפה' },
  defense: { bg: '#1a5c2a', border: '#3aae5a', label: 'הגנה' },
  leverage: { bg: '#4a1a6e', border: '#8a3aae', label: 'מינוף' },
  secret_leverage: { bg: '#2a0a4e', border: '#6a2a9e', label: 'מינוף סודי' },
  mandate_siphon: { bg: '#6e3a0a', border: '#ae6a2a', label: 'שתיית מנדטים' },
  coalition: { bg: '#5c4a0a', border: '#ae8a2a', label: 'קואליציה' },
};

const rarityColors = {
  common: '#888',
  rare: '#00AEEF',
  epic: '#9b59b6',
};

const rarityLabels = {
  common: 'כרטיס רגיל',
  rare: 'כרטיס נדיר',
  epic: 'כרטיס אפי',
};

export default function CardDetail({ card, onClose }) {
  if (!card) return null;
  const colors = typeColors[card.type] || typeColors.campaign;
  const rarityColor = rarityColors[card.rarity] || '#888';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-2xl overflow-hidden w-56"
      style={{
        background: `linear-gradient(160deg, ${colors.bg} 0%, #0a0a0a 100%)`,
        border: `2px solid ${colors.border}`,
        boxShadow: `0 0 30px ${colors.border}66`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: colors.border + '33', borderBottom: `1px solid ${colors.border}44` }}
      >
        <span className="font-bold text-sm" style={{ color: colors.border }}>{colors.label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: rarityColor + '33', color: rarityColor, border: `1px solid ${rarityColor}55` }}
        >
          {rarityLabels[card.rarity]}
        </span>
      </div>

      {/* Emoji */}
      <div className="text-6xl text-center py-4">{card.emoji}</div>

      {/* Name */}
      <div className="px-4 pb-2 text-center">
        <h3 className="text-lg font-black text-white">{card.name}</h3>
        <p className="text-xs text-gray-400">{card.nameEn}</p>
      </div>

      {/* Description */}
      <div className="mx-4 mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm text-gray-200 leading-relaxed text-right">{card.description}</p>
      </div>

      {/* Cost */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-gray-400 text-sm">עלות פעולה:</span>
        <span
          className="text-lg font-black px-3 py-1 rounded-full"
          style={{ background: '#ffd700', color: '#000' }}
        >
          {card.cost} AP
        </span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-gray-400 hover:text-white border-t border-white/10 transition-colors"
        >
          סגור
        </button>
      )}
    </motion.div>
  );
}
