# Ember Court — Duel of the Four Courts

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Darkarmy921/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Darkarmy921/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A complete original turn-based duel card game. You are the Ember Sovereign, facing the Warden of the Ashen Court. Both hold 30 life; first to 0 loses.

## How it plays

- Each round you gain ember (up to 10) and draw a card from a 30-card deck of four courts: Flame, Tide, Leaf, Stone.
- Play cards by clicking them (or keys 1–7). A strike deals its attack as damage; Mend heals, Stonewall grants armor, Surge grants ember, Scry draws.
- Court advantage: Flame › Leaf › Stone › Tide › Flame. A card whose court beats the Warden's rotating ward deals +2 damage; one the ward beats deals −1. Playing a card matching your own ward adds +1.
- End your turn (Enter) and the Warden answers with up to two cards of its own, then the ward rotates.
- Win and loss screens show your score, damage dealt, rounds and cards played. Best score is kept in your browser.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network requests, keyboard and mouse.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ppee1fs7&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
