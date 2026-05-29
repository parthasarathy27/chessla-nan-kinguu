// Web Audio API Chess Sound Synthesizer
// Synthesizes realistic wood clacks and game sound effects client-side without external assets.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Helper to create a noise buffer for wood impact raspiness
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 0.1; // 100ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

export function playMoveSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    // Wood tone oscillator
    const osc = ctx.createOscillator();
    const gainOsc = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

    gainOsc.gain.setValueAtTime(0.6, time);
    gainOsc.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    // Filtered noise for wood clack texture
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(350, time);
    filter.Q.setValueAtTime(3, time);

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(0.12, time);
    gainNoise.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    // Connections
    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    // Play
    osc.start(time);
    osc.stop(time + 0.09);
    noise.start(time);
    noise.stop(time + 0.06);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

export function playCaptureSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    // Capture sound has two distinct clicks in rapid succession for standard click-clack feel
    const osc = ctx.createOscillator();
    const gainOsc = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, time);
    osc.frequency.setValueAtTime(180, time + 0.02);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.12);

    gainOsc.gain.setValueAtTime(0.8, time);
    gainOsc.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, time);
    filter.Q.setValueAtTime(2, time);

    const gainNoise = ctx.createGain();
    gainNoise.gain.setValueAtTime(0.2, time);
    gainNoise.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    // Connections
    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(ctx.destination);

    // Play
    osc.start(time);
    osc.stop(time + 0.13);
    noise.start(time);
    noise.stop(time + 0.09);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

export function playCheckSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    // High pitched alert chime (double tone)
    const playChime = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playChime(587.33, time, 0.15); // D5
    playChime(739.99, time + 0.07, 0.22); // F#5
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

export function playGameOverSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    // Ascending arpeggio chime resolution
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(261.63, time, 0.25); // C4
    playTone(329.63, time + 0.1, 0.25); // E4
    playTone(392.00, time + 0.2, 0.25); // G4
    playTone(523.25, time + 0.3, 0.45); // C5
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}
