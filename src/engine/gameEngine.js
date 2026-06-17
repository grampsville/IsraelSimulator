import { cards } from '../data/cards.js';
import { leaders } from '../data/leaders.js';

// Build a 20-card deck for a leader based on archetype
export function buildDeck(leaderId) {
  const leader = leaders.find(l => l.id === leaderId);
  if (!leader) return [];

  const archetype = leader.deckArchetype;

  // Cards available to all
  const universalCards = cards.filter(c => c.availableTo.includes('all'));
  // Cards specific to this leader
  const leaderCards = cards.filter(c => c.availableTo.includes(leaderId));

  // Archetype deck compositions
  const deckCompositions = {
    survival: {
      campaign: 5, attack: 2, defense: 6, leverage: 3, coalition: 2, secret_leverage: 1, mandate_siphon: 1,
    },
    chaos: {
      campaign: 3, attack: 7, defense: 2, leverage: 3, coalition: 1, secret_leverage: 2, mandate_siphon: 2,
    },
    ideological: {
      campaign: 6, attack: 3, defense: 3, leverage: 3, coalition: 2, secret_leverage: 1, mandate_siphon: 2,
    },
    centrist: {
      campaign: 4, attack: 2, defense: 3, leverage: 4, coalition: 5, secret_leverage: 1, mandate_siphon: 1,
    },
    progressive: {
      campaign: 4, attack: 2, defense: 3, leverage: 3, coalition: 5, secret_leverage: 1, mandate_siphon: 2,
    },
    calculator: {
      campaign: 3, attack: 3, defense: 3, leverage: 6, coalition: 2, secret_leverage: 2, mandate_siphon: 1,
    },
    accumulator: {
      campaign: 3, attack: 2, defense: 4, leverage: 5, coalition: 3, secret_leverage: 2, mandate_siphon: 1,
    },
    blocker: {
      campaign: 4, attack: 2, defense: 6, leverage: 4, coalition: 1, secret_leverage: 1, mandate_siphon: 2,
    },
    'honest-broker': {
      campaign: 5, attack: 1, defense: 4, leverage: 3, coalition: 5, secret_leverage: 0, mandate_siphon: 2,
    },
    wildcard: {
      campaign: 4, attack: 3, defense: 3, leverage: 3, coalition: 3, secret_leverage: 2, mandate_siphon: 2,
    },
  };

  const composition = deckCompositions[archetype] || deckCompositions.centrist;
  const deck = [];

  // Add leader-specific cards first
  leaderCards.forEach(c => {
    deck.push({ ...c, instanceId: `${c.id}_${Math.random().toString(36).slice(2)}` });
  });

  // Fill remaining spots by type
  const cardTypes = ['campaign', 'attack', 'defense', 'leverage', 'coalition', 'secret_leverage', 'mandate_siphon'];
  cardTypes.forEach(type => {
    const needed = Math.max(0, (composition[type] || 0) - deck.filter(c => c.type === type).length);
    const pool = universalCards.filter(c => c.type === type);
    for (let i = 0; i < needed && pool.length > 0; i++) {
      const card = pool[i % pool.length];
      deck.push({ ...card, instanceId: `${card.id}_${Math.random().toString(36).slice(2)}` });
    }
  });

  // Shuffle deck
  return shuffleDeck(deck.slice(0, 20));
}

