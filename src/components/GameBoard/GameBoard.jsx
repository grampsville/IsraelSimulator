import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore.js';
import CardHand from './CardHand.jsx';
import MandateTracker from './MandateTracker.jsx';
import EventCardDisplay from './EventCardDisplay.jsx';
import CoalitionMeter from './CoalitionMeter.jsx';
import PlayerStatusBar from './PlayerStatusBar.jsx';
import ThresholdWarning from '../UI/ThresholdWarning.jsx';
import Button from '../UI/Button.jsx';
import Modal from '../UI/Modal.jsx';

const HELP_SECTIONS = [
  {
    title: '🎯 מטרת המשחק',
    text: 'הגע ל-61 מנדטים בקואליציה שלך והפוך לראש ממשלה. אפשר לנצח גם עם מנדטים מעטים — בדיוק כמו בנט ב-2021.',
  },
  {
    title: '⚡ נקודות פעולה (AP)',
    text: 'בכל תור יש לך 2 AP. כל קלף עולה 1–3 AP. ברגע שנגמר ה-AP אי אפשר לשחק עוד קלפים — סיים את התור.',
  },
  {
    title: '🃏 סוגי קלפים',
    text: 'קמפיין: מוסיף מנדטים לעצמך.\nתקיפה: מוריד מנדטים מיריב.\nהגנה: חוסם תקיפות הבאות.\nמינוף: לוחץ על יריב לוותר.\nמינוף סודי: מניפולציה על מנהיג ספציפי.\nשתיית מנדטים: גוזל מנדטים ממפלגה דומה אידיאולוגית.\nקואליציה: בונה ברית עם מפלגה אחרת.',
  },
  {
    title: '🎯 שחקת קלף שצריך יעד?',
    text: 'קלפי תקיפה, מינוף, שתיית מנדטים וקואליציה דורשים בחירת יעד. לאחר שבחרת קלף — לחץ על אחד השחקנים למעלה כדי לבחור אותו כיעד, ואז לחץ "שחק".',
  },
  {
    title: '⚠️ סף חסימה',
    text: 'מפלגה שיורדת מתחת ל-4 מנדטים מקבלת אזהרה. אם לא תתאושש תוך 2 סיבובים — נפסלת מהמשחק.',
  },
  {
    title: '👑 כוח מינוף',
    text: 'כוח המינוף שלך גדל כשאתה נשאר נייטרלי ושתי הסיעות מחזרות אחריך. מפלגה קטנה עם מינוף גבוה יכולה לדרוש את כיסא ראש הממשלה.',
  },
];

