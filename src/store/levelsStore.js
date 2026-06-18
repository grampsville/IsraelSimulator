import { create } from 'zustand';
import { leaders } from '../data/leaders.js';
import { canFormCoalition } from '../engine/gameEngine.js';
import { campaignDecisions, debateQuestions } from '../data/levelsData.js';

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function computeRivalCoalitionPotential(humanLeaderId, rivalList) {
  // Find rival with highest mandates
  const sorted = [...rivalList].sort((a, b) => b.mandates - a.mandates);
  if (sorted.length === 0) return { potential: 0, rivalLeader: null };

  const topRival = sorted[0];

  // Sum topRival + all compatible allies
  let total = topRival.mandates;
  for (const r of sorted.slice(1)) {
    if (canFormCoalition(topRival.leader, r.leader)) {
      total += r.mandates;
    }
  }

  return { potential: total, rivalLeader: topRival.leader };
}

const initialState = {
  levelsPhase: 'pick',
  humanLeader: null,
  humanMandates: 0,
  leverage: 30,
  rivals: [],
  coalitionPartners: [],
  coalitionMandates: 0,
  rivalCoalitionMandates: 0,
  rivalCoalitionPotential: 0,
  campaignWeek: 0,
  debateQuestionIndex: 0,
  debateAnswers: [],
  electionResults: [],
  electionRevealed: false,
  coalitionRound: 0,
  coalitionLog: [],
  winner: null,
  lastOutcome: '',
};

