// Ember Court rules, with no drawing and no browser in it: two 30-life
// duelists, ember that grows each round, hands drawn from a 30-card deck,
// a rotating ward court, and an AI Warden. Every function here is pure
// state in, events out, so the same code can be playtested in Node.
import {
  CARD_POOL, COURTS, MAX_EMBER, MAX_HAND, MAX_HP, START_EMBER,
  START_HAND, WARD_CYCLE, courtBeats, strikeDamage,
} from './config.js';
import { buildDeck, drawCards } from './deck.js';
import { createRandom } from './random.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_OVER = 'over';

function newSide(random) {
  return {
    hp: MAX_HP, armor: 0, ember: START_EMBER, ward: null,
    deck: buildDeck(random), hand: [], discard: [], maxHand: MAX_HAND,
    lastPlayed: null,
  };
}

export function createGame(seed) {
  const random = createRandom(seed);
  const game = {
    seed, random, phase: PHASE_TITLE, round: 1, turn: 0,
    you: newSide(random), foe: newSide(random),
    foeWardIndex: 0, log: [], winner: null,
    damageDealt: 0, damageTaken: 0, cardsPlayed: 0,
  };
  game.foe.ward = WARD_CYCLE[0];
  game.you.ward = 'flame';
  drawCards(game, 'you', START_HAND);
  drawCards(game, 'foe', START_HAND);
  game.log.push('The Ember Court convenes. The Warden raises a Flame ward.');
  return game;
}

export function startDuel(game) {
  if (game.phase !== PHASE_TITLE) return false;
  game.phase = PHASE_PLAY;
  game.log.push('Duel begins — play a card, then end your turn.');
  return true;
}

function dealDamage(game, target, amount, sourceName) {
  const side = game[target];
  let left = amount;
  if (side.armor > 0) {
    const blocked = Math.min(side.armor, left);
    side.armor -= blocked;
    left -= blocked;
    if (blocked > 0) game.log.push(`${sourceName} is blocked by ${blocked} armor.`);
  }
  if (left > 0) {
    side.hp = Math.max(0, side.hp - left);
    if (target === 'foe') game.damageDealt += left;
    else game.damageTaken += left;
  }
  return left;
}

function finishIfOver(game) {
  if (game.foe.hp <= 0 && game.you.hp <= 0) {
    game.winner = 'draw';
  } else if (game.foe.hp <= 0) {
    game.winner = 'you';
  } else if (game.you.hp <= 0) {
    game.winner = 'foe';
  } else {
    return false;
  }
  game.phase = PHASE_OVER;
  game.log.push(
    game.winner === 'you'
      ? 'The Warden falls. The Ember Court is yours!'
      : game.winner === 'foe'
        ? 'Your ember gutters out. The Warden keeps the court.'
        : 'Both duelists fall at once — a draw.',
  );
  return true;
}

// Apply one card's effects. Returns false when the play is illegal.
export function playCard(game, side, handIndex) {
  if (game.phase !== PHASE_PLAY) return false;
  if (side === 'foe') return false;
  const pile = game[side];
  const card = pile.hand[handIndex];
  if (!card || card.cost > pile.ember) return false;
  pile.hand.splice(handIndex, 1);
  pile.ember -= card.cost;
  pile.discard.push(card);
  pile.lastPlayed = card;
  game.cardsPlayed += 1;
  const who = side === 'you' ? 'You' : 'The Warden';
  const foeSide = side === 'you' ? 'foe' : 'you';
  if (card.atk > 0) {
    const ward = game[foeSide].ward;
    const damage = strikeDamage(card, ward, pile.ward);
    const note =
      ward && courtBeats(card.court, ward)
        ? ' — court advantage!'
        : ward && courtBeats(ward, card.court)
          ? ' — warded down'
          : pile.ward && card.court === pile.ward
            ? ' — court matched'
            : '';
    game.log.push(`${who} play ${card.name} (${COURTS[card.court].name}) for ${damage} damage${note}.`);
    dealDamage(game, foeSide, damage, card.name);
  } else {
    game.log.push(`${who} play ${card.name} (${COURTS[card.court].name}).`);
  }
  if (card.heal > 0) {
    pile.hp = Math.min(MAX_HP, pile.hp + card.heal);
    game.log.push(`${who} restore ${card.heal} life.`);
  }
  if (card.armor > 0) {
    pile.armor += card.armor;
    game.log.push(`${who} gain ${card.armor} armor.`);
  }
  if (card.ember > 0) {
    pile.ember = Math.min(MAX_EMBER, pile.ember + card.ember);
    game.log.push(`${who} gain ${card.ember} ember.`);
  }
  if (card.draw > 0) drawCards(game, side, card.draw);
  // Your ward becomes the court of the last card you played.
  pile.ward = card.court;
  finishIfOver(game);
  return true;
}