export function shuffleDeck(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Apply a card's effect to the game state
export function applyCardEffect(card, sourcePlayer, targetPlayer, allPlayers) {
  const updatedPlayers = allPlayers.map(p => ({ ...p }));
  const source = updatedPlayers.find(p => p.id === sourcePlayer.id);
  const target = targetPlayer ? updatedPlayers.find(p => p.id === targetPlayer.id) : null;

  const effect = card.effect;

  switch (effect.type) {
    case 'gain_mandates':
      source.mandates = Math.max(0, source.mandates + effect.amount);
      break;

    case 'lose_mandates':
      if (target) {
        target.mandates = Math.max(0, target.mandates - effect.amount);
      }
      break;

    case 'gain_leverage':
      source.leveragePower = Math.min(100, source.leveragePower + effect.amount);
      break;

    case 'lose_leverage':
      if (target) {
        target.leveragePower = Math.max(0, target.leveragePower - effect.amount);
      }
      break;

    case 'double_leverage':
      source.leveragePower = Math.min(100, source.leveragePower * 2);
      break;

    case 'recover_mandates':
      source.mandates = Math.min(40, source.mandates + effect.amount);
      break;

    case 'recover_leverage':
      source.leveragePower = Math.min(100, source.leveragePower + effect.amount);
      break;

    case 'block_next_attack':
      source.blockNextAttack = true;
      break;

    case 'immunity':
      source.immuneUntilRound = (source.immuneRound || 0) + 1;
      break;

    case 'full_immunity':
      source.immuneUntilRound = (source.immuneRound || 0) + 1;
      break;

    case 'break_coalition':
      if (target) {
        target.coalitionAllies = [];
      }
      break;

    case 'hold_secret':
      if (target) {
        if (!source.secretLeverageTargets) source.secretLeverageTargets = {};
        source.secretLeverageTargets[target.id] = { cardId: card.id, active: true };
      }
      break;

    case 'delayed_attack':
      if (target) {
        if (!source.secretLeverageTargets) source.secretLeverageTargets = {};
        source.secretLeverageTargets[target.id] = { cardId: card.id, amount: effect.amount, active: true };
      }
      break;

    case 'mass_attack':
      updatedPlayers.forEach(p => {
        if (p.id !== source.id) {
          p.mandates = Math.max(0, p.mandates - effect.amount);
        }
      });
      break;

    case 'siphon_mandates': {
      // Find a player to siphon from
      const candidates = updatedPlayers.filter(p => p.id !== source.id && !p.isEliminated && p.mandates > 0);
      if (candidates.length > 0) {
        const victim = candidates[Math.floor(Math.random() * candidates.length)];
        const stolen = Math.min(effect.amount, victim.mandates);
        victim.mandates -= stolen;
        source.mandates += stolen;
      }
      break;
    }

    case 'coalition_offer':
      if (target && !source.coalitionAllies.includes(target.id)) {
        source.coalitionAllies.push(target.id);
        if (!target.coalitionAllies.includes(source.id)) {
          target.coalitionAllies.push(source.id);
        }
      }
      break;

    case 'form_alliance':
      if (target && !source.coalitionAllies.includes(target.id)) {
        source.coalitionAllies.push(target.id);
        if (!target.coalitionAllies.includes(source.id)) {
          target.coalitionAllies.push(source.id);
        }
      }
      break;

    case 'kingmaker':
      source.coalitionAllies.forEach(allyId => {
        const ally = updatedPlayers.find(p => p.id === allyId);
        if (ally) {
          ally.leveragePower = Math.min(100, ally.leveragePower + (effect.leverage_bonus || 5));
        }
      });
      break;

    case 'cross_bloc_coalition':
      if (target) {
        if (!source.coalitionAllies.includes(target.id)) {
          source.coalitionAllies.push(target.id);
        }
        source.leveragePower = Math.min(100, source.leveragePower + (effect.leverage || 8));
      }
      break;

    case 'instant_cross_bloc':
      if (target) {
        if (!source.coalitionAllies.includes(target.id)) {
          source.coalitionAllies.push(target.id);
        }
        source.leveragePower = Math.min(100, source.leveragePower + (effect.leverage || 10));
      }
      break;

    case 'chaos_attack':
      source.mandates += effect.self_gain || 2;
      updatedPlayers.forEach(p => {
        if (p.id !== source.id && !p.isEliminated) {
          p.mandates = Math.max(0, p.mandates - (effect.others_loss || 1));
        }
      });
      break;

    case 'conditional_mandates': {
      const cond = effect.condition;
      if (cond && source.leader && source.leader.stats) {
        const statVal = source.leader.stats[cond.stat] || 0;
        if (statVal > cond.threshold) {
          source.mandates += effect.amount;
        } else {
          source.mandates += 1; // partial benefit
        }
      } else {
        source.mandates += 1;
      }
      break;
    }

    case 'coalition_scaled_gain': {
      const allyCount = source.coalitionAllies ? source.coalitionAllies.length : 0;
      source.mandates += (allyCount * effect.amount) + 1;
      break;
    }

    case 'bloc_leverage': {
      const allyCount = source.coalitionAllies ? source.coalitionAllies.length : 0;
      source.leveragePower = Math.min(100, source.leveragePower + (allyCount * effect.amount));
      break;
    }

    case 'veto_law':
      source.leveragePower = Math.min(100, source.leveragePower + (effect.leverage || 5));
      break;

    case 'combo':
      if (effect.effects) {
        effect.effects.forEach(subEffect => {
          const subCard = { ...card, effect: subEffect };
          applyCardEffect(subCard, source, target, updatedPlayers);
        });
      }
      break;

    case 'bloc_bonus':
      if (effect.blocs) {
        updatedPlayers.forEach(p => {
          if (effect.blocs.includes(p.leader.bloc)) {
            p.mandates += effect.amount || 2;
          }
        });
      }
      break;

    default:
      // Unknown effect, apply small gain
      source.mandates += 1;
      break;
  }

  return updatedPlayers;
}

// Check if any player is below the threshold
export function checkThresholds(players) {
  return players
    .filter(p => !p.isEliminated)
    .filter(p => p.mandates <= 4)
    .map(p => p.id);
}

// Check if any player can form a 61-mandate coalition
export function checkCoalitionPossible(players) {
  const activePlayers = players.filter(p => !p.isEliminated);

  for (const player of activePlayers) {
    const allyIds = [player.id, ...(player.coalitionAllies || [])];
    const totalMandates = activePlayers
      .filter(p => allyIds.includes(p.id))
      .reduce((sum, p) => sum + p.mandates, 0);

    if (totalMandates >= 61) {
      return { possible: true, leaderId: player.id, totalMandates };
    }
  }
  return { possible: false };
}

// Resolve event card effects on all players
export function resolveEventCard(event, players) {
  const updatedPlayers = players.map(p => ({ ...p }));
  const effect = event.effect;

  switch (effect.type) {
    case 'stat_bonus': {
      updatedPlayers.forEach(p => {
        if (!p.isEliminated && p.leader.stats[effect.stat] > effect.threshold) {
          p.mandates += effect.amount;
        }
      });
      break;
    }
    case 'stat_penalty': {
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) {
          const statVal = p.leader.stats[effect.stat];
          if (effect.direction === 'below' && statVal < effect.threshold) {
            p.mandates = Math.max(0, p.mandates - effect.amount);
          } else if (effect.direction !== 'below' && statVal > effect.threshold) {
            p.mandates = Math.max(0, p.mandates - effect.amount);
          }
        }
      });
      break;
    }
    case 'leader_bonus': {
      if (effect.target === 'highest_mandate') {
        const highest = updatedPlayers.filter(p => !p.isEliminated).sort((a, b) => b.mandates - a.mandates)[0];
        if (highest) highest.mandates += effect.amount;
      }
      break;
    }
    case 'leader_penalty': {
      if (effect.target === 'highest_mandate') {
        const highest = updatedPlayers.filter(p => !p.isEliminated).sort((a, b) => b.mandates - a.mandates)[0];
        if (highest) highest.mandates = Math.max(0, highest.mandates - effect.amount);
      }
      break;
    }
    case 'global_gain':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) p.mandates += effect.amount;
      });
      break;
    case 'global_loss':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) p.mandates = Math.max(0, p.mandates - effect.amount);
      });
      break;
    case 'global_loss_with_exception':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) {
          if (p.leader.stats[effect.exception.stat] > effect.exception.threshold) {
            p.mandates += effect.exception.bonus;
          } else {
            p.mandates = Math.max(0, p.mandates - effect.amount);
          }
        }
      });
      break;
    case 'bloc_conflict':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) {
          if (p.leader.bloc === effect.losers) {
            p.mandates = Math.max(0, p.mandates - effect.loss);
          } else if (Array.isArray(effect.winners) && effect.winners.includes(p.leader.bloc)) {
            p.mandates += effect.gain;
          }
        }
      });
      break;
    case 'bloc_ruling':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) {
          if (p.leader.bloc === effect.losers) {
            p.mandates = Math.max(0, p.mandates - effect.loss);
          } else if (Array.isArray(effect.winners) && effect.winners.includes(p.leader.bloc)) {
            p.mandates += effect.gain;
          }
        }
      });
      break;
    case 'bloc_shift':
      updatedPlayers.forEach(p => {
        if (!p.isEliminated) {
          if (p.leader.bloc === effect.winners) {
            p.mandates += effect.gain;
          } else if (p.leader.bloc === effect.losers) {
            p.mandates = Math.max(0, p.mandates - effect.loss);
          }
        }
      });
      break;
    case 'break_all_coalitions':
      updatedPlayers.forEach(p => {
        p.coalitionAllies = [];
        if (!p.isEliminated && effect.bonus) p.mandates += effect.bonus;
      });
      break;
    case 'mandate_redistribution': {
      const sorted = updatedPlayers.filter(p => !p.isEliminated).sort((a, b) => b.mandates - a.mandates);
      if (sorted.length >= 2) {
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];
        const transfer = Math.min(effect.amount, top.mandates - 1);
        top.mandates -= transfer;
        bottom.mandates += transfer;
      }
      break;
    }
    case 'leverage_transfer': {
      const sorted = updatedPlayers.filter(p => !p.isEliminated).sort((a, b) => b.leveragePower - a.leveragePower);
      if (sorted.length >= 2) {
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];
        const transfer = Math.min(effect.amount, top.leveragePower);
        top.leveragePower -= transfer;
        bottom.leveragePower += transfer;
      }
      break;
    }
    case 'top_stat_penalty': {
      const topStatPlayer = updatedPlayers
        .filter(p => !p.isEliminated)
        .sort((a, b) => (b.leader.stats[effect.stat] || 0) - (a.leader.stats[effect.stat] || 0))[0];
      if (topStatPlayer) {
        topStatPlayer.mandates = Math.max(0, topStatPlayer.mandates - effect.amount);
      }
      break;
    }
    default:
      break;
  }

  // Eliminate players below threshold
  updatedPlayers.forEach(p => {
    if (!p.isEliminated && p.mandates <= 0) {
      p.isEliminated = true;
    }
  });

  return updatedPlayers;
}

// Calculate FIFA-style overall from 7 stats
export function calculateOverall(stats) {
  const weights = {
    POL: 0.25,
    MED: 0.15,
    SEC: 0.15,
    ECO: 0.12,
    STR: 0.12,
    INT: 0.11,
    REL: 0.10,
  };
  let total = 0;
  let weightSum = 0;
  Object.entries(stats).forEach(([key, value]) => {
    const weight = weights[key] || 0.1;
    total += value * weight;
    weightSum += weight;
  });
  return Math.round(total / weightSum);
}
