// Screenshot scenes: each one plays the real rules forward from a fresh
// game, so the frame is what a short duel really looks like and the same
// seed always gives the same frame. No state is faked: the win scene wins
// by playing, the loss scene loses by passing.
import { PHASE_OVER, PHASE_PLAY, createGame, foeTurn, playCard, startDuel } from './state.js';
import { strikeDamage } from './config.js';

// Play the best affordable strike each turn; heal when hurt.
function aggressive(game) {
  let guard = 0;
  while (game.phase === PHASE_PLAY && guard < 60) {
    guard += 1;
    let bestIndex = -1;
    let bestValue = -1;
    game.you.hand.forEach((card, index) => {
      if (card.cost > game.you.ember) return;
      const value = strikeDamage(card, game.foe.ward, game.you.ward)
        + (game.you.hp <= 12 ? card.heal * 2 : 0) + card.armor + card.draw * 2 + card.ember;
      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });
    if (bestIndex >= 0) playCard(game, 'you', bestIndex);
    else foeTurn(game);
    if (game.phase === PHASE_OVER) break;
    // After the foe's turn the loop continues with the new hand.
    if (bestIndex < 0) continue;
    // Keep playing while ember remains; when nothing is affordable, end.
    const affordable = game.you.hand.some((card) => card.cost <= game.you.ember);
    if (!affordable) foeTurn(game);
  }
  return game;
}

function passive(game) {
  let guard = 0;
  while (game.phase === PHASE_PLAY && guard < 60) {
    guard += 1;
    foeTurn(game);
  }
  return game;
}

function fresh(seed) {
  const game = createGame(seed);
  startDuel(game);
  return game;
}

// Find the first seed (1..24) whose autopilot ends the way we want.
function seek(policy, want) {
  for (let seed = 1; seed <= 24; seed += 1) {
    const game = policy(fresh(seed));
    if (game.phase === PHASE_OVER && game.winner === want) return game;
  }
  // Fallback: the closest run we found, so a shot always renders.
  return policy(fresh(7));
}

export function stageShot(name) {
  if (name === 'win') return seek(aggressive, 'you');
  if (name === 'loss') return seek(passive, 'foe');
  if (name === 'play') {
    const game = fresh(3);
    // Four rounds of aggressive play, then stop mid-duel on your turn.
    for (let round = 0; round < 4 && game.phase === PHASE_PLAY; round += 1) {
      let bestIndex = -1;
      let bestValue = -1;
      game.you.hand.forEach((card, index) => {
        if (card.cost > game.you.ember) return;
        const value = strikeDamage(card, game.foe.ward, game.you.ward) + card.draw * 2 + card.ember;
        if (value > bestValue) {
          bestValue = value;
          bestIndex = index;
        }
      });
      if (bestIndex >= 0) playCard(game, 'you', bestIndex);
      if (game.phase === PHASE_PLAY) foeTurn(game);
    }
    return game;
  }
  return createGame(3);
}