function aiChoose(game) {
  const foe = game.foe;
  const playable = foe.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.cost <= foe.ember);
  if (playable.length === 0) return null;
  // Heal when hurt, armor when bare, otherwise the hardest hit available
  // against your ward — exactly the choice a careful player would make.
  const hurt = foe.hp <= 12;
  const heal = playable.find(({ card }) => card.heal > 0);
  if (hurt && heal) return heal;
  const armor = playable.find(({ card }) => card.armor > 0);
  if (foe.armor === 0 && armor && foe.hp <= 20) return armor;
  let best = playable[0];
  let bestValue = -1;
  for (const entry of playable) {
    const value = strikeDamage(entry.card, game.you.ward, foe.ward)
      + entry.card.heal * 0.5 + entry.card.armor * 0.5
      + entry.card.draw * 2 + entry.card.ember;
    if (value > bestValue) {
      bestValue = value;
      best = entry;
    }
  }
  return best;
}

// The Warden takes its turn: one card while it sizes you up in round 1,
// then up to two cards a turn, then the round turns over.
export function foeTurn(game) {
  if (game.phase !== PHASE_PLAY) return;
  game.foe.ember = Math.min(MAX_EMBER, game.foe.ember + 1);
  drawCards(game, 'foe', 1);
  const cap = game.round <= 1 ? 1 : 2;
  let played = 0;
  while (played < cap) {
    const choice = aiChoose(game);
    if (!choice) break;
    const card = game.foe.hand[choice.index];
    game.foe.hand.splice(choice.index, 1);
    game.foe.ember -= card.cost;
    game.foe.discard.push(card);
    game.foe.lastPlayed = card;
    played += 1;
    if (card.atk > 0) {
      const damage = strikeDamage(card, game.you.ward, game.foe.ward);
      game.log.push(`The Warden plays ${card.name} (${COURTS[card.court].name}) for ${damage} damage.`);
      dealDamage(game, 'you', damage, card.name);
    } else {
      game.log.push(`The Warden plays ${card.name} (${COURTS[card.court].name}).`);
    }
    if (card.heal > 0) {
      game.foe.hp = Math.min(MAX_HP, game.foe.hp + card.heal);
      game.log.push(`The Warden restores ${card.heal} life.`);
    }
    if (card.armor > 0) {
      game.foe.armor += card.armor;
      game.log.push(`The Warden gains ${card.armor} armor.`);
    }
    if (card.ember > 0) {
      game.foe.ember = Math.min(MAX_EMBER, game.foe.ember + card.ember);
    }
    if (card.draw > 0) drawCards(game, 'foe', card.draw);
    game.foe.ward = card.court;
    if (finishIfOver(game)) return;
  }
  if (played === 0) game.log.push('The Warden passes, ember unspent.');
  // New round: your ember grows, you draw, the Warden's ward rotates.
  game.round += 1;
  game.turn += 1;
  game.you.ember = Math.min(MAX_EMBER, game.you.ember + 1);
  drawCards(game, 'you', 1);
  game.foeWardIndex = (game.foeWardIndex + 1) % WARD_CYCLE.length;
  game.foe.ward = WARD_CYCLE[game.foeWardIndex];
  game.log.push(`Round ${game.round} — the Warden raises a ${COURTS[game.foe.ward].name} ward.`);
}

export function score(game) {
  return Math.max(0, game.damageDealt + (game.winner === 'you' ? 100 : 0) - game.turn * 2);
}

export function cardById(id) {
  return CARD_POOL.find((card) => card.id === id) || null;
}
