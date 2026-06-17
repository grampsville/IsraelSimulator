// Bot AI — returns { cardId, targetId } for a bot's turn
import { canFormCoalition } from './gameEngine.js';

// Returns only players this bot can realistically coalition with
function compatibleAllies(bot, activePlayers) {
  return activePlayers.filter(p =>
    !p.isEliminated &&
    p.id !== bot.id &&
    !(bot.coalitionAllies || []).includes(p.id) &&
    canFormCoalition(bot, p, false)
  );
}

export function getBotAction(bot, gameState) {
  const { players } = gameState;
  const archetype = bot.leader.deckArchetype;
  const hand = bot.hand || [];

  if (hand.length === 0) return null;

  const activePlayers = players.filter(p => !p.isEliminated && p.id !== bot.id);

  // Pick strategy based on archetype
  switch (archetype) {
    case 'survival':
      return survivalStrategy(bot, hand, activePlayers, gameState);
    case 'chaos':
      return chaosStrategy(bot, hand, activePlayers, gameState);
    case 'ideological':
      return ideologicalStrategy(bot, hand, activePlayers, gameState);
    case 'centrist':
      return centristStrategy(bot, hand, activePlayers, gameState);
    case 'progressive':
      return progressiveStrategy(bot, hand, activePlayers, gameState);
    case 'calculator':
      return calculatorStrategy(bot, hand, activePlayers, gameState);
    case 'accumulator':
      return accumulatorStrategy(bot, hand, activePlayers, gameState);
    case 'blocker':
      return blockerStrategy(bot, hand, activePlayers, gameState);
    case 'honest-broker':
      return honestBrokerStrategy(bot, hand, activePlayers, gameState);
    case 'wildcard':
      return wildcardStrategy(bot, hand, activePlayers, gameState);
    default:
      return defaultStrategy(bot, hand, activePlayers, gameState);
  }
}

// Utility: find strongest opponent
function findStrongestOpponent(activePlayers) {
  return activePlayers.sort((a, b) => b.mandates - a.mandates)[0] || null;
}

// Utility: find weakest opponent
function findWeakestOpponent(activePlayers) {
  return activePlayers.sort((a, b) => a.mandates - b.mandates)[0] || null;
}

// Utility: find card by type in hand
function findCardByType(hand, type) {
  return hand.find(c => c.type === type);
}

// Utility: find best attack card
function findBestAttackCard(hand) {
  const attackCards = hand.filter(c => c.type === 'attack');
  if (!attackCards.length) return null;
  return attackCards.sort((a, b) => {
    const aCost = a.effect?.amount || 1;
    const bCost = b.effect?.amount || 1;
    return bCost - aCost;
  })[0];
}

// Utility: find best campaign card
function findBestCampaignCard(hand) {
  const campaignCards = hand.filter(c => c.type === 'campaign');
  if (!campaignCards.length) return null;
  return campaignCards.sort((a, b) => (b.effect?.amount || 1) - (a.effect?.amount || 1))[0];
}

// Utility: find best defense card
function findBestDefenseCard(hand) {
  return hand.find(c => c.type === 'defense') || null;
}

