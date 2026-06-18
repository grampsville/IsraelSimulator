import { create } from 'zustand';
import { leaders } from '../data/leaders.js';
import { events } from '../data/events.js';
import { buildDeck, shuffleDeck, applyCardEffect, checkThresholds, checkCoalitionPossible, resolveEventCard } from '../engine/gameEngine.js';
import { getBotAction } from '../engine/botAI.js';

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const createPlayer = (leader, isHuman = false) => ({
  id: leader.id,
  isHuman,
  leader,
  mandates: leader.startingMandates,
  leveragePower: 50,
  hand: [],
  deck: [],
  discardPile: [],
  secretLeverageTargets: {},
  coalitionAllies: [],
  thresholdWarnings: 0,
  isEliminated: false,
  upgrades: [],
  blockNextAttack: false,
  immuneRound: 0,
  lastPlayedCard: null,
});

const drawCards = (player, count = 1) => {
  const updated = { ...player, hand: [...player.hand], deck: [...player.deck], discardPile: [...player.discardPile] };
  for (let i = 0; i < count; i++) {
    if (updated.deck.length === 0 && updated.discardPile.length > 0) {
      updated.deck = shuffleDeck([...updated.discardPile]);
      updated.discardPile = [];
    }
    if (updated.deck.length > 0 && updated.hand.length < 5) {
      const card = updated.deck.shift();
      updated.hand.push(card);
    }
  }
  return updated;
};