export default function GameBoard() {
  const {
    players, currentPlayerIndex, round, maxRounds, actionPoints,
    currentEventCard, gameLog, selectedCard, selectedTarget,
    playCard, endTurn, selectCard, selectTarget, clearSelection,
    restartGame, forceEndGame,
  } = useGameStore();

  const [showLog, setShowLog] = useState(false);
  const [showTargetSelect, setShowTargetSelect] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const humanPlayer = players.find(p => p.isHuman);
  const botPlayers = players.filter(p => !p.isHuman);

  const handleCardSelect = (cardInstanceId) => {
    if (!cardInstanceId) {
      clearSelection();
      setShowTargetSelect(false);
      return;
    }
    selectCard(cardInstanceId);

    const card = humanPlayer?.hand.find(c => c.instanceId === cardInstanceId);
    if (card) {
      const needsTarget = ['attack', 'leverage', 'secret_leverage', 'mandate_siphon', 'coalition'].includes(card.type);
      setShowTargetSelect(needsTarget);
    }
  };

  const handleTargetSelect = (targetId) => {
    if (!selectedCard) return;
    selectTarget(targetId);
  };

  const handlePlayCard = () => {
    if (!selectedCard) return;
    const targetId = selectedTarget || humanPlayer?.id;
    playCard(selectedCard, targetId);
    setShowTargetSelect(false);
  };

  const selectedCardData = humanPlayer?.hand.find(c => c.instanceId === selectedCard);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col max-w-lg mx-auto" style={{ fontFamily: 'Heebo, sans-serif' }}>

      {/* Top bar */}
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-500">סיבוב</div>
            <div className="text-lg font-black text-white">{round}/{maxRounds}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">AP</div>
            <div className="flex gap-1">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < actionPoints ? '#ffd700' : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs font-bold" style={{ color: humanPlayer?.leader.color }}>
            {humanPlayer?.leader.emoji} {humanPlayer?.leader.nickname || humanPlayer?.leader.name}
          </div>
          <div className="text-2xl font-black text-white">{humanPlayer?.mandates} <span className="text-xs text-gray-500">מנד׳</span></div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="text-gray-500 hover:text-white text-lg font-black w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}
            title="עזרה"
          >
            ?
          </button>
          <button
            onClick={() => setShowLog(!showLog)}
            className="text-gray-600 hover:text-white text-xl"
            title="יומן משחק"
          >
            📋
          </button>
          <button
            onClick={restartGame}
            className="text-gray-600 hover:text-white text-xl"
            title="התחל מחדש"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Game log overlay */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', maxHeight: '120px', overflowY: 'auto' }}
          >
            <div className="p-2 space-y-0.5">
              {gameLog.slice(-10).reverse().map((log, i) => (
                <div key={i} className="text-xs text-gray-400">{log}</div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Event card + threshold warning */}
        <div className="flex gap-2 items-start">
          <EventCardDisplay eventCard={currentEventCard} />
          <div className="flex-1 space-y-2">
            <ThresholdWarning />
            <CoalitionMeter players={players} humanPlayer={humanPlayer} />
          </div>
        </div>

        {/* Bot players status */}
        <div className="grid grid-cols-3 gap-1.5">
          {botPlayers.map((bot, i) => (
            <motion.div
              key={bot.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => showTargetSelect && handleTargetSelect(bot.id)}
              className={`relative ${showTargetSelect ? 'cursor-pointer' : ''}`}
            >
              <PlayerStatusBar
                player={bot}
                isCurrentTurn={false}
              />
              {showTargetSelect && !bot.isEliminated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    background: selectedTarget === bot.id
                      ? 'rgba(255,215,0,0.3)'
                      : 'rgba(255,100,0,0.1)',
                    border: selectedTarget === bot.id
                      ? '2px solid #ffd700'
                      : '2px dashed rgba(255,100,0,0.5)',
                  }}
                >
                  {selectedTarget === bot.id && <span className="text-lg">✓</span>}
                </motion.div>
              )}
            </motion.div>
          ))}
          {/* Self target option */}
          {showTargetSelect && (
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTargetSelect(humanPlayer?.id)}
              className="cursor-pointer rounded-xl p-2 flex items-center justify-center gap-1"
              style={{
                background: selectedTarget === humanPlayer?.id ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)',
                border: selectedTarget === humanPlayer?.id ? '2px solid #ffd700' : '2px dashed rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-base">{humanPlayer?.leader.emoji}</span>
              <span className="text-xs text-gray-300">עצמי</span>
              {selectedTarget === humanPlayer?.id && <span className="text-sm text-yellow-400">✓</span>}
            </motion.div>
          )}
        </div>

        {/* Mandate tracker */}
        <MandateTracker players={players} />

      </div>

      {/* Target needed hint */}
      <AnimatePresence>
        {selectedCardData && showTargetSelect && !selectedTarget && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="px-3 py-1.5 text-center text-sm font-bold"
            style={{ background: 'rgba(255,165,0,0.15)', borderTop: '1px solid rgba(255,165,0,0.3)', color: '#ffa500' }}
          >
            👆 בחר שחקן יעד מהרשת למעלה, ואז לחץ "שחק"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected card action bar */}
      <AnimatePresence>
        {selectedCardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-3 py-2 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCardData.emoji}</span>
              <div>
                <div className="text-sm font-bold text-white">{selectedCardData.name}</div>
                <div className="text-xs text-gray-400">
                  {showTargetSelect && !selectedTarget
                    ? '⚠️ נדרש יעד'
                    : selectedCardData.description.slice(0, 35) + '…'}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearSelection} variant="ghost" size="sm">ביטול</Button>
              <Button
                onClick={handlePlayCard}
                variant="gold"
                size="sm"
                disabled={showTargetSelect && !selectedTarget}
              >
                שחק
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card hand */}
      <div
        className="flex-shrink-0 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
      >
        <CardHand
          player={humanPlayer}
          onSelectCard={handleCardSelect}
          selectedCardId={selectedCard}
        />
      </div>

      {/* Action buttons */}
      <div
        className="flex gap-2 px-3 pb-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex-1 flex flex-col gap-1">
          <Button
            onClick={endTurn}
            variant="primary"
            size="sm"
            className="w-full"
          >
            סיים תור →
          </Button>
          <div className="text-center text-xs text-gray-600">
            🃏 קלף יימשך אוטומטית
          </div>
        </div>
        <Button
          onClick={forceEndGame}
          variant="danger"
          size="sm"
          disabled={round < 5}
        >
          🏁
        </Button>
      </div>

      {/* Help modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="❓ מדריך משחק">
        <div className="space-y-4">
          {HELP_SECTIONS.map((s) => (
            <div key={s.title}>
              <div className="font-bold text-white mb-1">{s.title}</div>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{s.text}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
