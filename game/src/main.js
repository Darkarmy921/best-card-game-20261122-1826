// Boot and the one loop: input is read from clicks and keys, the state
// advances through playCard / foeTurn, and the renderer paints what is
// there. The game moves between three screens: title, play and over.
//
// ?seed=N fixes the deal. ?shot=start|play|win|loss (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE, createGame, foeTurn, playCard, score, startDuel } from './state.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { isMuted, setMuted, sfx } from './audio.js';

const BEST_KEY = 'ember-court.best';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

let game = createGame(seed);
let best = 0;
try {
  best = Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
} catch {
  best = 0;
}

const status = document.getElementById('status');
const renderer = createRenderer(document, {
  onStart() {
    if (startDuel(game)) {
      sfx.turn();
      renderer.render(game, best);
    }
  },
  onPlayCard(index) {
    if (game.phase !== PHASE_PLAY) return;
    const card = game.you.hand[index];
    if (!card || card.cost > game.you.ember) return;
    const before = game.foe.hp;
    playCard(game, 'you', index);
    if (card.atk > 0 && game.foe.hp < before) sfx.hit();
    else if (card.heal > 0 || card.armor > 0) sfx.heal();
    else sfx.play();
    afterMove();
  },
  onEndTurn() {
    if (game.phase !== PHASE_PLAY) return;
    foeTurn(game);
    sfx.turn();
    afterMove();
  },
  onRestart() {
    game = createGame(Math.floor(Math.random() * 4294967296));
    startDuel(game);
    renderer.render(game, best);
  },
});

function saveBest() {
  if (game.phase === PHASE_OVER && game.winner === 'you' && score(game) > best) {
    best = score(game);
    try {
      window.localStorage.setItem(BEST_KEY, String(best));
    } catch {
      // Storage can be off: the best score then lasts this visit only.
    }
  }
}

function afterMove() {
  saveBest();
  if (game.phase === PHASE_OVER) {
    if (game.winner === 'you') sfx.win();
    else sfx.lose();
  }
  renderer.render(game, best);
}

function runShot(name) {
  game = stageShot(name);
  saveBest();
  let painted = 0;
  function paint() {
    renderer.render(game, best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM') {
      setMuted(!isMuted());
      return;
    }
    if (event.code === 'KeyR' && game.phase === PHASE_OVER) {
      game = createGame(Math.floor(Math.random() * 4294967296));
      startDuel(game);
      renderer.render(game, best);
      return;
    }
    if ((event.code === 'Enter' || event.code === 'Space') && game.phase !== PHASE_PLAY) {
      if (game.phase === PHASE_TITLE) {
        startDuel(game);
        renderer.render(game, best);
      }
      return;
    }
    if (game.phase !== PHASE_PLAY) return;
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      foeTurn(game);
      sfx.turn();
      afterMove();
      return;
    }
    const digit = Number.parseInt(event.key, 10);
    if (digit >= 1 && digit <= game.you.hand.length) {
      const index = digit - 1;
      const card = game.you.hand[index];
      if (card && card.cost <= game.you.ember) {
        const before = game.foe.hp;
        playCard(game, 'you', index);
        if (card.atk > 0 && game.foe.hp < before) sfx.hit();
        else sfx.play();
        afterMove();
      }
    }
  });
  renderer.render(game, best);
}

window.__game = game;
Object.defineProperty(window, '__gameState', { get: () => game });
if (shot) runShot(shot);
else runGame();
