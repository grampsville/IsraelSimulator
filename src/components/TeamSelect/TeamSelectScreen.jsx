import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { leaders } from '../../data/leaders.js';
import { useGameStore } from '../../store/gameStore.js';
import LeaderDice from './LeaderDice.jsx';
import EntouragePanel from './EntouragePanel.jsx';
import FIFAStatsCard from './FIFAStatsCard.jsx';
import Button from '../UI/Button.jsx';

export default function TeamSelectScreen() {
  const selectedLeaderId = useGameStore(s => s.selectedLeaderId);
  const selectLeader = useGameStore(s => s.selectLeader);
  const startGame = useGameStore(s => s.startGame);
  const [activePanel, setActivePanel] = useState('entourage'); // 'entourage' | 'stats'

  const selectedLeader = leaders.find(l => l.id === selectedLeaderId);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col" style={{ fontFamily: 'Heebo, sans-serif' }}>
      {/* Header */}
      <div
        className="text-center py-6 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0d0d2e 0%, #0a0a0a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="text-4xl font-black text-white mb-1">בחירות</div>
          <div className="text-sm text-gray-400 tracking-wider uppercase">Election Run · בחר את קבוצתך</div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left: leader list */}
        <div
          className="md:w-80 flex-shrink-0 overflow-y-auto p-3 space-y-2"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs text-gray-500 font-bold px-1 mb-3 uppercase tracking-wider">
            בחר מנהיג — {leaders.length} מועמדים
          </div>
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <LeaderDice
                leader={leader}
                isSelected={selectedLeaderId === leader.id}
                onClick={selectLeader}
              />
            </motion.div>
          ))}
        </div>

        {/* Right: details panel */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {selectedLeader ? (
            <>
              {/* Panel tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActivePanel('entourage')}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
                  style={{
                    background: activePanel === 'entourage' ? selectedLeader.color : 'rgba(255,255,255,0.06)',
                    color: activePanel === 'entourage' ? '#fff' : '#999',
                    border: `1px solid ${activePanel === 'entourage' ? selectedLeader.color : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  קבוצה ונתוני רקע
                </button>
                <button
                  onClick={() => setActivePanel('stats')}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
                  style={{
                    background: activePanel === 'stats' ? selectedLeader.color : 'rgba(255,255,255,0.06)',
                    color: activePanel === 'stats' ? '#fff' : '#999',
                    border: `1px solid ${activePanel === 'stats' ? selectedLeader.color : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  כרטיס FIFA
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto">
                {activePanel === 'entourage' ? (
                  <EntouragePanel leader={selectedLeader} />
                ) : (
                  <FIFAStatsCard leader={selectedLeader} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EntouragePanel leader={null} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)' }}
      >
        <div className="text-sm text-gray-500">
          {selectedLeader ? (
            <span>נבחר: <span className="text-white font-bold">{selectedLeader.name}</span></span>
          ) : (
            'בחר מנהיג להמשיך'
          )}
        </div>
        <Button
          onClick={startGame}
          disabled={!selectedLeaderId}
          variant="gold"
          size="lg"
        >
          {selectedLeaderId ? `בחר ${selectedLeader?.party} — התחל משחק!` : 'בחר קבוצה זו'}
        </Button>
      </div>
    </div>
  );
}
