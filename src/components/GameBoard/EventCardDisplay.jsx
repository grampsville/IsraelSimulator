import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventCardDisplay({ eventCard }) {
  return (
    <AnimatePresence mode="wait">
      {eventCard && (
        <motion.div
          key={eventCard.id}
          initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl overflow-hidden flex-shrink-0 w-36"
          style={{
            background: `linear-gradient(160deg, ${eventCard.bgColor}33 0%, #0a0a0a 100%)`,
            border: `2px solid ${eventCard.bgColor}88`,
            boxShadow: `0 0 20px ${eventCard.bgColor}44`,
          }}
        >
          <div
            className="px-2 py-0.5 text-center text-xs font-bold"
            style={{ background: eventCard.bgColor + '44', color: eventCard.bgColor, borderBottom: `1px solid ${eventCard.bgColor}44` }}
          >
            אירוע פעיל
          </div>
          <div className="text-center py-2 text-3xl">{eventCard.emoji}</div>
          <div className="px-2 pb-2">
            <div className="text-white font-bold text-xs text-center leading-tight">{eventCard.name}</div>
            <div className="text-gray-400 text-xs mt-1 leading-tight text-center">{eventCard.description.slice(0, 50)}...</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
