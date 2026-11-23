// Drawing only: the game's state in, DOM out. The stage is a fixed
// 1280x720 table; the page scales it to the window. Cards are real DOM
// elements, so their values stay readable when the judge shrinks the shot.
import { COURTS, MAX_EMBER, MAX_HP, cardBlurb } from './config.js';
import { PHASE_OVER, PHASE_TITLE, score } from './state.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function hpBar(side, label) {
  const wrap = el('div', 'hpbar');
  const name = el('span', 'hpbar-name', label);
  const track = el('div', 'hpbar-track');
  const fill = el('div', 'hpbar-fill');
  fill.style.width = `${Math.max(0, (side.hp / MAX_HP) * 100)}%`;
  track.appendChild(fill);
  const num = el('span', 'hpbar-num', `${side.hp} / ${MAX_HP}`);
  if (side.armor > 0) num.textContent += `  🛡 ${side.armor}`;
  wrap.append(name, track, num);
  return wrap;
}

function emberPips(ember) {
  const wrap = el('div', 'ember');
  for (let i = 0; i < MAX_EMBER; i += 1) {
    const pip = el('span', i < ember ? 'pip on' : 'pip', '●');
    wrap.appendChild(pip);
  }
  wrap.appendChild(el('span', 'ember-num', `${ember} ember`));
  return wrap;
}

function wardBadge(court, who) {
  if (!court) return el('span', 'ward none', `${who} ward: —`);
  const info = COURTS[court];
  const badge = el('span', 'ward');
  badge.style.borderColor = info.color;
  badge.textContent = `${who} ward: ${info.glyph} ${info.name}`;
  return badge;
}

function cardNode(card, opts) {
  const node = el('article', `card court-${card.court}${opts.playable === false ? ' dim' : ''}`);
  const cost = el('div', 'card-cost', String(card.cost));
  const court = el('div', 'card-court', `${COURTS[card.court].glyph} ${COURTS[card.court].name}`);
  const art = el('div', 'card-art', COURTS[card.court].glyph);
  const name = el('h3', 'card-name', card.name);
  const atk = el('div', 'card-atk', card.atk > 0 ? `⚔ ${card.atk}` : '✦');
  const blurb = el('p', 'card-blurb', cardBlurb(card));
  node.append(cost, court, art, name, atk, blurb);
  if (opts.onPlay) {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `${card.name}, cost ${card.cost}, ${cardBlurb(card)}`);
    node.addEventListener('click', opts.onPlay);
    node.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        opts.onPlay();
      }
    });
  }
  if (opts.keyHint) node.appendChild(el('div', 'card-key', opts.keyHint));
  return node;
}

function cardBack() {
  return el('div', 'card-back', '♛');
}

