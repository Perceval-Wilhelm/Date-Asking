import { prefs } from "./prefs";

// Every sound is synthesised, so the quiz ships no audio files. Browsers only allow
// audio after a tap, and every sound here answers one.
let context: AudioContext | undefined;

function audio() {
  if (prefs.get().muted || typeof window === "undefined" || !("AudioContext" in window)) return null;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null;
  }
}

type Tone = { freq: number; to?: number; start?: number; dur: number; type?: OscillatorType; gain?: number };

function tone(ctx: AudioContext, { freq, to, start = 0, dur, type = "sine", gain = 0.15 }: Tone) {
  const at = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function noise(ctx: AudioContext, { start = 0, dur, freq, gain = 0.15 }: Omit<Tone, "type" | "to">) {
  const at = ctx.currentTime + start;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = freq;
  env.gain.setValueAtTime(gain, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  source.connect(filter).connect(env).connect(ctx.destination);
  source.start(at);
}

function play(sound: (ctx: AudioContext) => void) {
  const ctx = audio();
  if (ctx) sound(ctx);
}

export const sfx = {
  unfold: () =>
    play((ctx) => {
      noise(ctx, { dur: 0.22, freq: 2600, gain: 0.12 });
      tone(ctx, { freq: 660, to: 990, start: 0.12, dur: 0.22, gain: 0.08 });
    }),
  no: () => play((ctx) => tone(ctx, { freq: 440, to: 220, dur: 0.3, type: "triangle", gain: 0.14 })),
  slap: () =>
    play((ctx) => {
      noise(ctx, { dur: 0.08, freq: 900, gain: 0.2 });
      tone(ctx, { freq: 150, to: 70, dur: 0.14, gain: 0.16 });
    }),
  scribble: () =>
    play((ctx) => {
      for (let i = 0; i < 6; i++) noise(ctx, { start: i * 0.06, dur: 0.05, freq: 3000 + i * 180, gain: 0.07 });
    }),
  yes: () =>
    play((ctx) => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
        tone(ctx, { freq, start: i * 0.08, dur: 0.38, type: "triangle", gain: 0.12 }),
      );
      tone(ctx, { freq: 2093, start: 0.34, dur: 0.55, gain: 0.04 });
    }),
  tick: () => play((ctx) => tone(ctx, { freq: 1250, dur: 0.05, type: "square", gain: 0.03 })),
};

/** A short buzz on phones that support it; a no-op everywhere else. */
export function buzz(pattern: number | number[]) {
  try {
    // Chrome logs an error for vibration that no real tap triggered.
    if (navigator.userActivation && !navigator.userActivation.isActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    // Some browsers throw instead of ignoring vibration outside a user gesture.
  }
}
