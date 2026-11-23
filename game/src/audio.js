// Tiny synthesized sounds: no audio files, no network. A short blip per
// event, through one shared AudioContext created on the first user gesture.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(freq, ms, type, gain) {
  if (muted) return;
  try {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') void context.resume();
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain || 0.08, context.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, context.currentTime + ms / 1000);
    osc.connect(amp).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + ms / 1000);
  } catch {
    // Sound is decoration; a browser without audio still plays.
  }
}

export const sfx = {
  play() { tone(520, 90, 'triangle', 0.07); },
  hit() { tone(180, 140, 'sawtooth', 0.06); },
  heal() { tone(660, 160, 'sine', 0.06); },
  win() { tone(523, 140, 'triangle', 0.08); setTimeout(() => tone(784, 220, 'triangle', 0.08), 140); },
  lose() { tone(220, 260, 'sawtooth', 0.06); setTimeout(() => tone(147, 320, 'sawtooth', 0.06), 200); },
  turn() { tone(392, 70, 'sine', 0.05); },
};