export const useLevelsStore = create((set, get) => ({
  ...initialState,

  pickLeader: (leaderId) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;

    const rivalLeaders = leaders.filter(l => l.id !== leaderId);
    const rivals = rivalLeaders.map(l => ({
      leader: l,
      mandates: l.startingMandates,
      isAlly: false,
    }));

    const { potential } = computeRivalCoalitionPotential(leaderId, rivals);

    set({
      humanLeader: leader,
      humanMandates: leader.startingMandates,
      leverage: 30,
      rivals,
      coalitionPartners: [],
      coalitionMandates: leader.startingMandates,
      rivalCoalitionMandates: 0,
      rivalCoalitionPotential: potential,
      campaignWeek: 0,
      debateQuestionIndex: 0,
      debateAnswers: [],
      electionResults: [],
      electionRevealed: false,
      coalitionRound: 0,
      coalitionLog: [],
      winner: null,
      lastOutcome: '',
      levelsPhase: 'campaign',
    });
  },

  makeCampaignChoice: (choiceId) => {
    const state = get();
    const { campaignWeek, humanMandates, leverage, rivals } = state;

    const weekData = campaignDecisions[campaignWeek];
    if (!weekData) return;

    const option = weekData.options.find(o => o.id === choiceId);
    if (!option) return;

    const { effects, outcome } = option;

    // Apply effects to human
    let newMandates = Math.max(1, humanMandates + (effects.mandates || 0));
    let newLeverage = Math.max(0, leverage + (effects.leverage || 0));

    // Simulate rival campaigns: each rival gets random -1 to +2 mandates
    let newRivals = rivals.map(r => ({
      ...r,
      mandates: Math.max(1, r.mandates + rnd(-1, 2)),
    }));

    // Attack rival if effect says so
    if (effects.attackRival) {
      const maxRival = newRivals.reduce((best, r) => r.mandates > best.mandates ? r : best, newRivals[0]);
      newRivals = newRivals.map(r =>
        r.leader.id === maxRival.leader.id
          ? { ...r, mandates: Math.max(1, r.mandates - 2) }
          : r
      );
    }

    const nextWeek = campaignWeek + 1;
    const nextPhase = nextWeek >= 3 ? 'debate' : 'campaign';

    set({
      humanMandates: newMandates,
      leverage: newLeverage,
      rivals: newRivals,
      campaignWeek: nextPhase === 'debate' ? campaignWeek : nextWeek,
      lastOutcome: outcome,
      levelsPhase: nextPhase,
    });
  },

  answerDebateQuestion: (answerId) => {
    const state = get();
    const { debateQuestionIndex, humanMandates, leverage, debateAnswers } = state;

    const question = debateQuestions[debateQuestionIndex];
    if (!question) return;

    const answer = question.answers.find(a => a.id === answerId);
    if (!answer) return;

    const { effects, reaction } = answer;

    let newMandates = Math.max(1, humanMandates + (effects.mandates || 0));
    let newLeverage = Math.max(0, leverage + (effects.leverage || 0));

    const nextIndex = debateQuestionIndex + 1;
    const nextPhase = nextIndex >= debateQuestions.length ? 'election' : 'debate';

    set({
      humanMandates: newMandates,
      leverage: newLeverage,
      debateAnswers: [...debateAnswers, { questionId: question.id, answerId }],
      debateQuestionIndex: nextIndex,
      lastOutcome: reaction,
      levelsPhase: nextPhase,
    });
  },

  revealElection: () => {
    const state = get();
    const { humanMandates, rivals } = state;

    // Apply ±3 random variance to human
    const humanVariance = rnd(-3, 3);
    const finalHumanMandates = Math.max(1, humanMandates + humanVariance);

    // Apply ±2 variance to rivals
    const updatedRivals = rivals.map(r => ({
      ...r,
      mandates: Math.max(1, r.mandates + rnd(-2, 2)),
    }));

    // Build election results sorted by mandates
    const allResults = [
      { leader: state.humanLeader, mandates: finalHumanMandates, isHuman: true },
      ...updatedRivals.map(r => ({ leader: r.leader, mandates: r.mandates, isHuman: false })),
    ].sort((a, b) => b.mandates - a.mandates);

    // Recompute rival coalition potential
    const { potential } = computeRivalCoalitionPotential(
      state.humanLeader.id,
      updatedRivals
    );

    set({
      humanMandates: finalHumanMandates,
      rivals: updatedRivals,
      electionResults: allResults,
      electionRevealed: true,
      rivalCoalitionPotential: potential,
      coalitionMandates: finalHumanMandates,
    });
  },

  proceedToCoalition: () => {
    const { humanMandates } = get();
    set({
      levelsPhase: 'coalition',
      rivalCoalitionMandates: 0,
      coalitionMandates: humanMandates,
      coalitionRound: 0,
      coalitionLog: [],
      coalitionPartners: [],
    });
  },

  inviteToCoalition: (leaderId) => {
    const state = get();
    const {
      humanLeader, rivals, coalitionPartners,
      coalitionMandates, rivalCoalitionMandates,
      rivalCoalitionPotential, coalitionRound, coalitionLog,
      leverage,
    } = state;

    const target = rivals.find(r => r.leader.id === leaderId);
    if (!target || target.isAlly) return;

    // Check if coalition is compatible
    const compatible = canFormCoalition(humanLeader, target.leader);

    let accepted = false;
    let logEntry = '';

    if (!compatible) {
      logEntry = `${target.leader.emoji} ${target.leader.nickname} סירב/ה — חוסר תאימות פוליטית`;
    } else {
      // Calculate acceptance probability
      const sameBloc = humanLeader.bloc === target.leader.bloc;
      const baseProb = sameBloc ? 0.70 : 0.45;
      const leverageBonus = Math.min(0.25, leverage / 200); // up to +25% at leverage 50
      const prob = baseProb + leverageBonus;
      accepted = Math.random() < prob;

      if (accepted) {
        logEntry = `✅ ${target.leader.emoji} ${target.leader.nickname} הצטרף/ה לקואליציה! (${target.mandates} מנד׳)`;
      } else {
        logEntry = `❌ ${target.leader.emoji} ${target.leader.nickname} סירב/ה להצטרף`;
      }
    }

    // Update rivals and coalition
    const newRivals = rivals.map(r =>
      r.leader.id === leaderId ? { ...r, isAlly: accepted } : r
    );
    const newPartners = accepted ? [...coalitionPartners, target] : coalitionPartners;
    const newCoalitionMandates = accepted ? coalitionMandates + target.mandates : coalitionMandates;

    // Rival coalition advances
    const rivalGain = rivalCoalitionPotential >= 61 ? rnd(8, 15) : rnd(3, 7);
    const newRivalMandates = Math.min(rivalCoalitionPotential, rivalCoalitionMandates + rivalGain);

    const newLog = [...coalitionLog.slice(-4), logEntry];
    const newRound = coalitionRound + 1;

    // Check win/lose
    let winner = null;
    let nextPhase = state.levelsPhase;

    if (newCoalitionMandates >= 61) {
      winner = 'human';
      nextPhase = 'result';
    } else if (newRivalMandates >= 61) {
      winner = 'rival';
      nextPhase = 'result';
    } else if (newRound >= 4) {
      if (newCoalitionMandates > newRivalMandates) {
        winner = 'human';
      } else if (newRivalMandates > newCoalitionMandates) {
        winner = 'rival';
      } else {
        winner = 'draw';
      }
      nextPhase = 'result';
    }

    set({
      rivals: newRivals,
      coalitionPartners: newPartners,
      coalitionMandates: newCoalitionMandates,
      rivalCoalitionMandates: newRivalMandates,
      coalitionLog: newLog,
      coalitionRound: newRound,
      winner,
      levelsPhase: nextPhase,
    });
  },

  passCoalitionRound: () => {
    const state = get();
    const {
      rivalCoalitionMandates, rivalCoalitionPotential,
      coalitionMandates, coalitionRound, coalitionLog,
    } = state;

    const rivalGain = rivalCoalitionPotential >= 61 ? rnd(8, 15) : rnd(3, 7);
    const newRivalMandates = Math.min(rivalCoalitionPotential, rivalCoalitionMandates + rivalGain);
    const newRound = coalitionRound + 1;
    const newLog = [...coalitionLog.slice(-4), `⏭️ פסת סיבוב — הגוש המתחרה גדל ב-${rivalGain} מנד׳`];

    let winner = null;
    let nextPhase = state.levelsPhase;

    if (newRivalMandates >= 61) {
      winner = 'rival';
      nextPhase = 'result';
    } else if (newRound >= 4) {
      if (coalitionMandates > newRivalMandates) {
        winner = 'human';
      } else if (newRivalMandates > coalitionMandates) {
        winner = 'rival';
      } else {
        winner = 'draw';
      }
      nextPhase = 'result';
    }

    set({
      rivalCoalitionMandates: newRivalMandates,
      coalitionRound: newRound,
      coalitionLog: newLog,
      winner,
      levelsPhase: nextPhase,
    });
  },

  resetLevels: () => set({ ...initialState }),
}));
