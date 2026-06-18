import React from 'react';
import { motion } from 'framer-motion';

export default function HomeScreen({ onCardGame, onLevelsGame }) {
  return (
    <div
      className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-4"
      dir="rtl"
      style={{ fontFamily: 'Heebo, sans-serif' }}
    >
      {/* Israeli flag blue stripe accent */}
      <div
        className="fixed top-0 left-0 right-0 h-2"
        style={{ background: 'linear-gradient(90deg, #0038b8 0%, #4a90d9 50%, #0038b8 100%)' }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-2"
        style={{ background: 'linear-gradient(90deg, #0038b8 0%, #4a90d9 50%, #0038b8 100%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-3"
          >
            🏛️
          </motion.div>
          <h1
            className="text-3xl font-black text-white mb-2"
            style={{ textShadow: '0 0 30px rgba(255,215,0,0.3)' }}
          >
            סימולטור הבחירות
          </h1>
          <p className="text-gray-400 text-base">
            חווה את הדרמה הפוליטית הישראלית
          </p>
        </div>

        {/* Game mode cards */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Card Game */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl p-5 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(0,0,0,0.6) 100%)',
              border: '2px solid rgba(255,215,0,0.4)',
              boxShadow: '0 4px 30px rgba(255,215,0,0.1)',
            }}
            onClick={onCardGame}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl flex-shrink-0">🃏</div>
              <div className="flex-1 text-right">
                <h2 className="text-xl font-black text-yellow-400 mb-1">משחק הקלפים</h2>
                <p className="text-gray-400 text-sm">אסטרטגיה, תקיפות, קואליציה בזמן אמת</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                color: '#1a1a1a',
              }}
              onClick={onCardGame}
            >
              שחק עכשיו
            </motion.button>
          </motion.div>

          {/* Levels Game */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl p-5 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(0,56,184,0.15) 0%, rgba(0,0,0,0.6) 100%)',
              border: '2px solid rgba(0,100,255,0.4)',
              boxShadow: '0 4px 30px rgba(0,100,255,0.1)',
            }}
            onClick={onLevelsGame}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl flex-shrink-0">🗺️</div>
              <div className="flex-1 text-right">
                <h2 className="text-xl font-black text-blue-400 mb-1">מסלול הבחירות</h2>
                <p className="text-gray-400 text-sm">קמפיין · ויכוח · בחירות · קואליציה</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #0038b8, #4a90d9)',
                color: '#ffffff',
              }}
              onClick={onLevelsGame}
            >
              התחל מסלול
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-600 text-xs"
        >
          מבוסס על פוליטיקה ישראלית אמיתית 🇮🇱
        </motion.p>
      </motion.div>
    </div>
  );
}
