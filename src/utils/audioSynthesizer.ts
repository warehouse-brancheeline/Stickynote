import { AlarmTone } from '../types';

let audioCtx: AudioContext | null = null;
let currentAlarmInterval: number | null = null;
let isCurrentlyRinging = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a single motif/burst of the selected tone.
 */
export function playToneMotif(tone: AlarmTone, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (tone === 'windows-chime') {
      // Harmonic 4-note bell arpeggio (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Envelope
        const startTime = now + idx * 0.12;
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } else if (tone === 'digital-beep') {
      // Two quick sharp digital beeps
      const beeps = [0, 0.15];
      beeps.forEach((offset) => {
        const osc = ctx.createOscillator();
        const beepGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + offset); // A5

        const startTime = now + offset;
        beepGain.gain.setValueAtTime(0, startTime);
        beepGain.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
        beepGain.gain.setValueAtTime(0.35, startTime + 0.08);
        beepGain.gain.linearRampToValueAtTime(0.001, startTime + 0.09);

        osc.connect(beepGain);
        beepGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
      });
    } else if (tone === 'radar') {
      // Frequency sweep ping with echo pulse
      const osc = ctx.createOscillator();
      const radarGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);

      radarGain.gain.setValueAtTime(0, now);
      radarGain.gain.linearRampToValueAtTime(0.6, now + 0.03);
      radarGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(radarGain);
      radarGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } else if (tone === 'gentle-bell') {
      // Warm meditative gong / tibetan bowl chime with harmonics
      const baseFreq = 440;
      const harmonics = [1, 2.76, 5.4];
      harmonics.forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.4 / (idx + 1), now + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(bellGain);
        bellGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.3);
      });
    } else if (tone === 'marimba') {
      // Bright cheerful wooden triad
      const notes = [440, 554.37, 659.25, 880]; // A major
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const mGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        const startTime = now + idx * 0.1;
        mGain.gain.setValueAtTime(0, startTime);
        mGain.gain.linearRampToValueAtTime(0.5, startTime + 0.015);
        mGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(mGain);
        mGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Loops the alarm tone continuously every 1.5 - 2.0s until stopAlarm() is called.
 */
export function startAlarmLoop(tone: AlarmTone, volume: number = 0.8) {
  stopAlarmLoop();
  isCurrentlyRinging = true;

  // Play immediately
  playToneMotif(tone, volume);

  // Interval for repeat
  const intervalMs = tone === 'digital-beep' ? 1200 : 2000;
  currentAlarmInterval = window.setInterval(() => {
    if (isCurrentlyRinging) {
      playToneMotif(tone, volume);
    }
  }, intervalMs);
}

/**
 * Stops any actively looping alarm sound.
 */
export function stopAlarmLoop() {
  isCurrentlyRinging = false;
  if (currentAlarmInterval !== null) {
    clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
}

export function isAlarmRinging(): boolean {
  return isCurrentlyRinging;
}