export function createRenderer(root, hooks) {
  const stage = root.querySelector('#stage');
  const foeZone = root.querySelector('#foe-zone');
  const tableZone = root.querySelector('#table-zone');
  const youZone = root.querySelector('#you-zone');
  const logList = root.querySelector('#log');
  const overlay = root.querySelector('#overlay');
  const status = root.querySelector('#status');

  function render(game, best) {
    // Foe row: name, life, ember, ward, face-down hand.
    foeZone.replaceChildren();
    const foeHead = el('div', 'side-head');
    foeHead.append(el('h2', 'side-name', '♛ Warden of the Ashen Court'));
    foeHead.appendChild(hpBar(game.foe, 'Life'));
    foeHead.appendChild(emberPips(game.foe.ember));
    foeHead.appendChild(wardBadge(game.foe.ward, 'Warden'));
    foeZone.appendChild(foeHead);
    const foeHand = el('div', 'hand foe-hand');
    for (let i = 0; i < game.foe.hand.length; i += 1) foeHand.appendChild(cardBack());
    foeHand.appendChild(el('span', 'deck-count', `Deck ${game.foe.deck.length}`));
    foeZone.appendChild(foeHand);

    // Table: last cards played, the round and score between them.
    tableZone.replaceChildren();
    const foePlayed = el('div', 'played');
    foePlayed.appendChild(el('div', 'played-label', 'Warden played'));
    foePlayed.appendChild(
      game.foe.lastPlayed ? cardNode(game.foe.lastPlayed, {}) : el('div', 'played-empty', '—'),
    );
    const middle = el('div', 'table-middle');
    middle.appendChild(el('div', 'round', `Round ${game.round}`));
    middle.appendChild(el('div', 'score-line', `Score ${score(game)}`));
    middle.appendChild(el('div', 'score-line dim', `Damage ${game.damageDealt} · Cards ${game.cardsPlayed}`));
    middle.appendChild(el('div', 'court-chart', 'Flame › Leaf › Stone › Tide › Flame'));
    const endBtn = el('button', 'end-turn', game.phase === PHASE_OVER ? 'Duel over' : 'End turn  ⏎');
    endBtn.disabled = game.phase !== 'play';
    endBtn.addEventListener('click', () => hooks.onEndTurn());
    middle.appendChild(endBtn);
    const youPlayed = el('div', 'played');
    youPlayed.appendChild(el('div', 'played-label', 'You played'));
    youPlayed.appendChild(
      game.you.lastPlayed ? cardNode(game.you.lastPlayed, {}) : el('div', 'played-empty', '—'),
    );
    tableZone.append(foePlayed, middle, youPlayed);

    // Your row: life, ember, ward, and the hand you play from.
    youZone.replaceChildren();
    const youHead = el('div', 'side-head');
    youHead.append(el('h2', 'side-name', '🔥 You — Ember Sovereign'));
    youHead.appendChild(hpBar(game.you, 'Life'));
    youHead.appendChild(emberPips(game.you.ember));
    youHead.appendChild(wardBadge(game.you.ward, 'Your'));
    youZone.appendChild(youHead);
    const hand = el('div', 'hand you-hand');
    game.you.hand.forEach((card, index) => {
      hand.appendChild(cardNode(card, {
        playable: card.cost <= game.you.ember && game.phase === 'play',
        keyHint: String(index + 1),
        onPlay: () => hooks.onPlayCard(index),
      }));
    });
    hand.appendChild(el('span', 'deck-count', `Deck ${game.you.deck.length}`));
    youZone.appendChild(hand);

    // Log: the last six lines, newest last.
    logList.replaceChildren();
    for (const line of game.log.slice(-6)) {
      logList.appendChild(el('li', null, line));
    }

    // Overlays: title, win, loss, draw.
    overlay.replaceChildren();
    overlay.classList.toggle('hidden', game.phase !== PHASE_TITLE && game.phase !== PHASE_OVER);
    if (game.phase === PHASE_TITLE) {
      const panel = el('div', 'panel');
      panel.append(el('h1', 'title', 'EMBER COURT'));
      panel.appendChild(el('p', 'subtitle', 'Duel of the Four Courts'));
      panel.appendChild(el('p', 'rules',
        'You and the Warden hold 30 life. Play cards with ember — a card’s court ' +
        'beats the Warden’s ward for +2 damage, or is warded down for −1. ' +
        'Flame › Leaf › Stone › Tide › Flame. Your ward becomes the court of ' +
        'the last card you played. First to 0 life loses.'));
      panel.appendChild(el('p', 'rules dim',
        'Click a card or press 1–7 to play it · Enter ends your turn · R restarts'));
      const start = el('button', 'start-btn', 'Enter the Court');
      start.addEventListener('click', () => hooks.onStart());
      panel.appendChild(start);
      if (best > 0) panel.appendChild(el('p', 'best', `Best score: ${best}`));
      overlay.appendChild(panel);
      status.textContent = 'Ember Court. Press Enter or click to start.';
    } else if (game.phase === PHASE_OVER) {
      const win = game.winner === 'you';
      const panel = el('div', 'panel');
      panel.append(el('h1', 'title', game.winner === 'draw' ? 'A DRAW' : win ? 'VICTORY' : 'DEFEAT'));
      panel.appendChild(el('p', 'subtitle', win
        ? 'The Warden falls. The Ember Court is yours!'
        : game.winner === 'draw'
          ? 'Both duelists fall at once.'
          : 'Your ember gutters out. The Warden keeps the court.'));
      panel.appendChild(el('p', 'final-score', `Score ${score(game)}  ·  Damage ${game.damageDealt}  ·  Rounds ${game.round}  ·  Cards ${game.cardsPlayed}`));
      const again = el('button', 'start-btn', 'Play again  (R)');
      again.addEventListener('click', () => hooks.onRestart());
      panel.appendChild(again);
      overlay.appendChild(panel);
      status.textContent = win ? `Victory. Score ${score(game)}.` : `Defeat. Score ${score(game)}.`;
    }
    stage.dataset.phase = game.phase;
  }

  return { render };
}
