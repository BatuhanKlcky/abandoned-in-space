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

        const isTr = (window.app && window.app.currentLang === 'tr') || /[ğüşıöçĞÜŞİÖÇ]/.test(cleanSpeech);
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 0.95;  // Deliberate NASA flight pace
        utterance.pitch = 0.95; // Radio communications pitch
        utterance.lang = isTr ? 'tr-TR' : 'en-US';

        // Select a natural voice matching active language
        const voices = this.synth.getVoices();
        if (isTr) {
          const trVoice = voices.find(v => v.lang.startsWith('tr') && (v.name.includes('Ahmet') || v.name.includes('Tolga') || v.name.includes('Emre') || v.name.includes('Natural') || v.name.includes('Male'))) || voices.find(v => v.lang.startsWith('tr'));
          if (trVoice) utterance.voice = trVoice;
        } else {
          const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural') || v.name.includes('Male'))) || voices.find(v => v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
        }

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

  /**
   * Procedural Lunar Regolith Footstep (soft dusty bootfall + micro-gravel crunch)
   */
  playRegolithStep() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Low-frequency hollow ground impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.10);

      // Regolith granule friction noise burst
      const bufSize = Math.floor(this.ctx.sampleRate * 0.07);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(580 + Math.random() * 120, now);
      filter.Q.setValueAtTime(1.2, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.06, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(now);
    } catch (_) {}
  }

  /**
   * Metallic Spacecraft Cabin Deck Footstep (crisp interior aluminum thud)
   */
  playDeckStep() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }

  /**
   * Metallic EVA Ladder Rung Clank (hollow steel tube rung strike)
   */
  playLadderClank() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(840 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (_) {}
  }

  /**
   * Geological Science Sample Scan Chirp (futuristic 3-tone spectrometer arpeggio)
   */
  playSampleScanChirp() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1320, 1760].forEach((freq, idx) => {
        const delay = idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.14, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.09);
      });
    } catch (_) {}
  }

  /**
   * Authentic NASA Apollo 1202/1201 Master Alarm Alternating Two-Tone Klaxon (750 Hz & 1500 Hz warble)
   */
  playMasterAlarmKlaxon(cycles = 2) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      for (let c = 0; c < cycles; c++) {
        const offset = c * 0.22;
        // Tone 1: 750 Hz
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(750, now + offset);
        gain1.gain.setValueAtTime(0.10, now + offset);
        gain1.gain.setValueAtTime(0.10, now + offset + 0.10);
        gain1.gain.linearRampToValueAtTime(0.001, now + offset + 0.11);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now + offset);
        osc1.stop(now + offset + 0.11);

        // Tone 2: 1500 Hz
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1500, now + offset + 0.11);
        gain2.gain.setValueAtTime(0.09, now + offset + 0.11);
        gain2.gain.setValueAtTime(0.09, now + offset + 0.21);
        gain2.gain.linearRampToValueAtTime(0.001, now + offset + 0.22);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + offset + 0.11);
        osc2.stop(now + offset + 0.22);
      }
    } catch (_) {}
  }

  /**
   * Electric Lunar Rover (LRV) Dual-Traction Motor Hum (dynamic pitch & gain)
   */
  setRoverMotorHum(active = false, speed = 1.0) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (active) {
        if (!this.roverOsc) {
          // Fundamental traction motor low-end rumble
          this.roverOsc = this.ctx.createOscillator();
          this.roverGain = this.ctx.createGain();
          this.roverFilter = this.ctx.createBiquadFilter();
          this.roverFilter.type = 'lowpass';
          this.roverFilter.frequency.setValueAtTime(320, now);
          this.roverOsc.type = 'sawtooth';
          this.roverOsc.frequency.setValueAtTime(85, now);
          this.roverGain.gain.setValueAtTime(0.001, now);
          this.roverOsc.connect(this.roverFilter);
          this.roverFilter.connect(this.roverGain);
          this.roverGain.connect(this.ctx.destination);
          this.roverOsc.start(now);

          // Authentic harmonic 80:1 harmonic drive gear reduction whine
          this.roverWhineOsc = this.ctx.createOscillator();
          this.roverWhineGain = this.ctx.createGain();
          this.roverWhineFilter = this.ctx.createBiquadFilter();
          this.roverWhineFilter.type = 'bandpass';
          this.roverWhineFilter.frequency.setValueAtTime(800, now);
          this.roverWhineFilter.Q.setValueAtTime(3.0, now);
          this.roverWhineOsc.type = 'sine';
          this.roverWhineOsc.frequency.setValueAtTime(380, now);
          this.roverWhineGain.gain.setValueAtTime(0.001, now);
          this.roverWhineOsc.connect(this.roverWhineFilter);
          this.roverWhineFilter.connect(this.roverWhineGain);
          this.roverWhineGain.connect(this.ctx.destination);
          this.roverWhineOsc.start(now);
        }

        const clampedSpeed = Math.max(0.1, Math.min(1.8, Math.abs(speed)));
        const targetPitch = 65 + clampedSpeed * 95;
        const targetWhine = 340 + clampedSpeed * 680;

        this.roverOsc.frequency.setTargetAtTime(targetPitch, now, 0.08);
        this.roverGain.gain.setTargetAtTime(0.065, now, 0.1);

        if (this.roverWhineOsc) {
          this.roverWhineOsc.frequency.setTargetAtTime(targetWhine, now, 0.08);
          this.roverWhineGain.gain.setTargetAtTime(0.028, now, 0.1);
        }
      } else {
        if (this.roverGain) this.roverGain.gain.setTargetAtTime(0.0001, now, 0.12);
        if (this.roverWhineGain) this.roverWhineGain.gain.setTargetAtTime(0.0001, now, 0.12);
      }
    } catch (_) {}
  }

  /**
   * Rover Terrain Suspension Bump / Regolith Wheel Impact
   */
  playRoverSuspensionBump(intensity = 1.0) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
      gain.gain.setValueAtTime(Math.min(0.16, 0.08 * intensity), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (_) {}
  }

  /**
   * Handheld XRF / Raman Archaeological Spectrometer Scanning Beam Hum
   */
  setSpectrometerBeamHum(active = false) {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (active) {
        if (!this.scannerOsc) {
          this.scannerOsc = this.ctx.createOscillator();
          this.scannerGain = this.ctx.createGain();
          this.scannerFilter = this.ctx.createBiquadFilter();
          this.scannerFilter.type = 'bandpass';
          this.scannerFilter.frequency.setValueAtTime(1200, now);
          this.scannerFilter.Q.setValueAtTime(4.0, now);
          this.scannerOsc.type = 'sine';
          this.scannerOsc.frequency.setValueAtTime(640, now);
          this.scannerGain.gain.setValueAtTime(0.001, now);
          this.scannerOsc.connect(this.scannerFilter);
          this.scannerFilter.connect(this.scannerGain);
          this.scannerGain.connect(this.ctx.destination);
          this.scannerOsc.start(now);
        }
        this.scannerOsc.frequency.setTargetAtTime(780, now, 0.08);
        this.scannerGain.gain.setTargetAtTime(0.045, now, 0.05);
      } else if (this.scannerGain) {
        this.scannerGain.gain.setTargetAtTime(0.00001, now, 0.08);
      }
    } catch (_) {}
  }

  /**
   * Handheld Spectrometer Spectral Analysis Acquired (4-tone fast digital chirp)
   */
  playSpectrometerAnalyzeChirp() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [1046, 1318, 1567, 2093].forEach((f, i) => {
        const t = now + i * 0.035;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.055);
      });
    } catch (_) {}
  }
}

window.SpaceAudio = new SpaceAudioEngine();
