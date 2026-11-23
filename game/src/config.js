// Ember Court: every tuning number, court and card in one place.
// Four courts in a cycle: Flame beats Leaf, Leaf beats Stone, Stone beats
// Tide, Tide beats Flame. A card played against the foe's ward court deals
// +2 when its court beats the ward, -1 (minimum 1) when the ward beats it.
export const MAX_HP = 30;
export const MAX_EMBER = 10;
export const START_EMBER = 3;
export const START_HAND = 5;
export const MAX_HAND = 7;
export const DECK_SIZE = 30;
export const WARD_CYCLE = ['flame', 'tide', 'leaf', 'stone'];

export const COURTS = {
  flame: { name: 'Flame', glyph: '🔥', beats: 'leaf', color: '#e5534b' },
  tide: { name: 'Tide', glyph: '💧', beats: 'flame', color: '#4fc3f7' },
  leaf: { name: 'Leaf', glyph: '🍃', beats: 'stone', color: '#7dc383' },
  stone: { name: 'Stone', glyph: '🪨', beats: 'tide', color: '#c9a227' },
};

// A card: cost in ember; atk damage to the foe; heal/armor/ember/draw are
// applied to the player who played it. A strike has atk only.
export const CARD_POOL = [
  { id: 'cinder-imp', name: 'Cinder Imp', court: 'flame', cost: 1, atk: 2, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'ember-drake', name: 'Ember Drake', court: 'flame', cost: 2, atk: 4, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'flamecaller', name: 'Flamecaller', court: 'flame', cost: 3, atk: 5, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'phoenix-ash', name: 'Phoenix Ash', court: 'flame', cost: 4, atk: 7, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'spark-fox', name: 'Spark Fox', court: 'flame', cost: 2, atk: 3, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'blaze-knight', name: 'Blaze Knight', court: 'flame', cost: 3, atk: 6, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'tidecaller', name: 'Tidecaller', court: 'tide', cost: 1, atk: 2, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'coral-knight', name: 'Coral Knight', court: 'tide', cost: 2, atk: 4, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'deep-serpent', name: 'Deep Serpent', court: 'tide', cost: 3, atk: 5, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'mist-warden', name: 'Mist Warden', court: 'tide', cost: 4, atk: 7, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'reef-sprite', name: 'Reef Sprite', court: 'tide', cost: 2, atk: 3, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'storm-herald', name: 'Storm Herald', court: 'tide', cost: 3, atk: 6, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'thornvine', name: 'Thornvine', court: 'leaf', cost: 1, atk: 2, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'grove-elk', name: 'Grove Elk', court: 'leaf', cost: 2, atk: 4, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'spore-witch', name: 'Spore Witch', court: 'leaf', cost: 3, atk: 5, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'root-golem', name: 'Root Golem', court: 'leaf', cost: 4, atk: 7, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'briar-wolf', name: 'Briar Wolf', court: 'leaf', cost: 2, atk: 3, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'canopy-archer', name: 'Canopy Archer', court: 'leaf', cost: 3, atk: 6, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'pebble-golem', name: 'Pebble Golem', court: 'stone', cost: 1, atk: 2, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'granite-guard', name: 'Granite Guard', court: 'stone', cost: 2, atk: 4, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'obsidian-blade', name: 'Obsidian Blade', court: 'stone', cost: 3, atk: 5, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'mountain-king', name: 'Mountain King', court: 'stone', cost: 4, atk: 7, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'slate-hound', name: 'Slate Hound', court: 'stone', cost: 2, atk: 3, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'quarry-titan', name: 'Quarry Titan', court: 'stone', cost: 3, atk: 6, heal: 0, armor: 0, ember: 0, draw: 0 },
  { id: 'mend', name: 'Mend', court: 'leaf', cost: 3, atk: 0, heal: 6, armor: 0, ember: 0, draw: 0 },
  { id: 'stonewall', name: 'Stonewall', court: 'stone', cost: 2, atk: 0, heal: 0, armor: 6, ember: 0, draw: 0 },
  { id: 'surge', name: 'Surge', court: 'flame', cost: 1, atk: 0, heal: 0, armor: 0, ember: 3, draw: 0 },
  { id: 'scry', name: 'Scry', court: 'tide', cost: 2, atk: 0, heal: 0, armor: 0, ember: 0, draw: 2 },
  { id: 'flare', name: 'Flare', court: 'flame', cost: 2, atk: 3, heal: 0, armor: 0, ember: 1, draw: 0 },
  { id: 'bulwark', name: 'Bulwark', court: 'stone', cost: 3, atk: 0, heal: 2, armor: 4, ember: 0, draw: 0 },
];

export function courtBeats(a, b) {
  return COURTS[a] && COURTS[a].beats === b;
}

// Damage of a strike card against a ward court: +2 on advantage, -1 on
// disadvantage (never below 1), +1 when it matches the attacker's own ward.
export function strikeDamage(card, ward, ownWard) {
  if (card.atk <= 0) return 0;
  let damage = card.atk;
  if (ward && courtBeats(card.court, ward)) damage += 2;
  else if (ward && courtBeats(ward, card.court)) damage -= 1;
  if (ownWard && card.court === ownWard) damage += 1;
  return Math.max(1, damage);
}

export function cardBlurb(card) {
  const parts = [];
  if (card.atk > 0) parts.push(`Deal ${card.atk} damage`);
  if (card.heal > 0) parts.push(`Restore ${card.heal} life`);
  if (card.armor > 0) parts.push(`Gain ${card.armor} armor`);
  if (card.ember > 0) parts.push(`Gain ${card.ember} ember`);
  if (card.draw > 0) parts.push(`Draw ${card.draw}`);
  return parts.join(' · ') || '—';
}
