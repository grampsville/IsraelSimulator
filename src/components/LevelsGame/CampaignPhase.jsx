import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelsStore } from '../../store/levelsStore.js';
import { campaignDecisions } from '../../data/levelsData.js';

const BLOC_COLORS = {
  right: '#0038b8',
  haredi: '#8B4513',
  center: '#00AEEF',
  left: '#CC0033',
  arab: '#006400',
};

export default function CampaignPhase() {
  const {
    campaignWeek, rivals, humanMandates, humanLeader,
    makeCampaignChoice, lastOutcome,
  } = useLevelsStore();

  const [selected, setSelected] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const weekData = campaignDecisions[campaignWeek];
  if (!weekData) return null;

  const topRivals = [...rivals].sort((a, b) => b.mandates - a.mandates).slice(0, 5);
  const maxMandates = Math.max(humanMandates, ...topRivals.map(r => r.mandates), 1);

  const handleConfirm = () => {
    if (!selected) return;
    makeCampaignChoice(selected);
    setShowOutcome(true);
    setSelected(null);
    setTimeout(() => setShowOutcome(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Progress */}
      <div className="flex gap-2 items-center justify-center mb-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === campaignWeek ? 28 : 12,
              height: 8,
              background: i <= campaignWeek ? '#ffd700' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
        <span className="text-gray-400 text-xs mr-2">שבוע {campaignWeek + 1} מתוך 3</span>
      </div>

      {/* Rival mandate bars — compact */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-xs text-gray-500 mb-2">סקרים עכשיו</div>
        {/* Human */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm w-5">{humanLeader?.emoji}</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              animate={{ width: `${(humanMandates / maxMandates) * 100}%` }}
              className="h-full rounded-full"
              style={{ background: '#ffd700' }}
            />
          </div>
          <span className="text-yellow-400 text-xs w-5 text-left">{humanMandates}</span>
        </div>
        {topRivals.map(r => (
          <div key={r.leader.id} className="flex items-center gap-2 mb-1">
            <span className="text-sm w-5">{r.leader.emoji}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                animate={{ width: `${(r.mandates / maxMandates) * 100}%` }}
                className="h-full rounded-full"
                style={{ background: BLOC_COLORS[r.leader.bloc] || '#888' }}
              />
            </div>
            <span className="text-gray-400 text-xs w-5 text-left">{r.mandates}</span>
          </div>
        ))}
      </div>

      {/* Week title & situation */}
      <div>
        <h3 className="text-white font-black text-lg">{weekData.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{weekData.situation}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {weekData.options.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <motion.div
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(isSelected ? null : opt.id)}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: isSelected
                  ? 'rgba(255,215,0,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isSelected ? '#ffd700' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold text-white text-base">{opt.title}</div>
                  <div className="text-gray-400 text-sm mt-0.5">{opt.desc}</div>
                  <div className="flex gap-3 mt-2">
                    {opt.effects.mandates !== 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: opt.effects.mandates > 0 ? 'rgba(0,200,0,0.15)' : 'rgba(200,0,0,0.15)',
                          color: opt.effects.mandates > 0 ? '#4ade80' : '#f87171',
                        }}
                      >
                        {opt.effects.mandates > 0 ? '+' : ''}{opt.effects.mandates} מנד׳
                      </span>
                    )}
                    {opt.effects.leverage !== 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: opt.effects.leverage > 0 ? 'rgba(0,150,255,0.15)' : 'rgba(200,0,0,0.15)',
                          color: opt.effects.leverage > 0 ? '#60a5fa' : '#f87171',
                        }}
                      >
                        {opt.effects.leverage > 0 ? '+' : ''}{opt.effects.leverage} מינוף
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <span className="text-yellow-400 text-xl">✓</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirm button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleConfirm}
        disabled={!selected}
        className="w-full py-3 rounded-xl font-black text-base transition-all"
        style={{
          background: selected ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'rgba(255,255,255,0.08)',
          color: selected ? '#1a1a1a' : '#666',
          cursor: selected ? 'pointer' : 'not-allowed',
        }}
      >
        בחר
      </motion.button>

      {/* Outcome toast */}
      <AnimatePresence>
        {showOutcome && lastOutcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm rounded-xl p-4 text-center z-50"
            style={{
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-white font-bold text-sm">{lastOutcome}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
