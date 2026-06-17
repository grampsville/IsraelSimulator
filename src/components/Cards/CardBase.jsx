import React, { useState } from 'react';
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

export default function CardBase({ card, isSelected, onClick, onInfo, showBack = false, small = false }) {
  const [flipped, setFlipped] = useState(showBack);

  const colors = typeColors[card.type] || typeColors.campaign;
  const rarityColor = rarityColors[card.rarity] || '#888';

  const handleClick = () => {
    if (onClick) onClick(card);
  };

  const handleInfo = (e) => {
    e.stopPropagation();
    if (onInfo) onInfo(card);
  };

  const width = small ? 'w-20' : 'w-28';
  const height = small ? 'h-28' : 'h-40';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`card-container ${width} ${height} relative cursor-pointer flex-shrink-0`}
      style={{
        filter: isSelected ? `drop-shadow(0 0 12px ${colors.border})` : 'none',
      }}
    >
      {/* Card face */}
      <div
        className={`w-full h-full rounded-xl flex flex-col overflow-hidden border-2 transition-all duration-200`}
        style={{
          background: `linear-gradient(160deg, ${colors.bg} 0%, #0a0a0a 100%)`,
          borderColor: isSelected ? colors.border : `${colors.border}66`,
        }}
      >
        {/* Type bar */}
        <div
          className="px-1.5 py-0.5 text-center"
          style={{ background: colors.border + '44', borderBottom: `1px solid ${colors.border}44` }}
        >
          <span className="text-xs font-bold" style={{ color: colors.border }}>
            {colors.label}
          </span>
        </div>

        {/* Emoji */}
        <div className="flex-1 flex items-center justify-center text-3xl py-1">
          {card.emoji}
        </div>

        {/* Name */}
        <div className="px-1 pb-1 text-center">
          <div className={`font-bold leading-tight text-white ${small ? 'text-xs' : 'text-xs'}`}>
            {card.name}
          </div>
        </div>

        {/* Cost & rarity + info button */}
        <div
          className="flex justify-between items-center px-1.5 py-0.5"
          style={{ borderTop: `1px solid ${colors.border}33` }}
        >
          <button
            onClick={handleInfo}
            className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/20"
            style={{ border: `1px solid rgba(255,255,255,0.25)`, color: 'rgba(255,255,255,0.6)' }}
            title="פרטי קלף"
          >
            ?
          </button>
          <span
            className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: '#ffd700', color: '#000' }}
          >
            {card.cost}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
