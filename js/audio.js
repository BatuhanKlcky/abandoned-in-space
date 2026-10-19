/**
 * Web Audio API Sound Synthesizer for NASA Mission Telemetry & Deep Space Atmosphere
 * Zero external audio files required — synthesized entirely via Web Audio nodes.
 */

class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientLFO = null;
    this.isAmbientPlaying = false;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.enabled ? 0.08 : 0, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.enabled;
  }

  /**
   * Start cosmic low-frequency ambient hum
   */
  startAmbient() {
    if (this.isAmbientPlaying) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.enabled ? 0.07 : 0, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Low rumble 55Hz
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Sub-harmonic 82.4Hz
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      // Filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn("Ambient audio init deferred:", e);
    }
  }

  /**
   * Authentic NASA Apollo Quindar Tone
   * Intro tone: 2525 Hz pure sine wave for 250 milliseconds
   */
  playQuindarTone() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2525, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.015);
      gain.gain.setValueAtTime(0.09, now + 0.22);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

      // Followed by subtle radio static crackle
      this.playRadioStatic(0.15, 0.04, 0.24);
    } catch (e) {}
  }

  /**
   * Radio communications static burst
   */
  playRadioStatic(duration = 0.2, volume = 0.05, delay = 0) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime + delay;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter to sound like analog VHF/UHF radio
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, startTime);
      filter.Q.setValueAtTime(1.8, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(startTime);
    } catch (e) {}
  }

  /**
   * UI Telemetry Ping / Radar Blip
   */
  playTelemetryPing(freq = 1100, dur = 0.08) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + dur);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur + 0.01);
    } catch (e) {}
  }

  /**
   * Body switch sound (atmospheric whoosh)
   */
  playWarpTransition() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.7);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.72);
      this.playRadioStatic(0.4, 0.06, 0.2);
    } catch (e) {}
  }
}

window.SpaceAudio = new SpaceAudioEngine();
