import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelsStore } from '../../store/levelsStore.js';
import { debateQuestions } from '../../data/levelsData.js';

export default function DebatePhase() {
  const { debateQuestionIndex, answerDebateQuestion, lastOutcome } = useLevelsStore();
  const [selected, setSelected] = useState(null);
  const [showReaction, setShowReaction] = useState(false);

  const question = debateQuestions[debateQuestionIndex];
  if (!question) return null;

  const handleAnswer = (answerId) => {
    if (selected) return; // prevent double tap
    setSelected(answerId);
    setTimeout(() => {
      answerDebateQuestion(answerId);
      setSelected(null);
      setShowReaction(true);
      setTimeout(() => setShowReaction(false), 2000);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {/* Progress */}
      <div className="flex items-center gap-2 justify-center">
        {debateQuestions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-full transition-all"
            style={{
              width: i === debateQuestionIndex ? 28 : 12,
              height: 8,
              background: i < debateQuestionIndex
                ? '#4ade80'
                : i === debateQuestionIndex
                  ? '#ffd700'
                  : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
        <span className="text-gray-400 text-xs mr-2">
          שאלה {debateQuestionIndex + 1} מתוך {debateQuestions.length}
        </span>
      </div>

      {/* Topic badge */}
      <div className="flex justify-center">
        <span
          className="px-3 py-1 rounded-full text-sm font-bold"
          style={{ background: 'rgba(255,215,0,0.12)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}
        >
          {question.emoji} {question.topic}
        </span>
      </div>

      {/* Question */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="text-center mb-2">
          <span className="text-3xl">🎤</span>
        </div>
        <h3 className="text-white font-black text-lg text-center leading-snug">
          {question.question}
        </h3>
        <p className="text-gray-500 text-sm text-center mt-2">{question.context}</p>
      </div>

      {/* Answer options */}
      <div className="flex flex-col gap-3">
        {question.answers.map(answer => {
          const isSelected = selected === answer.id;
          return (
            <motion.div
              key={answer.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnswer(answer.id)}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: isSelected
                  ? 'rgba(255,215,0,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isSelected ? '#ffd700' : 'rgba(255,255,255,0.1)'}`,
                opacity: selected && !isSelected ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{answer.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{answer.label}</div>
                  <div className="flex gap-2 mt-1.5">
                    {answer.effects.mandates !== 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: answer.effects.mandates > 0 ? 'rgba(0,200,0,0.15)' : 'rgba(200,0,0,0.15)',
                          color: answer.effects.mandates > 0 ? '#4ade80' : '#f87171',
                        }}
                      >
                        {answer.effects.mandates > 0 ? '+' : ''}{answer.effects.mandates} מנד׳
                      </span>
                    )}
                    {answer.effects.leverage !== 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: answer.effects.leverage > 0 ? 'rgba(0,150,255,0.15)' : 'rgba(200,0,0,0.15)',
                          color: answer.effects.leverage > 0 ? '#60a5fa' : '#f87171',
                        }}
                      >
                        {answer.effects.leverage > 0 ? '+' : ''}{answer.effects.leverage} מינוף
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-yellow-400 text-xl"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reaction toast */}
      <AnimatePresence>
        {showReaction && lastOutcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm rounded-xl p-4 text-center z-50"
            style={{
              background: 'rgba(0,150,255,0.15)',
              border: '1px solid rgba(0,150,255,0.4)',
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