// Survival: protect own mandates, hoard coalition options
function survivalStrategy(bot, hand, activePlayers, gameState) {
  // If low on mandates, defend
  if (bot.mandates < 8) {
    const defCard = findBestDefenseCard(hand);
    if (defCard) return { cardId: defCard.instanceId, targetId: bot.id };
  }

  // If someone can form coalition, attack them
  const coalitionThreat = activePlayers.find(p => {
    const allyIds = [p.id, ...(p.coalitionAllies || [])];
    const totalMandates = activePlayers.filter(a => allyIds.includes(a.id)).reduce((s, a) => s + a.mandates, 0);
    return totalMandates >= 55;
  });

  if (coalitionThreat) {
    const attackCard = findBestAttackCard(hand);
    if (attackCard) return { cardId: attackCard.instanceId, targetId: coalitionThreat.id };
  }

  // Otherwise campaign
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  // Fallback
  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Chaos: play high-risk cards, target strongest player
function chaosStrategy(bot, hand, activePlayers, gameState) {
  const strongest = findStrongestOpponent(activePlayers);

  // Always try to attack the strongest
  const attackCard = findBestAttackCard(hand);
  if (attackCard && strongest) {
    return { cardId: attackCard.instanceId, targetId: strongest.id };
  }

  // Secret leverage
  const secretCard = hand.find(c => c.type === 'secret_leverage');
  if (secretCard && strongest) {
    return { cardId: secretCard.instanceId, targetId: strongest.id };
  }

  // Chaos specific card
  const chaosCard = hand.find(c => c.id === 'chaos_agent');
  if (chaosCard) return { cardId: chaosCard.instanceId, targetId: bot.id };

  // Campaign fallback
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  return { cardId: hand[0].instanceId, targetId: strongest?.id || bot.id };
}

// Ideological: hold out for policy wins, never join opposite bloc
function ideologicalStrategy(bot, hand, activePlayers, gameState) {
  // Campaign first — ideology
  const ideologyCard = hand.find(c => c.id === 'ideological_purity' || c.type === 'campaign');
  if (ideologyCard) return { cardId: ideologyCard.instanceId, targetId: bot.id };

  // Only coalition with compatible parties
  const allyCard = hand.find(c => c.type === 'coalition');
  if (allyCard) {
    const viable = compatibleAllies(bot, activePlayers);
    if (viable.length > 0) return { cardId: allyCard.instanceId, targetId: viable[0].id };
  }

  // Defense if threatened
  if (bot.mandates < 6) {
    const defCard = findBestDefenseCard(hand);
    if (defCard) return { cardId: defCard.instanceId, targetId: bot.id };
  }

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Centrist: actively build broad coalitions
function centristStrategy(bot, hand, activePlayers, gameState) {
  // Prioritize coalition building
  const coalitionCard = findCardByType(hand, 'coalition');
  if (coalitionCard) {
    const viable = compatibleAllies(bot, activePlayers);
    if (viable.length > 0) return { cardId: coalitionCard.instanceId, targetId: viable[0].id };
  }

  // Campaign second
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  // Leverage third
  const leverageCard = findCardByType(hand, 'leverage');
  if (leverageCard) return { cardId: leverageCard.instanceId, targetId: bot.id };

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Progressive: cross-bloc surprise alliances
function progressiveStrategy(bot, hand, activePlayers, gameState) {
  // Look for cross-bloc alliance opportunity
  const crossBlocCard = hand.find(c => c.id === 'cross_bloc_surprise' || c.id === 'peace_coalition');
  if (crossBlocCard) {
    const crossBlocTarget = activePlayers.find(p =>
      p.leader.bloc !== bot.leader.bloc &&
      p.leader.bloc !== 'right' &&
      canFormCoalition(bot, p, true)
    );
    if (crossBlocTarget) return { cardId: crossBlocCard.instanceId, targetId: crossBlocTarget.id };
  }

  // Campaign
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  // Coalition
  const coalitionCard = findCardByType(hand, 'coalition');
  if (coalitionCard) {
    const viable = compatibleAllies(bot, activePlayers);
    if (viable.length > 0) return { cardId: coalitionCard.instanceId, targetId: viable[0].id };
  }

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Calculator: wait for maximum leverage moment
function calculatorStrategy(bot, hand, activePlayers, gameState) {
  const { round, maxRounds } = gameState;

  // Early game: build leverage
  if (round < maxRounds * 0.6) {
    const leverageCard = findCardByType(hand, 'leverage');
    if (leverageCard) return { cardId: leverageCard.instanceId, targetId: bot.id };

    const campaignCard = findBestCampaignCard(hand);
    if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };
  }

  // Late game: spend leverage, attack
  const attackCard = findBestAttackCard(hand);
  const strongest = findStrongestOpponent(activePlayers);
  if (attackCard && strongest) {
    return { cardId: attackCard.instanceId, targetId: strongest.id };
  }

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Accumulator: store leverage, strike late
function accumulatorStrategy(bot, hand, activePlayers, gameState) {
  const { round, maxRounds } = gameState;

  // Always build leverage early
  if (round < maxRounds * 0.7) {
    const leverageCard = findCardByType(hand, 'leverage');
    if (leverageCard) return { cardId: leverageCard.instanceId, targetId: bot.id };

    const secretCard = hand.find(c => c.type === 'secret_leverage');
    if (secretCard && activePlayers.length > 0) {
      const target = findStrongestOpponent(activePlayers);
      return { cardId: secretCard.instanceId, targetId: target?.id || activePlayers[0].id };
    }
  }

  // Late: deploy everything
  const attackCard = findBestAttackCard(hand);
  const strongest = findStrongestOpponent(activePlayers);
  if (attackCard && strongest) return { cardId: attackCard.instanceId, targetId: strongest.id };

  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Blocker: single-issue focus (prevent coalitions, defend)
function blockerStrategy(bot, hand, activePlayers, gameState) {
  // Block coalition threats
  const disruptCard = hand.find(c => c.id === 'coalition_disruption');
  const coalitionThreat = activePlayers.find(p => (p.coalitionAllies || []).length > 0);
  if (disruptCard && coalitionThreat) {
    return { cardId: disruptCard.instanceId, targetId: coalitionThreat.id };
  }

  // Defense always
  const defCard = findBestDefenseCard(hand);
  if (defCard) return { cardId: defCard.instanceId, targetId: bot.id };

  // Campaign
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Honest broker: no secret leverage, build trust slowly
function honestBrokerStrategy(bot, hand, activePlayers, gameState) {
  // Never play secret leverage (skip if available)
  const nonSecretHand = hand.filter(c => c.type !== 'secret_leverage');

  // Build coalitions openly
  const coalitionCard = findCardByType(nonSecretHand, 'coalition');
  if (coalitionCard) {
    const viable = compatibleAllies(bot, activePlayers);
    if (viable.length > 0) return { cardId: coalitionCard.instanceId, targetId: viable[0].id };
  }

  // Campaign
  const campaignCard = findBestCampaignCard(nonSecretHand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  if (nonSecretHand.length > 0) return { cardId: nonSecretHand[0].instanceId, targetId: bot.id };
  return { cardId: hand[0].instanceId, targetId: bot.id };
}

// Wildcard: random but smart pivot moves
function wildcardStrategy(bot, hand, activePlayers, gameState) {
  // Random strategy each turn
  const roll = Math.random();

  if (roll < 0.3) {
    // Attack strongest
    const attackCard = findBestAttackCard(hand);
    const strongest = findStrongestOpponent(activePlayers);
    if (attackCard && strongest) return { cardId: attackCard.instanceId, targetId: strongest.id };
  } else if (roll < 0.5) {
    // Form surprise coalition
    const coalitionCard = findCardByType(hand, 'coalition');
    if (coalitionCard) {
      const viable = compatibleAllies(bot, activePlayers);
      if (viable.length > 0) {
        const random = viable[Math.floor(Math.random() * viable.length)];
        return { cardId: coalitionCard.instanceId, targetId: random.id };
      }
    }
  } else if (roll < 0.7) {
    // Campaign
    const campaignCard = findBestCampaignCard(hand);
    if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };
  }

  // Default: random card
  const randomCard = hand[Math.floor(Math.random() * hand.length)];
  const randomTarget = Math.random() > 0.5 && activePlayers.length > 0
    ? activePlayers[Math.floor(Math.random() * activePlayers.length)]
    : bot;
  return { cardId: randomCard.instanceId, targetId: randomTarget.id };
}

// Default strategy
function defaultStrategy(bot, hand, activePlayers, gameState) {
  const campaignCard = findBestCampaignCard(hand);
  if (campaignCard) return { cardId: campaignCard.instanceId, targetId: bot.id };

  const attackCard = findBestAttackCard(hand);
  const target = findStrongestOpponent(activePlayers);
  if (attackCard && target) return { cardId: attackCard.instanceId, targetId: target.id };

  return { cardId: hand[0].instanceId, targetId: bot.id };
}
