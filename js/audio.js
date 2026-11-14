/**
 * Web Audio API Sound Synthesizer & Apollo Radio Transmission Engine
 * Combines Web Audio Quindar tones, bandpass radio filter, static bursts,
 * and SpeechSynthesis to realistically broadcast historical astronaut communications.
 */

class SpaceAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.isAmbientPlaying = false;
    this.isTransmitting = false;
    this.synth = window.speechSynthesis || null;
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
    if (!this.enabled && this.synth) {
      this.synth.cancel();
      this.isTransmitting = false;
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
      this.ambientGain.gain.setValueAtTime(this.enabled ? 0.06 : 0, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Low rumble 55Hz
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Sub-harmonic 82.4Hz
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn("Ambient audio deferred:", e);
    }
  }

  /**
   * NASA Apollo Quindar Tone
   * intro = true: 2525 Hz key-up tone (starts radio channel)
   * intro = false: 2475 Hz key-down tone (ends radio channel)
   */
  playQuindarTone(intro = true, onComplete = null) {
    this._initContext();
    if (!this.ctx || !this.enabled) {
      if (onComplete) onComplete();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const freq = intro ? 2525 : 2475;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain.gain.setValueAtTime(0.12, now + 0.22);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

      this.playRadioStatic(0.2, 0.05, 0.22);

      if (onComplete) {
        setTimeout(onComplete, 280);
      }
    } catch (e) {
      if (onComplete) onComplete();
    }
  }

  /**
   * VHF radio static burst
   */
  playRadioStatic(duration = 0.2, volume = 0.05, delay = 0) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime + delay;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.Q.setValueAtTime(1.8, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
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
   * Body switch sound (warp whoosh)
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

  /**
   * Plays the complete astronaut radio communication:
   * 1. Quindar Key-Up Beep (2525 Hz)
   * 2. Radio Squelch & Static Burst
   * 3. Spoken Astronaut Voice (via SpeechSynthesis with radio modulation)
   * 4. Quindar Key-Down Outro Beep (2475 Hz) + Squelch
   */
  playRadioTransmission(text, onStart = null, onEnd = null) {
    this._initContext();
    if (!this.enabled) {
      if (onEnd) onEnd();
      return;
    }

    if (this.isTransmitting) {
      if (this.synth) this.synth.cancel();
      this.isTransmitting = false;
      if (onEnd) onEnd();
      return;
    }

    this.isTransmitting = true;
    if (onStart) onStart();

    // Clean text from bracketed labels like "[Apollo 12 Seismometer...]"
    const cleanSpeech = text.replace(/\[.*?\]/g, '').replace(/Conrad:|Shepard:|Duke:|Scott:|Cernan:/g, '').trim();

    // 1. Play Quindar Intro
    this.playQuindarTone(true, () => {
      // 2. Play continuous subtle radio background hiss while speaking
      this.playRadioStatic(cleanSpeech.length * 0.12, 0.02, 0);

      if (this.synth && cleanSpeech.length > 2) {
        // Cancel any pending speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 0.95;  // Deliberate NASA flight pace
        utterance.pitch = 0.95; // Radio communications pitch
        utterance.lang = 'en-US';

        // Select an English voice if available
        const voices = this.synth.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural') || v.name.includes('Male'))) || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;

        utterance.onend = () => {
          this.isTransmitting = false;
          // 3. Play Quindar Outro Beep when finished speaking
          this.playQuindarTone(false, () => {
            if (onEnd) onEnd();
          });
        };

        utterance.onerror = () => {
          this.isTransmitting = false;
          this.playQuindarTone(false);
          if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
      } else {
        // Fallback if no speech synthesis: pulse simulated radio carrier wave
        this.playRadioStatic(1.5, 0.06, 0);
        setTimeout(() => {
          this.isTransmitting = false;
          this.playQuindarTone(false);
          if (onEnd) onEnd();
        }, 1600);
      }
    });
  }
}

window.SpaceAudio = new SpaceAudioEngine();