export const useGameStore = create((set, get) => ({
  // Setup
  selectedLeaderId: null,
  gamePhase: 'home',

  // Game state
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  maxRounds: 21,
  actionPoints: 2,

  // Board
  currentEventCard: null,
  eventDeck: [],
  lastAction: null,
  thresholdPlayers: [],
  coalitionStatus: null,
  winner: null,
  gameLog: [],

  // UI state
  selectedCard: null,
  selectedTarget: null,
  pendingSpecialAction: null, // { type: 'recycle_pick', count: N } when human plays a recycle card

  selectLeader: (id) => set({ selectedLeaderId: id }),

  startGame: () => {
    const { selectedLeaderId } = get();
    if (!selectedLeaderId) return;

    // Human player
    const humanLeader = leaders.find(l => l.id === selectedLeaderId);
    const humanDeck = buildDeck(selectedLeaderId);
    let humanPlayer = createPlayer(humanLeader, true);
    humanPlayer.deck = humanDeck;
    humanPlayer = drawCards(humanPlayer, 5);

    // Bot players (remaining leaders)
    const botLeaders = leaders.filter(l => l.id !== selectedLeaderId);
    const botPlayers = botLeaders.map(leader => {
      const deck = buildDeck(leader.id);
      let bot = createPlayer(leader, false);
      bot.deck = deck;
      bot = drawCards(bot, 5);
      return bot;
    });

    // Shuffle event deck
    const eventDeck = shuffleArray([...events]);

    // First event card
    const currentEventCard = eventDeck.shift();

    // All players: human first, then bots
    const allPlayers = [humanPlayer, ...botPlayers];

    // Apply first event
    const playersAfterEvent = resolveEventCard(currentEventCard, allPlayers);

    set({
      players: playersAfterEvent,
      currentPlayerIndex: 0,
      round: 1,
      gamePhase: 'game',
      eventDeck,
      currentEventCard,
      actionPoints: 2,
      lastAction: null,
      thresholdPlayers: checkThresholds(playersAfterEvent),
      coalitionStatus: null,
      winner: null,
      gameLog: [`מישחק התחיל! אירוע ראשון: ${currentEventCard.name}`],
    });
  },

  playCard: (cardInstanceId, targetId) => {
    const state = get();
    const { players, currentPlayerIndex, actionPoints, round } = state;

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isHuman) return;
    if (actionPoints <= 0) return;

    const cardIndex = currentPlayer.hand.findIndex(c => c.instanceId === cardInstanceId);
    if (cardIndex === -1) return;

    const card = currentPlayer.hand[cardIndex];
    if (card.cost > actionPoints) return;

    const targetPlayer = players.find(p => p.id === targetId);

    // Check immunity
    if (targetPlayer && targetPlayer.immuneRound >= round && card.type === 'attack') {
      set({ gameLog: [...state.gameLog, `${targetPlayer.leader.nickname || targetPlayer.leader.name} חסין לתקיפה!`] });
      return;
    }

    // Check block
    if (targetPlayer && targetPlayer.blockNextAttack && card.type === 'attack') {
      const updatedPlayers = players.map(p => {
        if (p.id === targetPlayer.id) return { ...p, blockNextAttack: false };
        return p;
      });
      set({
        players: updatedPlayers,
        gameLog: [...state.gameLog, `${targetPlayer.leader.nickname || targetPlayer.leader.name} חסם את התקיפה!`],
      });
      return;
    }

    // Intercept recycle_pick for human — show picker UI instead of auto-resolving
    const isRecyclePick = card.effect?.type === 'recycle_pick' ||
      (card.effect?.type === 'combo' && card.effect.effects?.some(e => e.type === 'recycle_pick'));

    if (isRecyclePick) {
      // First remove card from hand, deduct AP
      const updatedPlayers = players.map(p => {
        if (p.id === currentPlayer.id) {
          const newHand = p.hand.filter(c => c.instanceId !== cardInstanceId);
          return { ...p, hand: newHand, discardPile: [...p.discardPile, card], lastPlayedCard: card };
        }
        return p;
      });
      const count = card.effect?.count || card.effect?.effects?.find(e => e.type === 'recycle_pick')?.count || 1;
      set({
        players: updatedPlayers,
        actionPoints: actionPoints - card.cost,
        pendingSpecialAction: { type: 'recycle_pick', count },
        selectedCard: null,
        selectedTarget: null,
        gameLog: [...state.gameLog.slice(-20), `${currentPlayer.leader.nickname || currentPlayer.leader.name} שיחק: ${card.name}`],
      });
      return;
    }

    // Apply card effect
    let updatedPlayers = applyCardEffect(card, currentPlayer, targetPlayer, players);

    // Remove card from hand, add to discard, track last played
    updatedPlayers = updatedPlayers.map(p => {
      if (p.id === currentPlayer.id) {
        const newHand = [...p.hand];
        const idx = newHand.findIndex(c => c.instanceId === cardInstanceId);
        if (idx !== -1) newHand.splice(idx, 1);
        return { ...p, hand: newHand, discardPile: [...p.discardPile, card], lastPlayedCard: card };
      }
      return p;
    });

    // Eliminate players at 0 mandates
    updatedPlayers = updatedPlayers.map(p => ({
      ...p,
      isEliminated: p.isEliminated || p.mandates <= 0,
    }));

    const thresholdPlayers = checkThresholds(updatedPlayers);
    const coalitionStatus = checkCoalitionPossible(updatedPlayers);
    const newActionPoints = actionPoints - card.cost;

    const logMsg = `${currentPlayer.leader.name} שיחק: ${card.name}${targetPlayer && targetPlayer.id !== currentPlayer.id ? ` → ${targetPlayer.leader.name}` : ''}`;

    set({
      players: updatedPlayers,
      actionPoints: newActionPoints,
      thresholdPlayers,
      coalitionStatus: coalitionStatus.possible ? coalitionStatus : null,
      gameLog: [...state.gameLog.slice(-20), logMsg],
      selectedCard: null,
      selectedTarget: null,
      lastAction: { type: 'playCard', card, targetId },
    });

    // Check win condition
    if (coalitionStatus.possible) {
      const winner = updatedPlayers.find(p => p.id === coalitionStatus.leaderId);
      if (winner) {
        setTimeout(() => set({ gamePhase: 'coalition', winner }), 500);
      }
    }
  },

  endTurn: () => {
    const state = get();
    const { players, currentPlayerIndex, round, maxRounds, eventDeck } = state;

    // Human ends turn — now bot turns run
    let updatedPlayers = [...players];
    let currentIdx = currentPlayerIndex;
    let currentRound = round;
    let currentEventCard = state.currentEventCard;
    let currentEventDeck = [...eventDeck];
    const gameLog = [...state.gameLog];

    // Draw a card for human
    updatedPlayers = updatedPlayers.map((p, i) => {
      if (i === currentIdx) return drawCards(p, 1);
      return p;
    });

    // Advance to next player
    currentIdx = (currentIdx + 1) % updatedPlayers.length;

    // Run bot turns
    while (currentIdx !== 0) {
      const bot = updatedPlayers[currentIdx];
      if (!bot.isEliminated) {
        // Bot draws a card
        updatedPlayers = updatedPlayers.map((p, i) => {
          if (i === currentIdx) return drawCards(p, 1);
          return p;
        });

        // Bot takes 2 actions
        for (let action = 0; action < 2; action++) {
          const botState = { ...state, players: updatedPlayers, round: currentRound };
          const botAction = getBotAction(updatedPlayers[currentIdx], botState);

          if (botAction) {
            const currentBot = updatedPlayers[currentIdx];
            const cardIndex = currentBot.hand.findIndex(c => c.instanceId === botAction.cardId);
            if (cardIndex !== -1) {
              const card = currentBot.hand[cardIndex];
              const targetPlayer = updatedPlayers.find(p => p.id === botAction.targetId);

              // Apply effect
              updatedPlayers = applyCardEffect(card, currentBot, targetPlayer, updatedPlayers);

              // Remove card from bot hand, track last played
              updatedPlayers = updatedPlayers.map(p => {
                if (p.id === currentBot.id) {
                  const newHand = p.hand.filter(c => c.instanceId !== botAction.cardId);
                  return { ...p, hand: newHand, discardPile: [...p.discardPile, card], lastPlayedCard: card };
                }
                return p;
              });

              gameLog.push(`${currentBot.leader.name}: ${card.name}`);
            }
          }
        }
      }

      currentIdx = (currentIdx + 1) % updatedPlayers.length;

      // New round when we wrap back to player 0
      if (currentIdx === 0) {
        currentRound++;
        // New event card
        if (currentEventDeck.length > 0) {
          currentEventCard = currentEventDeck.shift();
          updatedPlayers = resolveEventCard(currentEventCard, updatedPlayers);
          gameLog.push(`אירוע חדש: ${currentEventCard.name}`);
        }
      }
    }

    // Eliminate players at 0 mandates
    updatedPlayers = updatedPlayers.map(p => ({
      ...p,
      isEliminated: p.isEliminated || p.mandates <= 0,
    }));

    const thresholdPlayers = checkThresholds(updatedPlayers);
    const coalitionStatus = checkCoalitionPossible(updatedPlayers);

    // Check end conditions
    const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
    if (currentRound > maxRounds || activePlayers.length <= 1) {
      const winnerPlayer = activePlayers.sort((a, b) => b.mandates - a.mandates)[0];
      set({
        players: updatedPlayers,
        currentPlayerIndex: 0,
        round: currentRound,
        gamePhase: 'end',
        currentEventCard,
        eventDeck: currentEventDeck,
        actionPoints: 2,
        thresholdPlayers,
        winner: winnerPlayer,
        gameLog: gameLog.slice(-30),
      });
      return;
    }

    if (coalitionStatus.possible) {
      const winnerPlayer = updatedPlayers.find(p => p.id === coalitionStatus.leaderId);
      set({
        players: updatedPlayers,
        currentPlayerIndex: 0,
        round: currentRound,
        gamePhase: 'coalition',
        currentEventCard,
        eventDeck: currentEventDeck,
        actionPoints: 2,
        thresholdPlayers,
        coalitionStatus,
        winner: winnerPlayer,
        gameLog: gameLog.slice(-30),
      });
      return;
    }

    set({
      players: updatedPlayers,
      currentPlayerIndex: 0,
      round: currentRound,
      currentEventCard,
      eventDeck: currentEventDeck,
      actionPoints: 2,
      thresholdPlayers,
      coalitionStatus: coalitionStatus.possible ? coalitionStatus : null,
      gameLog: gameLog.slice(-30),
    });
  },

  drawCardsAction: () => {
    const { players, currentPlayerIndex } = get();
    const updatedPlayers = players.map((p, i) => {
      if (i === currentPlayerIndex && p.isHuman) return drawCards(p, 1);
      return p;
    });
    set({ players: updatedPlayers });
  },

  selectCard: (cardInstanceId) => set({ selectedCard: cardInstanceId }),
  selectTarget: (playerId) => set({ selectedTarget: playerId }),
  clearSelection: () => set({ selectedCard: null, selectedTarget: null }),

  // Called when human picks cards from their discard pile to recycle
  resolveRecyclePick: (cardInstanceIds) => {
    const { players, currentPlayerIndex } = get();
    const updatedPlayers = players.map((p, i) => {
      if (i === currentPlayerIndex && p.isHuman) {
        const picked = p.discardPile.filter(c => cardInstanceIds.includes(c.instanceId));
        const newDiscard = p.discardPile.filter(c => !cardInstanceIds.includes(c.instanceId));
        const newHand = [...p.hand, ...picked].slice(0, 5);
        return { ...p, hand: newHand, discardPile: newDiscard };
      }
      return p;
    });
    set({ players: updatedPlayers, pendingSpecialAction: null });
  },

  cancelSpecialAction: () => set({ pendingSpecialAction: null }),

  startCardGame: () => set({ gamePhase: 'team_select', selectedLeaderId: null }),

  startLevelsGame: () => set({ gamePhase: 'levels_game' }),

  restartGame: () => set({
    selectedLeaderId: null,
    gamePhase: 'home',
    players: [],
    currentPlayerIndex: 0,
    round: 1,
    actionPoints: 2,
    currentEventCard: null,
    eventDeck: [],
    lastAction: null,
    thresholdPlayers: [],
    coalitionStatus: null,
    winner: null,
    gameLog: [],
    selectedCard: null,
    selectedTarget: null,
    pendingSpecialAction: null,
  }),

  forceEndGame: () => {
    const { players } = get();
    const winnerPlayer = players.filter(p => !p.isEliminated).sort((a, b) => b.mandates - a.mandates)[0];
    set({ gamePhase: 'end', winner: winnerPlayer });
  },
}));
