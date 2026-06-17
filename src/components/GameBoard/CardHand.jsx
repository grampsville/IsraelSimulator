import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore.js';
import CardBase from '../Cards/CardBase.jsx';
import CardDetail from '../Cards/CardDetail.jsx';

export default function CardHand({ player, onSelectCard, selectedCardId }) {
  const [detailCard, setDetailCard] = useState(null);
  const actionPoints = useGameStore(s => s.actionPoints);

  if (!player || !player.hand) return null;

  const handleCardClick = (card) => {
    if (card.cost > actionPoints) {
      // Show detail view but can't play
      setDetailCard(card);
      return;
    }
    if (onSelectCard) {
      onSelectCard(card.instanceId === selectedCardId ? null : card.instanceId);
    }
  };

  return (
    <div className="relative">
      {/* Detail popup */}
      <AnimatePresence>
        {detailCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50"
          >
            <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand container */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 px-2 justify-center min-w-max mx-auto">
          {player.hand.length === 0 ? (
            <div className="text-gray-600 text-sm py-8">אין קלפים ביד — לחץ "משוך קלף"</div>
          ) : (
            player.hand.map((card, i) => {
              const isSelected = card.instanceId === selectedCardId;
              const cantAfford = card.cost > actionPoints;

              return (
                <motion.div
                  key={card.instanceId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: cantAfford ? 0.5 : 1,
                    y: isSelected ? -12 : 0,
                    rotate: (i - (player.hand.length - 1) / 2) * 3,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ transformOrigin: 'bottom center' }}
                >
                  <div className="relative">
                    <CardBase
                      card={card}
                      isSelected={isSelected}
                      onClick={() => handleCardClick(card)}
                    />
                    {cantAfford && (
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <span className="text-red-400 text-xs font-bold text-center px-1">
                          עלות: {card.cost} AP
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Hand count */}
      <div className="text-center text-xs text-gray-600 mt-1">
        {player.hand.length} / 5 קלפים ביד
        {player.deck.length > 0 && ` · ${player.deck.length} בחפיסה`}
      </div>
    </div>
  );
}
