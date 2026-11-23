// The deck: one copy of every card in CARD_POOL, shuffled. Drawing from
// an empty deck reshuffles the discard pile back in, so a duel never
// stalls for want of cards.
import { CARD_POOL } from './config.js';
import { shuffle } from './random.js';

export function buildDeck(random) {
  return shuffle(CARD_POOL.slice(), random);
}

export function drawCards(game, side, count) {
  const pile = game[side];
  for (let n = 0; n < count; n += 1) {
    if (pile.deck.length === 0) {
      if (pile.discard.length === 0) return;
      pile.deck = shuffle(pile.discard, game.random);
      pile.discard = [];
      game.log.push('The discard pile is reshuffled into the deck.');
    }
    if (pile.hand.length >= pile.maxHand) {
      pile.deck.shift();
      game.log.push(`${side === 'you' ? 'You' : 'The Warden'} burn a drawn card: hand is full.`);
      continue;
    }
    pile.hand.push(pile.deck.shift());
  }
}
