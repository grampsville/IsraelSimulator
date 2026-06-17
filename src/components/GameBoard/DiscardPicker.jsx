import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBase from '../Cards/CardBase.jsx';
import CardDetail from '../Cards/CardDetail.jsx';
import Button from '../UI/Button.jsx';

export default function DiscardPicker({ discard, count, onConfirm, onCancel }) {
  const [selected, setSelected] = useState([]);
  const [detailCard, setDetailCard] = useState(null);

  const toggle = (card) => {
    setSelected(prev => {
      const already = prev.find(c => c.instanceId === card.instanceId);
      if (already) return prev.filter(c => c.instanceId !== card.instanceId);
      if (prev.length >= count) return prev; // cap at allowed count
      return [...prev, card];
    });
  };

  const handleConfirm = () => {
    onConfirm(selected.map(c => c.instanceId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg rounded-t-2xl overflow-hidden"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '75vh' }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div className="text-white font-bold">♻️ בחר קלפים לשיקום</div>
            <div className="text-xs text-gray-400">
              בחר {count} קלף{count > 1 ? 'ים' : ''} מערימת הזבל · נבחרו {selected.length}/{count}
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Discard pile grid */}
        <div className="overflow-y-auto p-3" style={{ maxHeight: '50vh' }}>
          {discard.length === 0 ? (
            <div className="text-center text-gray-600 py-8 text-sm">ערימת הזבל ריקה</div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {discard.map(card => {
                const isSelected = selected.find(c => c.instanceId === card.instanceId);
                return (
                  <div key={card.instanceId} className="relative">
                    <CardBase
                      card={card}
                      isSelected={!!isSelected}
                      onClick={() => toggle(card)}
                      onInfo={() => setDetailCard(detailCard?.instanceId === card.instanceId ? null : card)}
                    />
                    {isSelected && (
                      <div
                        className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: '#22c55e', color: '#000' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={onCancel} variant="ghost" className="flex-1">ביטול</Button>
          <Button
            onClick={handleConfirm}
            variant="gold"
            className="flex-1"
            disabled={selected.length === 0}
          >
            הוסף {selected.length > 0 ? `(${selected.length})` : ''} ליד
          </Button>
        </div>
      </motion.div>

      {/* Card detail overlay */}
      <AnimatePresence>
        {detailCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.7)', zIndex: 60 }}
            onClick={() => setDetailCard(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={e => e.stopPropagation()}
            >
              <CardDetail card={detailCard} onClose={() => setDetailCard(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
