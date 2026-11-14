/**
 * Cinematic 3D Mission Simulation Theater & True WebXR 1:1 Astronaut Surface Walk (v4.6)
 *
 * [AI & PROCEDURAL GENERATION DISCLOSURE — NASA SPACE APPS CHALLENGE 2026 COMPLIANCE]:
 * - Core project concept, 5-Act storytelling arc, and NASA archival research were conceived and curated by the human developer.
 * - AI coding assistant (Google DeepMind Antigravity) was used for pair-programming the Three.js procedural geometry,
 *   1:1 WebXR walk-in cabin interiors, and interactive avionics switches.
 * - All 3D viewports and procedural Canvas2D textures include visible watermarks ("AI-ASSISTED PROCEDURAL RENDER • NO NASA LOGO").
 * - ZERO official NASA logos ("Meatball" or "Worm") are used anywhere in the generated content.
 */

class MissionSimulationTheater {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.cameraRig = null;
    this.controls = null;

    this.currentArtifact = null;
    this.simTime = 0;
    this.isPlaying = false;
    this.cameraMode = 'cinematic'; // 'cinematic', 'follow', 'ground', 'free', 'walk'
    this.walkViewMode = 'fp'; // 'fp' (1st-person hands & visor) or 'tp' (3rd-person full astronaut)
    this.flashlightOn = true;

    this.currentW = 0;
    this.currentH = 0;

    // Scene elements
    this.spacecraft = null;
    this.secondaryCraft = null;
    this.terrain = null;
    this.engineLight = null;
    this.exhaustPlume = null;
    this.particles = [];
    this.footprints = [];
    this.shockwave = null;
    this.shakeIntensity = 0;
    this.craneCrashed = false;
    this.impactTriggered = false;
    this.scaleRingsGroup = null;

    // Astronaut 3D rigs
    this.fpRig = null;
    this.fpLeftArm = null;
    this.fpRightArm = null;
    this.flashlight = null;
    this.flashlightTarget = null;
    this.tpAstronaut = null;
    this.tpLimbs = {};

    // 1:1 Astronaut Surface Walk & WebXR state
    this.walkState = {
      x: 0,
      y: 0,
      z: 14,
      vy: 0,
      yaw: 0,
      pitch: 0.05,
      eyeHeight: 1.75,
      isGrounded: true,
      keys: { w: false, a: false, s: false, d: false },
      isLooking: false,
      lastMouseX: 0,
      lastMouseY: 0,
      stepPhase: 0,
      lastStepCount: 0,
      breathPhase: 0
    };
    this.xrSession = null;
  }

  init() {
    this.overlay = document.getElementById('simulation-modal');
    this.canvas = document.getElementById('sim-canvas');
    if (!this.overlay || !this.canvas) return;

    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    this.currentW = w;
    this.currentH = h;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, true);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.32;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.04, 3000);
    this.cameraRig = new THREE.Group();
    this.cameraRig.add(this.camera);

    // Orbit Controls for free examination
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.maxDistance = 300;
      this.controls.minDistance = 2.5;
      this.controls.enabled = false;
    }

    window.addEventListener('resize', () => this.onResize());

    // Controls
    const closeBtn = document.getElementById('btn-close-sim');
    if (closeBtn) closeBtn.addEventListener('click', () => this.stopSimulation());

    const replayBtn = document.getElementById('btn-replay-sim');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (this.currentArtifact) {
          this.startSimulation(this.currentArtifact);
        }
      });
    }

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) {
      camSelect.addEventListener('change', (e) => {
        this.setCameraMode(e.target.value);
      });
    }

    const walkBtn = document.getElementById('btn-sim-walk');
    if (walkBtn) {
      walkBtn.addEventListener('click', () => {
        this.setCameraMode(this.cameraMode === 'walk' ? 'cinematic' : 'walk');
      });
    }

    const viewToggleBtn = document.getElementById('btn-walk-view-toggle');
    if (viewToggleBtn) {
      viewToggleBtn.addEventListener('click', () => this.toggleWalkPerspective());
    }

    const torchToggleBtn = document.getElementById('btn-walk-torch');
    if (torchToggleBtn) {
      torchToggleBtn.addEventListener('click', () => this.toggleFlashlight());
    }

    const cabinToggleBtn = document.getElementById('btn-walk-cabin');
    if (cabinToggleBtn) {
      cabinToggleBtn.addEventListener('click', () => this.toggleCabinInterior());
    }

    const xrBtn = document.getElementById('btn-sim-webxr');
    if (xrBtn) {
      xrBtn.addEventListener('click', () => this.enterWebXR());
    }

    this.initWalkControls();
  }

  initWalkControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isPlaying || this.cameraMode !== 'walk') return;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.walkState.keys.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.walkState.keys.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.walkState.keys.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.walkState.keys.d = true;
      if (code === 'Space') {
        e.preventDefault();
        this.triggerAstronautJump();
      }
      if (code === 'KeyV') {
        this.toggleWalkPerspective();
      }
      if (code === 'KeyF') {
        this.toggleFlashlight();
      }
      if (code === 'KeyE') {
        this.toggleCabinInterior();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.walkState.keys.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.walkState.keys.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.walkState.keys.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.walkState.keys.d = false;
    });

    if (this.canvas) {
      this.mouseNDC = new THREE.Vector2(0, 0);
      this.interactRaycaster = new THREE.Raycaster();
      this.interactables = [];

      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.cameraMode !== 'walk') return;
        this.walkState.isLooking = true;
        this.walkState.downMouseX = e.clientX;
        this.walkState.downMouseY = e.clientY;
        this.walkState.lastMouseX = e.clientX;
        this.walkState.lastMouseY = e.clientY;
      });

      window.addEventListener('pointermove', (e) => {
        if (this.cameraMode !== 'walk') return;

        // Track cursor NDC for hovering 3D cabin buttons & switches
        if (this.canvas) {
          const rect = this.canvas.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            this.mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          }
        }

        if (!this.walkState.isLooking) return;
        // Clamp pointer delta per frame to prevent any sudden jumps or violent camera jerks
        const rawDx = e.clientX - this.walkState.lastMouseX;
        const rawDy = e.clientY - this.walkState.lastMouseY;
        this.walkState.lastMouseX = e.clientX;
        this.walkState.lastMouseY = e.clientY;

        const dx = Math.max(-42, Math.min(42, rawDx));
        const dy = Math.max(-42, Math.min(42, rawDy));

        this.walkState.yaw -= dx * 0.0030;
        // Strictly clamp pitch to ±58 degrees (±1.01 rad) so camera NEVER flips upside down
        this.walkState.pitch = Math.max(-1.01, Math.min(1.01, this.walkState.pitch - dy * 0.0028));
      });

      window.addEventListener('pointerup', (e) => {
        if (this.walkState.isLooking && this.cameraMode === 'walk') {
          const moveDist = Math.hypot(
            e.clientX - (this.walkState.downMouseX || e.clientX),
            e.clientY - (this.walkState.downMouseY || e.clientY)
          );
          // If user clicked without dragging, trigger 3D button/switch interaction!
          if (moveDist < 7) {
            this.triggerCabinInteraction(this.mouseNDC);
          }
        }
        this.walkState.isLooking = false;
      });

      window.addEventListener('pointercancel', () => {
        this.walkState.isLooking = false;
      });
    }

    this.setupXRControllers();

    const bindDpad = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        if (keyName === 'jump') {
          this.triggerAstronautJump();
        } else {
          this.walkState.keys[keyName] = true;
        }
      };
      const end = (e) => {
        e.preventDefault();
        if (keyName !== 'jump') this.walkState.keys[keyName] = false;
      };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', end);
      btn.addEventListener('pointerleave', end);
    };

    bindDpad('walk-btn-up', 'w');
    bindDpad('walk-btn-down', 's');
    bindDpad('walk-btn-left', 'a');
    bindDpad('walk-btn-right', 'd');
    bindDpad('walk-btn-jump', 'jump');
  }

  toggleWalkPerspective() {
    this.walkViewMode = this.walkViewMode === 'fp' ? 'tp' : 'fp';
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    const btn = document.getElementById('btn-walk-view-toggle');
    if (btn) {
      btn.innerText = this.walkViewMode === 'fp'
        ? (isTr ? '👁️ Görünüm: 1. Şahıs (Astronot Elleri)' : '👁️ View: 1st Person (EVA Hands)')
        : (isTr ? '🧑🏼‍🚀 Görünüm: 3. Şahıs (Tam Astronot)' : '🧑🏼‍🚀 View: 3rd Person (Full Astronaut)');
    }
    this.updateAstronautVisibility();
  }

  getDescentOffset(t = this.simTime) {
    if (t >= 5.8) return 0;
    const progress = Math.max(0, Math.min(1, t / 5.8));
    const ease = 1 - Math.pow(1 - progress, 2.15);
    return (1 - ease) * 68.0;
  }

  playHatchPneumaticSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.uiAudioCtx) this.uiAudioCtx = new AudioCtx();
      if (this.uiAudioCtx.state === 'suspended') this.uiAudioCtx.resume();
      const now = this.uiAudioCtx.currentTime;

      // Mechanical valve wheel ratchet clicks (3 metallic turns)
      [0, 0.14, 0.28].forEach((delay, idx) => {
        const osc = this.uiAudioCtx.createOscillator();
        const gain = this.uiAudioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340 + idx * 90, now + delay);
        osc.frequency.exponentialRampToValueAtTime(160, now + delay + 0.09);
        gain.gain.setValueAtTime(0.16, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.10);
        osc.connect(gain);
        gain.connect(this.uiAudioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.11);
      });

      // Pressurized cabin air seal release hiss (white-noise burst)
      const bufSize = this.uiAudioCtx.sampleRate * 0.45;
      const noiseBuf = this.uiAudioCtx.createBuffer(1, bufSize, this.uiAudioCtx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.uiAudioCtx.sampleRate * 0.16));
      }
      const noise = this.uiAudioCtx.createBufferSource();
      noise.buffer = noiseBuf;
      const filter = this.uiAudioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      const nGain = this.uiAudioCtx.createGain();
      nGain.gain.setValueAtTime(0.22, now + 0.30);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.uiAudioCtx.destination);
      noise.start(now + 0.30);
    } catch (_) {}
  }

  triggerOpenHatch(autoStepOut = false) {
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    const statusEl = document.getElementById('walk-xr-status');
    const btn = document.getElementById('btn-walk-cabin');

    // Prevent opening the pressurized hatch while the rocket is still descending in mid-air!
    if (this.simTime < 5.5) {
      this.playSwitchClickSound(290);
      setTimeout(() => this.playSwitchClickSound(240), 110);
      if (statusEl) {
        statusEl.innerText = isTr
          ? `⚠️ GÜVENLİK KİLİDİ: Roket अभी inişte (+${this.getDescentOffset().toFixed(1)}m)! Yüzeye inmeden kapak açılamaz!`
          : `⚠️ SAFETY INTERLOCK: Rocket still descending (+${this.getDescentOffset().toFixed(1)}m)! Wait for touchdown to open hatch!`;
      }
      return false;
    }

    if (!this.cabinState.hatchOpen) {
      this.cabinState.hatchOpen = true;
      this.walkState.handReachTimer = 1.05; // Animate astronaut right hand reaching out to turn the valve & push hatch!
      this.playHatchPneumaticSound();
      if (btn) {
        btn.classList.add('active');
        btn.innerText = isTr ? '🪜 Merdivenden Yüzeye İn (E)' : '🪜 Step Out & Climb Down (E)';
      }
      if (autoStepOut) {
        // Turn astronaut toward the opening hatch door (+Z) so they watch the valve spin & door swing open, then step onto ladder porch!
        this.walkState.x = 0;
        this.walkState.z = 1.38;
        this.walkState.yaw = Math.PI;
        this.walkState.pitch = -0.05;
        setTimeout(() => {
          if (this.cameraMode === 'walk' && this.walkState.isInsideCabin) {
            this.walkState.isInsideCabin = false;
            this.walkState.isOnLadder = true;
            this.walkState.x = 0;
            this.walkState.z = 2.55;
            this.walkState.yaw = 0;
            this.walkState.smoothYaw = 0;
            this.walkState.pitch = -0.22;
            this.walkState.smoothPitch = -0.22;
            if (btn) {
              btn.classList.remove('active');
              btn.innerText = isTr ? '🦶 Yüzeye Tam İn / Kabine Dön (E)' : '🦶 Step to Surface / Return (E)';
            }
          }
        }, 680);
      }
      return true;
    }
    return true;
  }

  toggleCabinInterior() {
    if (this.cameraMode !== 'walk') {
      this.setCameraMode('walk');
      return;
    }
    const ws = this.walkState;
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    const btn = document.getElementById('btn-walk-cabin');

    if (ws.isInsideCabin) {
      // If hatch is still closed, first animate the astronaut opening the hatch door & stepping onto the top ladder porch!
      if (!this.cabinState.hatchOpen) {
        this.triggerOpenHatch(true);
        return;
      }
      // Hatch is already open: step down the ladder onto the planetary surface!
      ws.isInsideCabin = false;
      ws.isOnLadder = false;
      ws.x = 0;
      ws.z = 6.8;
      ws.y = this.getExactSurfaceHeight(0, 6.8);
      ws.vy = 0;
      ws.isGrounded = true;
      ws.yaw = 0;
      ws.smoothYaw = 0;
      ws.pitch = 0.05;
      ws.smoothPitch = 0.05;
      this.spawnFootprint(0, 6.8, 0, true);
      this.spawnFootprint(0, 6.8, 0, false);
      this.spawnBootDust(0, 6.8, 8);
      if (btn) {
        btn.classList.remove('active');
        btn.innerText = isTr ? '🪜 Aracın İçine Gir / Kabin (E)' : '🪜 Enter Spacecraft Cabin (E)';
      }
    } else if (ws.isOnLadder) {
      // If currently on the ladder, step all the way down onto the planetary surface
      ws.isOnLadder = false;
      ws.isInsideCabin = false;
      ws.x = 0;
      ws.z = 6.8;
      ws.y = this.getExactSurfaceHeight(0, 6.8);
      ws.vy = 0;
      ws.isGrounded = true;
      this.spawnFootprint(0, 6.8, ws.smoothYaw, true);
      this.spawnFootprint(0, 6.8, ws.smoothYaw, false);
      this.spawnBootDust(0, 6.8, 8);
      if (btn) {
        btn.classList.remove('active');
        btn.innerText = isTr ? '🪜 Aracın İçine Gir / Kabin (E)' : '🪜 Enter Spacecraft Cabin (E)';
      }
    } else {
      // Outside on the surface -> climb up ladder and enter the NASA Spacecraft Interior Cabin!
      this.cabinState.hatchOpen = true;
      ws.isInsideCabin = true;
      ws.isOnLadder = false;
      ws.x = 0;
      ws.z = 0.85;
      ws.y = 4.5 + this.getDescentOffset();
      ws.vy = 0;
      ws.isGrounded = true;
      ws.yaw = 0;
      ws.smoothYaw = 0;
      ws.pitch = -0.04;
      ws.smoothPitch = -0.04;
      if (btn) {
        btn.classList.add('active');
        btn.innerText = isTr ? '🚪 Kabinden Yüzeye Çık (E)' : '🚪 Exit Cabin to Surface (E)';
      }
    }
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    if (this.flashlight) {
      this.flashlight.intensity = this.flashlightOn ? 3.8 : 0;
    }
    const btn = document.getElementById('btn-walk-torch');
    if (btn) {
      btn.classList.toggle('active', this.flashlightOn);
    }
  }

  updateAstronautVisibility() {
    const isWalk = this.cameraMode === 'walk';
    if (this.fpRig) {
      this.fpRig.visible = isWalk && (this.walkViewMode === 'fp' || !!this.xrSession);
    }
    if (this.tpAstronaut) {
      this.tpAstronaut.visible = isWalk && this.walkViewMode === 'tp' && !this.xrSession;
    }
  }

  triggerAstronautJump() {
    if (this.walkState.isGrounded && !this.walkState.isInsideCabin) {
      const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
      const jumpVel = body === 'moon' ? 4.4 : body === 'outer' ? 4.6 : body === 'mars' ? 3.5 : 2.6;
      this.walkState.vy = jumpVel;
      this.walkState.isGrounded = false;
      this.spawnBootDust(this.walkState.x, this.walkState.z, 10);
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect && camSelect.value !== mode) camSelect.value = mode;

    const walkHud = document.getElementById('walk-hud-overlay');
    const walkBtn = document.getElementById('btn-sim-walk');
    const cabinBtn = document.getElementById('btn-walk-cabin');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;

    if (mode === 'walk') {
      // Start the rocket/lander descending from the sky with the astronaut INSIDE the pressurized cabin!
      if (this.simTime > 5.8 && !this.walkDescentPlayed) {
        this.simTime = 0;
        this.touchdownConfirmed = false;
      }
      this.walkDescentPlayed = true;

      if (this.spacecraft) {
        this.spacecraft.visible = true;
        if (this.currentArtifact && this.currentArtifact.category === 'impact') {
          this.spacecraft.position.set(-8.2, 2.3 + this.getDescentOffset(), -2.5);
          this.spacecraft.rotation.set(0.2, 0.4, Math.PI * 0.42);
        }
      }
      this.camera.rotation.order = 'YXZ';
      // Place the astronaut INSIDE the descending rocket cockpit facing the front windows & DSKY computer!
      this.walkState.isInsideCabin = true;
      this.walkState.isOnLadder = false;
      this.walkState.x = -0.52;
      this.walkState.z = -0.62;
      this.walkState.y = 4.5 + this.getDescentOffset();
      this.walkState.vy = 0;
      this.walkState.isGrounded = true;
      this.walkState.yaw = -0.18;
      this.walkState.pitch = -0.14;
      this.walkState.smoothYaw = -0.18;
      this.walkState.smoothPitch = -0.14;
      this.walkState.moveBlend = 0;
      this.walkState.handReachTimer = 0;

      if (this.cabinState) {
        this.cabinState.hatchOpen = false;
        this.cabinState.hatchProgress = 0.0;
        this.cabinState.prog = '64';
        this.cabinState.throttlePct = 82;
        this.refreshCabinDisplays();
      }

      if (cabinBtn) {
        cabinBtn.classList.add('active');
        cabinBtn.innerText = isTr
          ? '🚪 Kapağı Aç & Dışarı Çık (E)'
          : '🚪 Open Hatch & Exit (E)';
      }

      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = true;
      if (walkHud) walkHud.classList.remove('hidden');
      if (walkBtn) walkBtn.classList.add('active');
      if (this.controls) this.controls.enabled = false;
    } else {
      this.camera.rotation.order = 'XYZ';
      this.camera.rotation.z = 0;
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      this.walkState.isInsideCabin = false;
      this.walkState.isOnLadder = false;
      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = false;
      if (walkHud) walkHud.classList.add('hidden');
      if (walkBtn) walkBtn.classList.remove('active');
      if (this.controls) {
        this.controls.enabled = (mode === 'free');
        if (this.spacecraft) this.controls.target.copy(this.spacecraft.position);
      }
    }
    this.updateAstronautVisibility();
  }

  async enterWebXR() {
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    this.setCameraMode('walk');

    const statusEl = document.getElementById('walk-xr-status');
    if (navigator.xr) {
      try {
        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        const arSupported = !vrSupported && (await navigator.xr.isSessionSupported('immersive-ar'));
        if (vrSupported || arSupported) {
          const mode = vrSupported ? 'immersive-vr' : 'immersive-ar';
          const session = await navigator.xr.requestSession(mode, {
            optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
          });
          this.xrSession = session;
          this.renderer.xr.setReferenceSpaceType('local-floor');
          await this.renderer.xr.setSession(session);
          this.updateAstronautVisibility();

          if (statusEl) {
            statusEl.innerText = isTr
              ? "🥽 WEBXR VR/AR AKTİF: Meta Quest / Vision Pro 1:1 Yüzey Oturumu (Thumbstick ile Yürü)"
              : "🥽 WEBXR VR/AR ACTIVE: 1:1 Immersive Surface Session (Use Thumbsticks to Walk)";
          }
          session.addEventListener('end', () => {
            this.xrSession = null;
            this.updateAstronautVisibility();
          });
          return;
        }
      } catch (err) {
        console.warn('WebXR session fallback:', err);
      }
    }

    if (statusEl) {
      statusEl.innerText = isTr
        ? "🥽 1:1 ASTRONOT VİZÖR & ELLER MODU AKTİF (WASD: Yürü • Fare Sürükle: 360° Bak • SPACE: Sıçra • V: 1./3. Şahıs • F: Fener)"
        : "🥽 1:1 ASTRONAUT VISOR & HANDS ACTIVE (WASD: Walk • Drag: Look 360° • SPACE: Jump • V: 1st/3rd Person • F: Torch)";
    }
  }

  startSurfaceWalk(artifact) {
    this.cameraMode = 'walk';
    this.startSimulation(artifact);
    this.setCameraMode('walk');
  }

  getTerrainHeight(vx, vz) {
    const d = Math.sqrt(vx * vx + vz * vz);
    let y = Math.sin(vx * 0.055) * Math.cos(vz * 0.055) * 1.9;
    y += Math.sin(vx * 0.14 + 1.1) * Math.cos(vz * 0.12) * 0.65;
    if (d < 22) {
      // Flat landing pad zone around spacecraft so feet & landing pads rest cleanly
      const blend = Math.max(0, (d - 10) / 12);
      y *= blend;
    } else if (d < 42) {
      const rim = 1 - Math.abs((d - 32) / 10);
      if (rim > 0) y += rim * 1.6;
    }
    return y;
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    if (this.renderer.xr && this.renderer.xr.isPresenting) return;

    const wrapper = this.canvas.parentElement;
    let w = wrapper && wrapper.clientWidth > 0 ? wrapper.clientWidth : window.innerWidth;
    let h = wrapper && wrapper.clientHeight > 0 ? wrapper.clientHeight : window.innerHeight;

    if (!w || !h || w <= 0 || h <= 0) {
      w = window.innerWidth || 800;
      h = window.innerHeight || 600;
    }

    this.currentW = w;
    this.currentH = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, true);
  }

  startSimulation(artifact) {
    if (!this.overlay) {
      this.overlay = document.getElementById('simulation-modal');
      this.canvas = document.getElementById('sim-canvas');
    }
    if (!this.renderer) this.init();
    if (!this.overlay || !this.canvas) return;

    this.currentArtifact = artifact;
    this.simTime = 0;
    this.walkDescentPlayed = (this.cameraMode === 'walk');
    this.touchdownConfirmed = false;
    this.lastCockpitTick = 0;
    this.isPlaying = true;
    this.shakeIntensity = 0;
    this.craneCrashed = false;
    this.impactTriggered = false;

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) camSelect.value = this.cameraMode;

    this.overlay.classList.add('open');

    this.onResize();
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 60);

    const titleEl = document.getElementById('sim-title');
    const badgeEl = document.getElementById('sim-badge');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;

    if (titleEl) titleEl.innerText = isTr ? artifact.name_tr : artifact.name_en;
    if (badgeEl) {
      if (artifact.category === 'impact') {
        badgeEl.innerText = isTr ? "💥 KİNETİK ÇARPIŞMA CANLANDIRMASI" : "💥 KINETIC IMPACT REENACTMENT";
        badgeEl.style.borderColor = "#ef4444";
        badgeEl.style.color = "#f87171";
      } else if (artifact.category === 'helicopter') {
        badgeEl.innerText = isTr ? "🚁 AERODİNAMİK UÇUŞ CANLANDIRMASI" : "🚁 AERODYNAMIC FLIGHT REENACTMENT";
        badgeEl.style.borderColor = "#00f0ff";
        badgeEl.style.color = "#00f0ff";
      } else if (artifact.id === 'curiosity-skycrane') {
        badgeEl.innerText = isTr ? "🚀 GÖKYÜZÜ VİNCİ İNİŞ & KAZA CANLANDIRMASI" : "🚀 SKY CRANE DESCENT & FLYAWAY";
        badgeEl.style.borderColor = "#ffb300";
        badgeEl.style.color = "#fde68a";
      } else if (artifact.body === 'venus') {
        badgeEl.innerText = isTr ? "🔥 VENÜS 92 ATM BASINÇLI İNİŞ CANLANDIRMASI" : "🔥 VENUS 92 ATM PRESSURE DESCENT";
        badgeEl.style.borderColor = "#f59e0b";
        badgeEl.style.color = "#fcd34d";
      } else if (artifact.body === 'outer') {
        badgeEl.innerText = isTr ? "🪐 DIŞ GÜNEŞ SİSTEMİ İNİŞ CANLANDIRMASI" : "🪐 OUTER SYSTEM TOUCHDOWN REENACTMENT";
        badgeEl.style.borderColor = "#38bdf8";
        badgeEl.style.color = "#7dd3fc";
      } else {
        badgeEl.innerText = isTr ? "🛰️ YÜZEYE İNİŞ & 1:1 WEBXR SAHNESİ" : "🛰️ TOUCHDOWN & 1:1 WEBXR SCENE";
        badgeEl.style.borderColor = "#10b981";
        badgeEl.style.color = "#34d399";
      }
    }

    if (window.SpaceAudio) {
      window.SpaceAudio.playRadioTransmission(artifact.audioSnippet || artifact.quote_en || "");
    }

    this.buildSimulationScene(artifact);
    this.setCameraMode(this.cameraMode);

    this.lastTime = performance.now();
    // Use setAnimationLoop so both standard desktop browsers and WebXR headsets render seamlessly
    this.renderer.setAnimationLoop(() => this.renderFrame());
  }

  stopSimulation() {
    this.isPlaying = false;
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }
    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
      this.xrSession = null;
    }
    if (this.overlay) this.overlay.classList.remove('open');
  }

  // ===========================================================================
  // ARTICULATED 3D ASTRONAUT BUILDER (FIRST-PERSON EVA HANDS + FULL 3RD-PERSON SUIT)
  // ===========================================================================
  buildAstronautRigs() {
    // 1. First-Person EVA Hands, Wrist Telemetry Computer & Flashlight attached to Camera
    if (this.fpRig) {
      this.camera.remove(this.fpRig);
    }
    this.fpRig = new THREE.Group();

    const suitFabricMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.72, metalness: 0.08 });
    const gloveGreyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.55, metalness: 0.22 });
    const blueAnodized = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.88 });
    const redAnodized = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.88 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 });
    const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Subtle Helmet Visor Upper & Lower Bezel inside First-Person View
    const visorTopRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.018, 10, 32, Math.PI),
      darkMetal
    );
    visorTopRim.position.set(0, 0.08, -0.36);
    this.fpRig.add(visorTopRim);

    // --- LEFT EVA ARM & GLOVED HAND (with Cuff Checklist & Digital Telemetry Screen) ---
    this.fpLeftArm = new THREE.Group();
    this.fpLeftArm.position.set(-0.27, -0.26, -0.44);
    this.fpLeftArm.rotation.set(0.42, 0.22, -0.18);

    // Forearm pressurized sleeve + bellows rings
    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.082, 0.38, 16), suitFabricMat);
    leftSleeve.rotation.x = Math.PI / 2;
    leftSleeve.position.z = 0.16;
    this.fpLeftArm.add(leftSleeve);

    // Blue anodized wrist locking ring
    const leftWristRing = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.012, 12, 24), blueAnodized);
    leftWristRing.position.z = -0.02;
    this.fpLeftArm.add(leftWristRing);

    // EVA Cuff Checklist & Glowing OLED Telemetry Display on Left Wrist
    const cuffBase = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.13), darkMetal);
    cuffBase.position.set(0.02, 0.068, 0.08);
    cuffBase.rotation.z = -0.25;
    const cuffScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.105), screenGlowMat);
    cuffScreen.rotation.x = -Math.PI / 2;
    cuffScreen.position.y = 0.014;
    cuffBase.add(cuffScreen);
    // Telemetry bars on wrist screen
    const bar1 = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.012), cyanGlowMat);
    bar1.rotation.x = -Math.PI / 2;
    bar1.position.set(0, 0.015, -0.025);
    cuffBase.add(bar1);
    this.fpLeftArm.add(cuffBase);

    // Left Palm & 5 Articulated Fingers
    const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.042, 0.11), gloveGreyMat);
    leftPalm.position.set(0, 0, -0.085);
    this.fpLeftArm.add(leftPalm);

    // Thumb
    const leftThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.065, 10), gloveGreyMat);
    leftThumb.rotation.x = Math.PI / 2.4;
    leftThumb.rotation.z = -0.55;
    leftThumb.position.set(0.058, -0.005, -0.10);
    this.fpLeftArm.add(leftThumb);

    // 4 Fingers slightly curled
    for (let f = 0; f < 4; f++) {
      const fx = -0.033 + f * 0.022;
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.075, 10), gloveGreyMat);
      finger.rotation.x = Math.PI / 2 + 0.25;
      finger.position.set(fx, -0.008, -0.165);
      this.fpLeftArm.add(finger);
    }
    this.fpRig.add(this.fpLeftArm);

    // --- RIGHT EVA ARM & GLOVED HAND (Gripping Lunar Geological Scanner / LED Torch) ---
    this.fpRightArm = new THREE.Group();
    this.fpRightArm.position.set(0.28, -0.26, -0.44);
    this.fpRightArm.rotation.set(0.38, -0.20, 0.15);

    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.082, 0.38, 16), suitFabricMat);
    rightSleeve.rotation.x = Math.PI / 2;
    rightSleeve.position.z = 0.16;
    this.fpRightArm.add(rightSleeve);

    const rightWristRing = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.012, 12, 24), redAnodized);
    rightWristRing.position.z = -0.02;
    this.fpRightArm.add(rightWristRing);

    const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.042, 0.11), gloveGreyMat);
    rightPalm.position.set(0, 0, -0.085);
    this.fpRightArm.add(rightPalm);

    const rightThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.065, 10), gloveGreyMat);
    rightThumb.rotation.x = Math.PI / 2.4;
    rightThumb.rotation.z = 0.55;
    rightThumb.position.set(-0.058, -0.005, -0.10);
    this.fpRightArm.add(rightThumb);

    for (let f = 0; f < 4; f++) {
      const fx = -0.033 + f * 0.022;
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.07, 10), gloveGreyMat);
      finger.rotation.x = Math.PI / 2 + 0.55;
      finger.position.set(fx, -0.012, -0.155);
      this.fpRightArm.add(finger);
    }

    // Handheld NASA EVA Torch / Laser Spectrometer Tool in Right Hand
    const toolGroup = new THREE.Group();
    toolGroup.position.set(-0.01, 0.025, -0.14);
    const toolBody = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.024, 0.22, 14), darkMetal);
    toolBody.rotation.x = Math.PI / 2;
    const toolLens = new THREE.Mesh(new THREE.CircleGeometry(0.023, 16), cyanGlowMat);
    toolLens.position.z = -0.112;
    toolLens.rotation.y = Math.PI;
    toolGroup.add(toolBody, toolLens);
    this.fpRightArm.add(toolGroup);

    // Dynamic SpotLight Beam from the Right-Hand EVA Tool
    this.flashlight = new THREE.SpotLight(0xe0f2fe, this.flashlightOn ? 3.8 : 0, 55, Math.PI / 5, 0.45, 1.2);
    this.flashlight.position.set(0.25, -0.2, -0.55);
    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, -0.1, -12);
    this.fpRig.add(this.flashlight);
    this.fpRig.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;

    this.camera.add(this.fpRig);

    // 2. Full 3rd-Person Articulated Astronaut Model (visible in 3rd-Person Walk Mode)
    this.tpAstronaut = this.createFullAstronautMesh();
    this.tpAstronaut.visible = false;
    this.scene.add(this.tpAstronaut);
  }

  createFullAstronautMesh() {
    const root = new THREE.Group();

    // High-grade PBR Spacesuit Materials (Apollo A7L / Artemis xEMU)
    const suitWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.68, metalness: 0.08 });
    const suitSoftGrey = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.75, metalness: 0.12 });
    const bellowsDark = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.35 });
    const visorGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.08, metalness: 0.98 });
    const visorInnerDark = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.8 });
    const bootGrey = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65, metalness: 0.25 });
    const treadDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92, metalness: 0.15 });
    const redCommander = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.2 });
    const blueAnodized = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.22 });
    const redAnodized = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.85, roughness: 0.22 });
    const chromeMetal = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 });
    const goldKapton = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.28 });
    const ledGreen = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // -------------------------------------------------------------------------
    // 1. UPPER BODY GROUP (Torso, Waist Bellows, Pelvis, PLSS, Chest Camera, Helmet)
    // -------------------------------------------------------------------------
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.86, 0);
    root.add(upperBody);

    // Sculpted Pelvis / Hip Brief (connects legs to waist smoothly)
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.20, 20), suitWhite);
    pelvis.scale.set(1.08, 1.0, 0.82);
    pelvis.position.set(0, 0.02, 0);
    pelvis.castShadow = true;
    upperBody.add(pelvis);

    // Corrugated Rubber Waist Bellows Ring
    for (let w = 0; w < 2; w++) {
      const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.024, 12, 24), bellowsDark);
      waistRing.rotation.x = Math.PI / 2;
      waistRing.scale.set(1.08, 0.82, 1.0);
      waistRing.position.set(0, 0.11 + w * 0.04, 0);
      upperBody.add(waistRing);
    }

    // Pressurized Upper Chest & Abdomen Shell (contoured elliptical cylinder + shoulder slope)
    const chestCore = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.215, 0.48, 24), suitWhite);
    chestCore.scale.set(1.12, 1.0, 0.80);
    chestCore.position.set(0, 0.37, 0);
    chestCore.castShadow = true;
    upperBody.add(chestCore);

    // Upper Shoulder Yoke & Collar Taper
    const shoulderYoke = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), suitWhite);
    shoulderYoke.scale.set(1.18, 0.48, 0.80);
    shoulderYoke.position.set(0, 0.58, 0);
    shoulderYoke.castShadow = true;
    upperBody.add(shoulderYoke);

    // Commander Diagonal Chest Straps (Apollo PLSS Harness)
    for (let side = -1; side <= 1; side += 2) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.50, 0.02), suitSoftGrey);
      strap.position.set(side * 0.14, 0.39, -0.185);
      strap.rotation.z = side * 0.08;
      upperBody.add(strap);
    }

    // Anodized Aluminum Neck Locking Ring
    const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.02, 14, 28), chromeMetal);
    neckRing.rotation.x = Math.PI / 2;
    neckRing.position.set(0, 0.68, 0);
    upperBody.add(neckRing);

    // -------------------------------------------------------------------------
    // 2. HELMET & 24K GOLD LEVA BUBBLE VISOR + SIDE LAMPS
    // -------------------------------------------------------------------------
    const helmetGroup = new THREE.Group();
    helmetGroup.position.set(0, 0.84, 0);
    upperBody.add(helmetGroup);

    // Outer White LEVA Protective Shell (back & crown of helmet)
    const helmetShell = new THREE.Mesh(new THREE.SphereGeometry(0.215, 28, 28), suitWhite);
    helmetShell.scale.set(0.96, 1.05, 1.02);
    helmetShell.castShadow = true;
    helmetGroup.add(helmetShell);

    // Inner Dark Pressure Bubble
    const innerVisor = new THREE.Mesh(
      new THREE.SphereGeometry(0.198, 24, 24, -Math.PI * 0.88, Math.PI * 0.76, Math.PI * 0.16, Math.PI * 0.62),
      visorInnerDark
    );
    innerVisor.position.set(0, -0.01, -0.025);
    helmetGroup.add(innerVisor);

    // Reflective 24K Gold Curved Sun Visor
    const goldVisor = new THREE.Mesh(
      new THREE.SphereGeometry(0.208, 28, 28, -Math.PI * 0.86, Math.PI * 0.72, Math.PI * 0.18, Math.PI * 0.56),
      visorGold
    );
    goldVisor.position.set(0, 0.0, -0.025);
    helmetGroup.add(goldVisor);

    // Visor Sunshield Brow Visor Cap + Center Latch Tab
    const sunShieldCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.222, 24, 16, -Math.PI * 0.9, Math.PI * 0.8, Math.PI * 0.08, Math.PI * 0.24),
      suitWhite
    );
    helmetGroup.add(sunShieldCap);

    // Left & Right Temple EVA Floodlights + Ear Pivot Knobs
    for (let s = -1; s <= 1; s += 2) {
      const earPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.03, 14), chromeMetal);
      earPivot.rotation.z = Math.PI / 2;
      earPivot.position.set(s * 0.205, 0.01, 0.01);
      helmetGroup.add(earPivot);

      const lampPod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.08, 12), suitSoftGrey);
      lampPod.rotation.x = Math.PI / 2;
      lampPod.position.set(s * 0.215, 0.05, -0.04);
      const lampLens = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), ledCyan);
      lampLens.position.set(s * 0.215, 0.05, -0.082);
      lampLens.rotation.y = Math.PI;
      helmetGroup.add(lampPod, lampLens);
    }

    // -------------------------------------------------------------------------
    // 3. PLSS LIFE SUPPORT BACKPACK + OPS MODULE + ANTENNA + OXYGEN HOSES
    // -------------------------------------------------------------------------
    const plssGroup = new THREE.Group();
    plssGroup.position.set(0, 0.38, 0.26);
    upperBody.add(plssGroup);

    // Main Contoured Fiberglass PLSS Housing
    const plssMain = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.22), suitWhite);
    plssMain.castShadow = true;
    plssGroup.add(plssMain);

    // Rounded Side Pillars of PLSS
    for (let s = -1; s <= 1; s += 2) {
      const sideEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.54, 16), suitWhite);
      sideEdge.position.set(s * 0.19, 0, 0);
      sideEdge.castShadow = true;
      plssGroup.add(sideEdge);
    }

    // Top OPS (Oxygen Purge System) Emergency Module & Commander Stripe
    const opsBox = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.15, 0.21), suitSoftGrey);
    opsBox.position.set(0, 0.34, 0.0);
    opsBox.castShadow = true;
    plssGroup.add(opsBox);

    const opsRedBand = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.038, 0.22), redCommander);
    opsRedBand.position.set(0, 0.36, 0.0);
    plssGroup.add(opsRedBand);

    // Collapsible VHF Dipole Whip Antenna
    const antennaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.06, 10), chromeMetal);
    antennaBase.position.set(0.13, 0.44, 0.02);
    const antennaWhip = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.009, 0.38, 8), chromeMetal);
    antennaWhip.position.set(0.13, 0.64, 0.02);
    plssGroup.add(antennaBase, antennaWhip);

    // Back Thermal Louvers & Telemetry Status Lights
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 0.025), bellowsDark);
    backPanel.position.set(0, 0.02, 0.11);
    plssGroup.add(backPanel);

    const plssLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), ledGreen);
    plssLed.position.set(-0.14, 0.20, 0.115);
    plssGroup.add(plssLed);

    // Dual Braided Oxygen & Water Umbilical Hoses curving from PLSS to Front Torso
    for (let s = -1; s <= 1; s += 2) {
      const hoseMat = s < 0 ? blueAnodized : redAnodized;
      const hoseCurve = new THREE.TorusGeometry(0.22, 0.022, 10, 20, Math.PI * 0.95);
      const hoseMesh = new THREE.Mesh(hoseCurve, suitSoftGrey);
      hoseMesh.rotation.y = Math.PI / 2;
      hoseMesh.rotation.x = Math.PI * 0.12;
      hoseMesh.position.set(s * 0.23, 0.18, 0.02);
      upperBody.add(hoseMesh);

      // Front Anodized Umbilical Gas Valves (Blue Inlet / Red Outlet)
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.055, 14), hoseMat);
      valve.rotation.x = Math.PI / 2;
      valve.position.set(s * 0.125, 0.22, -0.195);
      upperBody.add(valve);
    }

    // -------------------------------------------------------------------------
    // 4. CHEST RCU DISPLAY & HASSELBLAD 500EL LUNAR DATA CAMERA
    // -------------------------------------------------------------------------
    const rcuBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.09), suitWhite);
    rcuBox.position.set(0, 0.44, -0.21);
    rcuBox.castShadow = true;
    upperBody.add(rcuBox);

    const rcuScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.045), ledGreen);
    rcuScreen.rotation.x = -Math.PI / 3;
    rcuScreen.position.set(0, 0.518, -0.21);
    upperBody.add(rcuScreen);

    // Authentic Apollo Silver Hasselblad 500EL Data Camera mounted below RCU
    const camGroup = new THREE.Group();
    camGroup.position.set(0, 0.31, -0.235);
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.095, 0.11), chromeMetal);
    const camMagazine = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.09, 0.06), suitSoftGrey);
    camMagazine.position.z = 0.06;
    const camLensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.085, 18), bellowsDark);
    camLensBarrel.rotation.x = Math.PI / 2;
    camLensBarrel.position.z = -0.08;
    const camLensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.032, 16), visorInnerDark);
    camLensGlass.position.z = -0.124;
    camLensGlass.rotation.y = Math.PI;
    camGroup.add(camBody, camMagazine, camLensBarrel, camLensGlass);
    upperBody.add(camGroup);

    // -------------------------------------------------------------------------
    // 5. 2-BONE ARTICULATED ARMS (Shoulder -> Upper Arm -> Elbow Bellows -> Forearm -> 5-Finger Glove)
    // -------------------------------------------------------------------------
    const buildArm = (isLeft) => {
      const sign = isLeft ? -1 : 1;
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sign * 0.31, 0.54, 0.0);

      // Shoulder Joint Dome & Corrugated Convolutes
      const shoulderBall = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), suitWhite);
      shoulderBall.castShadow = true;
      shoulderGroup.add(shoulderBall);

      // Upper Arm Segment
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.074, 0.27, 16), suitWhite);
      upperArm.position.y = -0.14;
      upperArm.castShadow = true;
      shoulderGroup.add(upperArm);

      // Commander Red Armband & Mission Patch
      const armBand = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.081, 0.042, 16), redCommander);
      armBand.position.y = -0.12;
      shoulderGroup.add(armBand);

      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.055, 0.075),
        isLeft ? blueAnodized : redCommander
      );
      patch.position.set(sign * 0.078, -0.06, 0);
      shoulderGroup.add(patch);

      // Elbow Joint & Forearm Group (2nd Bone for natural elbow bend!)
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.28, 0);
      shoulderGroup.add(forearmGroup);

      // Corrugated Black Rubber Elbow Bellows
      for (let b = -1; b <= 1; b++) {
        const elbowRing = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.014, 10, 18), bellowsDark);
        elbowRing.rotation.x = Math.PI / 2;
        elbowRing.position.y = b * 0.022;
        forearmGroup.add(elbowRing);
      }

      // Forearm Pressurized Sleeve
      const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.062, 0.25, 16), suitWhite);
      forearmMesh.position.y = -0.14;
      forearmMesh.castShadow = true;
      forearmGroup.add(forearmMesh);

      // Left Wrist OLED Cuff Checklist
      if (isLeft) {
        const cuffChecklist = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.095, 0.03), bellowsDark);
        cuffChecklist.position.set(-0.02, -0.18, -0.058);
        const cuffGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.075), ledGreen);
        cuffGlow.position.z = -0.016;
        cuffGlow.rotation.y = Math.PI;
        cuffChecklist.add(cuffGlow);
        forearmGroup.add(cuffChecklist);
      }

      // Anodized Wrist Locking Ring (Blue Left / Red Right)
      const wristRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.060, 0.011, 10, 20),
        isLeft ? blueAnodized : redAnodized
      );
      wristRing.rotation.x = Math.PI / 2;
      wristRing.position.y = -0.265;
      forearmGroup.add(wristRing);

      // Sculpted EVA Gauntlet & 5-Finger Glove
      const gloveGroup = new THREE.Group();
      gloveGroup.position.set(0, -0.31, 0);
      forearmGroup.add(gloveGroup);

      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.042), bootGrey);
      palm.castShadow = true;
      gloveGroup.add(palm);

      const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.015, 0.055, 8), bootGrey);
      thumb.position.set(sign * -0.042, -0.01, -0.025);
      thumb.rotation.x = 0.5;
      thumb.rotation.z = sign * 0.45;
      gloveGroup.add(thumb);

      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.062, 8), bootGrey);
        finger.position.set((f - 1.5) * 0.018, -0.062, -0.01);
        finger.rotation.x = 0.35;
        gloveGroup.add(finger);
      }

      // If Right Hand: attach EVA Handheld Torch + 3rd-Person SpotLight Beam
      if (!isLeft) {
        const tpTorch = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.02, 0.18, 12), bellowsDark);
        tpTorch.rotation.x = Math.PI / 2;
        tpTorch.position.set(0, -0.04, -0.07);
        const tpTorchLens = new THREE.Mesh(new THREE.CircleGeometry(0.019, 12), ledCyan);
        tpTorchLens.position.set(0, -0.04, -0.162);
        tpTorchLens.rotation.y = Math.PI;
        gloveGroup.add(tpTorch, tpTorchLens);
      }

      // Slight natural outward resting angle for pressurized suit arms
      shoulderGroup.rotation.z = sign * -0.08;
      forearmGroup.rotation.x = 0.28; // Natural forward elbow bend

      upperBody.add(shoulderGroup);
      return { shoulderGroup, forearmGroup };
    };

    const leftArmRig = buildArm(true);
    const rightArmRig = buildArm(false);

    // -------------------------------------------------------------------------
    // 6. 2-BONE ARTICULATED LEGS (Hip -> Thigh -> Knee Bellows -> Shin -> Lunar Overshoe Boot)
    // -------------------------------------------------------------------------
    const buildLeg = (isLeft) => {
      const sign = isLeft ? -1 : 1;
      const hipGroup = new THREE.Group();
      hipGroup.position.set(sign * 0.135, 0.84, 0);

      // Hip Joint Ball
      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 14), suitWhite);
      hipGroup.add(hipJoint);

      // Upper Thigh Pressurized Cylinder
      const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.092, 0.38, 16), suitWhite);
      thighMesh.position.y = -0.20;
      thighMesh.castShadow = true;
      hipGroup.add(thighMesh);

      // Apollo Commander Red Thigh Stripe
      const thighStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.103, 0.099, 0.055, 16), redCommander);
      thighStripe.position.y = -0.18;
      hipGroup.add(thighStripe);

      // Knee Joint & Lower Shin Group (2nd Bone for natural knee flexion!)
      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.40, 0);
      hipGroup.add(shinGroup);

      // Corrugated Knee Bellows Rings
      for (let k = -1; k <= 1; k++) {
        const kneeRing = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.016, 10, 18), bellowsDark);
        kneeRing.rotation.x = Math.PI / 2;
        kneeRing.position.y = k * 0.025;
        shinGroup.add(kneeRing);
      }

      // Lower Calf / Shin Pressurized Cylinder
      const shinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.082, 0.34, 16), suitWhite);
      shinMesh.position.y = -0.19;
      shinMesh.castShadow = true;
      shinGroup.add(shinMesh);

      // Sculpted Apollo Lunar Overshoe Boot (Ankle cuff + Rounded Toe + Gold Straps + Deep Ribbed Sole)
      const bootGroup = new THREE.Group();
      bootGroup.position.set(0, -0.37, 0);
      shinGroup.add(bootGroup);

      // Boot Ankle Collar
      const bootAnkle = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.094, 0.09, 16), bootGrey);
      bootAnkle.position.y = 0.02;
      bootGroup.add(bootAnkle);

      // Main Boot Foot Body & Rounded Toe Dome
      const bootFoot = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.095, 0.25), bootGrey);
      bootFoot.position.set(0, -0.02, -0.045);
      bootFoot.castShadow = true;
      bootGroup.add(bootFoot);

      const bootToe = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 12), bootGrey);
      bootToe.scale.set(1.0, 0.65, 1.15);
      bootToe.position.set(0, -0.022, -0.155);
      bootToe.castShadow = true;
      bootGroup.add(bootToe);

      // Gold Thermal Kapton Overshoe Straps across the instep
      for (let st = 0; st < 2; st++) {
        const bootStrap = new THREE.Mesh(new THREE.BoxGeometry(0.162, 0.022, 0.028), goldKapton);
        bootStrap.position.set(0, 0.022, -0.03 - st * 0.075);
        bootGroup.add(bootStrap);
      }

      // Heavy Dark-Grey Silicone Ribbed Lunar Tread Sole
      const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.028, 0.31), treadDark);
      bootSole.position.set(0, -0.062, -0.05);
      bootGroup.add(bootSole);

      for (let r = -3; r <= 3; r++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.168, 0.014, 0.022), bellowsDark);
        rib.position.set(0, -0.072, -0.05 + r * 0.038);
        bootGroup.add(rib);
      }

      root.add(hipGroup);
      return { hipGroup, shinGroup, bootGroup };
    };

    const leftLegRig = buildLeg(true);
    const rightLegRig = buildLeg(false);

    this.tpLimbs = {
      upperBody,
      helmetGroup,
      leftArm: leftArmRig.shoulderGroup,
      leftForearm: leftArmRig.forearmGroup,
      rightArm: rightArmRig.shoulderGroup,
      rightForearm: rightArmRig.forearmGroup,
      leftLeg: leftLegRig.hipGroup,
      leftShin: leftLegRig.shinGroup,
      rightLeg: rightLegRig.hipGroup,
      rightShin: rightLegRig.shinGroup
    };
    return root;
  }

  // ===========================================================================
  // HIGH-DETAIL LUNAR ROVING VEHICLE (LRV "MOON BUGGY") & SURFACE PROPS
  // ===========================================================================
  buildLunarRoverProp(x, z) {
    const lrv = new THREE.Group();
    const y = this.getTerrainHeight(x, z);
    lrv.position.set(x, y + 0.38, z);
    lrv.rotation.y = -0.65;

    const alumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.82, roughness: 0.28 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
    const meshWheelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.4, wireframe: true });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

    // Chassis Frame (3.1m long, 1.8m wide)
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 3.0), alumMat);
    chassis.castShadow = true;
    lrv.add(chassis);

    // Forward LCRU Gold Electronics Box & TV Camera
    const lcru = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.35, 0.55), goldMat);
    lcru.position.set(0, 0.24, 1.15);
    lrv.add(lcru);

    // High-Gain Wire Umbrella Dish Antenna
    const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.35), alumMat);
    dishPole.position.set(-0.45, 0.72, 0.85);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45),
      meshWheelMat
    );
    dish.position.set(-0.45, 1.38, 0.85);
    dish.rotation.x = Math.PI * 0.75;
    lrv.add(dishPole, dish);

    // Twin Astronaut Folding Seats & T-Bar Hand Controller
    for (let s = -1; s <= 1; s += 2) {
      const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.52), seatMat);
      seatBottom.position.set(s * 0.42, 0.12, -0.15);
      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.58, 0.06), seatMat);
      seatBack.position.set(s * 0.42, 0.40, -0.40);
      lrv.add(seatBottom, seatBack);
    }

    // 4 Woven Piano-Wire Mesh Wheels + Dust Fenders
    for (let wx = -1; wx <= 1; wx += 2) {
      for (let wz = -1; wz <= 1; wz += 2) {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx * 1.05, -0.02, wz * 1.15);
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 10, 22), meshWheelMat);
        tire.rotation.y = Math.PI / 2;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 12), goldMat);
        hub.rotation.z = Math.PI / 2;
        const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.24, 12, 1, true, 0, Math.PI), goldMat);
        fender.rotation.z = Math.PI / 2;
        fender.position.y = 0.05;
        wGroup.add(tire, hub, fender);
        lrv.add(wGroup);
      }
    }

    this.scene.add(lrv);
  }

  getExactSurfaceHeight(x, z) {
    if (this.terrain) {
      if (!this.surfaceRaycaster) {
        this.surfaceRaycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);
        this.rayOrigin = new THREE.Vector3();
      }
      this.terrain.updateMatrixWorld();
      this.rayOrigin.set(x, 60, z);
      this.surfaceRaycaster.set(this.rayOrigin, this.downVector);
      const hits = this.surfaceRaycaster.intersectObject(this.terrain, false);
      if (hits && hits.length > 0) {
        return hits[0].point.y;
      }
    }
    return this.getTerrainHeight(x, z);
  }

  getBootprintTexture() {
    if (this.bootprintTexture) return this.bootprintTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 512);

    // Outer displaced regolith dust halo (bright rim around compressed boot sole)
    const rimGrad = ctx.createRadialGradient(128, 256, 65, 128, 256, 124);
    rimGrad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    rimGrad.addColorStop(0.76, 'rgba(30, 41, 59, 0.85)');
    rimGrad.addColorStop(0.90, 'rgba(203, 213, 225, 0.65)');
    rimGrad.addColorStop(1.0, 'rgba(203, 213, 225, 0.0)');

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(128, 256, 92, 215, 0, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.restore();

    // Deep compressed boot sole cavity
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(128, 256, 74, 192, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 20, 28, 0.88)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.stroke();
    ctx.restore();

    // 9 Iconic Apollo Horizontal Ribbed Tread Bars (dark groove + bright sunlit ridge)
    for (let i = -4; i <= 4; i++) {
      const y = 256 + i * 36;
      const halfWidth = Math.sqrt(Math.max(0, 1 - Math.pow((i * 36) / 188, 2))) * 68;
      if (halfWidth > 20) {
        // Deep dark groove
        ctx.fillStyle = 'rgba(5, 8, 15, 0.96)';
        ctx.fillRect(128 - halfWidth, y - 10, halfWidth * 2, 13);
        // Sunlit compressed regolith ridge
        ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
        ctx.fillRect(128 - halfWidth, y + 4, halfWidth * 2, 6);
      }
    }

    this.bootprintTexture = new THREE.CanvasTexture(canvas);
    this.bootprintTexture.needsUpdate = true;
    return this.bootprintTexture;
  }

  spawnFootprint(x, z, yaw, isLeft) {
    const offsetSide = isLeft ? -0.17 : 0.17;
    const fx = x + Math.cos(yaw) * offsetSide;
    const fz = z - Math.sin(yaw) * offsetSide;
    const groundY = this.getExactSurfaceHeight(fx, fz);

    const printGroup = new THREE.Group();
    printGroup.position.set(fx, groundY + 0.024, fz);
    // Slight natural toe-out angle for left and right boots
    printGroup.rotation.y = yaw + (isLeft ? 0.06 : -0.06);

    // 1. High-contrast textured Apollo Bootprint Decal Plane
    const decalMat = new THREE.MeshStandardMaterial({
      map: this.getBootprintTexture(),
      transparent: true,
      opacity: 0.95,
      roughness: 0.95,
      metalness: 0.05,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    });

    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.58), decalMat);
    decalMesh.rotation.x = -Math.PI / 2;
    printGroup.add(decalMesh);

    // 2. 3D Sculpted Ribbed Tread Bars & Raised Regolith Rim for 3D Depth
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const ridgeColor = body === 'mars' ? 0x9a3412 : body === 'venus' ? 0x78350f : 0x64748b;
    const grooveColor = body === 'mars' ? 0x3b1106 : body === 'venus' ? 0x291003 : 0x1e293b;

    const grooveMat = new THREE.MeshStandardMaterial({
      color: grooveColor,
      roughness: 0.98,
      polygonOffset: true,
      polygonOffsetFactor: -5
    });
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: ridgeColor,
      roughness: 0.92,
      polygonOffset: true,
      polygonOffsetFactor: -5
    });

    for (let r = -3; r <= 3; r++) {
      const wScale = 1 - Math.abs(r) * 0.08;
      const treadGroove = new THREE.Mesh(new THREE.BoxGeometry(0.15 * wScale, 0.008, 0.022), grooveMat);
      treadGroove.position.set(0, 0.004, r * 0.048);
      printGroup.add(treadGroove);

      const treadRidge = new THREE.Mesh(new THREE.BoxGeometry(0.155 * wScale, 0.012, 0.012), ridgeMat);
      treadRidge.position.set(0, 0.007, r * 0.048 + 0.016);
      printGroup.add(treadRidge);
    }

    // Raised outer boot rim in regolith dust
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 8, 24), ridgeMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.scale.set(0.95, 1.85, 0.65);
    rimMesh.position.y = 0.006;
    printGroup.add(rimMesh);

    this.scene.add(printGroup);
    this.footprints.push(printGroup);
    if (this.footprints.length > 160) {
      const old = this.footprints.shift();
      this.scene.remove(old);
    }
  }

  spawnBootDust(x, z, count = 5) {
    const y = this.getTerrainHeight(x, z) + 0.08;
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const dustColor = body === 'mars' ? 0xc45c2c : body === 'venus' ? 0xd97706 : 0x94a3b8;
    for (let i = 0; i < count; i++) {
      this.createParticle(
        new THREE.Vector3(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4),
        new THREE.Vector3((Math.random() - 0.5) * 2.2, 0.8 + Math.random() * 1.4, (Math.random() - 0.5) * 2.2),
        dustColor,
        0.85,
        0.12
      );
    }
  }

  buildSimulationScene(artifact) {
    if (!this.scene) return;

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.scene.add(this.cameraRig);
    this.particles = [];
    this.footprints = [];

    const body = artifact.body || 'moon';
    const isMoon = body === 'moon';
    const isVenus = body === 'venus';
    const isOuter = body === 'outer';

    // Sky & Atmospheric Environment
    if (isMoon) {
      this.scene.background = new THREE.Color(0x03050a);
      this.scene.fog = null;

      // Crescent Earthrise in the lunar sky
      const earthGroup = new THREE.Group();
      earthGroup.position.set(-180, 95, -310);

      const earthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(17, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, metalness: 0.1 })
      );
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(17.35, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, roughness: 0.9 })
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(19.2, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.2, side: THREE.BackSide })
      );
      earthGroup.add(earthMesh, clouds, halo);
      this.scene.add(earthGroup);

    } else if (isVenus) {
      this.scene.background = new THREE.Color(0x3d1e05);
      this.scene.fog = new THREE.FogExp2(0x4a2507, 0.0068);
    } else if (isOuter) {
      if (artifact.id === 'cassini-huygens') {
        this.scene.background = new THREE.Color(0x2c1606);
        this.scene.fog = new THREE.FogExp2(0x361c08, 0.0052);

        const saturnGroup = new THREE.Group();
        saturnGroup.position.set(150, 115, -290);
        const saturnSphere = new THREE.Mesh(
          new THREE.SphereGeometry(22, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.7, transparent: true, opacity: 0.55 })
        );
        const saturnRings = new THREE.Mesh(
          new THREE.RingGeometry(28, 48, 64),
          new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide, transparent: true, opacity: 0.38 })
        );
        saturnRings.rotation.x = Math.PI * 0.38;
        saturnGroup.add(saturnSphere, saturnRings);
        this.scene.add(saturnGroup);
      } else {
        this.scene.background = new THREE.Color(0x03060c);
        this.scene.fog = new THREE.FogExp2(0x091220, 0.0018);
      }
    } else {
      this.scene.background = new THREE.Color(0x2d170f);
      this.scene.fog = new THREE.FogExp2(0x2d170f, 0.0032);

      const phobos = new THREE.Mesh(
        new THREE.DodecahedronGeometry(5.5, 1),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 })
      );
      phobos.scale.set(1.4, 0.9, 1.1);
      phobos.position.set(160, 130, -280);
      this.scene.add(phobos);
    }

    // Stars Field
    if (!isVenus) {
      const starCount = 2000;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 1600;
        starPos[i * 3 + 1] = 25 + Math.random() * 800;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 1600;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMoon ? 1.8 : 1.3,
        transparent: true,
        opacity: isMoon ? 0.92 : 0.48
      });
      this.scene.add(new THREE.Points(starGeo, starMat));
    }

    // High-Resolution Cratered Terrain with Procedural Bump & Surface Detail
    const terrainGeo = new THREE.PlaneGeometry(420, 420, 110, 110);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const d = Math.sqrt(vx * vx + vz * vz);
      let y = this.getTerrainHeight(vx, vz);
      if (d > 130) {
        const edge = (d - 130) / 70;
        y += Math.sin(vx * 0.08) * Math.cos(vz * 0.08) * (edge * 22);
      }
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    let surfaceBump = null;
    if (window.ProceduralTextures) {
      surfaceBump = isMoon ? window.ProceduralTextures.generateMoonBump() : window.ProceduralTextures.generateMarsBump();
      if (surfaceBump) {
        surfaceBump.wrapS = THREE.RepeatWrapping;
        surfaceBump.wrapT = THREE.RepeatWrapping;
        surfaceBump.repeat.set(14, 14);
      }
    }

    const terrainColor = isMoon ? 0x828892 : isVenus ? 0x784416 : isOuter ? (artifact.id === 'cassini-huygens' ? 0x855522 : 0x3b4252) : 0xc45c2c;
    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.92,
      metalness: 0.06,
      bumpMap: surfaceBump,
      bumpScale: 0.28
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // 1:1 Scale Holographic Range Rings on Surface
    this.scaleRingsGroup = new THREE.Group();
    this.scaleRingsGroup.position.y = 0.05;
    this.scaleRingsGroup.visible = (this.cameraMode === 'walk');
    [5, 10, 15].forEach((radius, idx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : 0x00f0ff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      this.scaleRingsGroup.add(new THREE.Mesh(ringGeo, ringMat));
    });
    this.scene.add(this.scaleRingsGroup);

    // Scattered Rock Boulders / Venus Basalt Slabs / Titan Ice Cobbles
    const rockGeo = isVenus
      ? new THREE.CylinderGeometry(1.1, 1.3, 0.35, 7)
      : new THREE.DodecahedronGeometry(0.85, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMoon ? 0x5b616b : isVenus ? 0x45270d : isOuter ? 0x64748b : 0x8a3c1b,
      roughness: 0.95,
      metalness: 0.15,
      flatShading: true
    });
    for (let i = 0; i < 55; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 210;
      const rz = (Math.random() - 0.5) * 210;
      if (Math.hypot(rx, rz) > 9.5) {
        const sc = 0.4 + Math.random() * 2.1;
        rock.scale.set(sc, isVenus ? 0.5 : sc * (0.5 + Math.random() * 0.5), sc);
        rock.position.set(rx, this.getTerrainHeight(rx, rz) + sc * 0.22, rz);
        if (!isVenus) rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      }
    }

    // Authentic Lunar Landing Site Props (Flag, ALSEP, LRV Moon Buggy, Fellow Astronaut)
    if (isMoon && artifact.category !== 'impact') {
      // American Flag on lunar regolith
      const flagGroup = new THREE.Group();
      flagGroup.position.set(9.2, this.getTerrainHeight(9.2, 6.2), 6.2);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 2.6),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
      );
      pole.position.y = 1.3;
      pole.castShadow = true;
      flagGroup.add(pole);

      const crossbar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.35),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
      );
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0.67, 2.55, 0);
      flagGroup.add(crossbar);

      const fabricGeo = new THREE.PlaneGeometry(1.35, 0.85, 8, 4);
      const fabricPos = fabricGeo.attributes.position;
      for (let fi = 0; fi < fabricPos.count; fi++) {
        const fx = fabricPos.getX(fi);
        fabricPos.setZ(fi, Math.sin(fx * 5.0) * 0.07);
      }
      fabricGeo.computeVertexNormals();

      const flagMesh = new THREE.Mesh(
        fabricGeo,
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8, side: THREE.DoubleSide })
      );
      flagMesh.position.set(0.67, 2.12, 0);
      flagMesh.castShadow = true;
      flagGroup.add(flagMesh);
      this.scene.add(flagGroup);

      // ALSEP Scientific Instrument Station + Laser Retroreflector (LRRR)
      const alsepY = this.getTerrainHeight(-10.5, 8.5);
      const alsepBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.8, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.2 })
      );
      alsepBox.position.set(-10.5, alsepY + 0.4, 8.5);
      alsepBox.castShadow = true;
      this.scene.add(alsepBox);

      const rtgCask = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.75, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 })
      );
      rtgCask.position.set(-12.2, alsepY + 0.38, 8.5);
      rtgCask.castShadow = true;
      this.scene.add(rtgCask);

      // Lunar Roving Vehicle (LRV "Moon Buggy") parked on the lunar surface
      this.buildLunarRoverProp(13.5, -7.5);
    }

    // Build First-Person & Third-Person Astronaut Rigs
    this.buildAstronautRigs();

    // Pre-spawn an initial EVA footprint trail leading from the spacecraft ladder to the astronaut's boots
    for (let s = 0; s < 10; s++) {
      const trailZ = 7.6 + s * 0.62;
      this.spawnFootprint(0, trailZ, 0, s % 2 === 0);
    }

    // Dynamic Sun Light with Crisp Soft Shadows
    const sunColor = isVenus ? 0xffb74d : isOuter ? 0xffe0b2 : 0xfffaed;
    const sunLight = new THREE.DirectionalLight(sunColor, isMoon ? 2.8 : isVenus ? 1.9 : 2.4);
    sunLight.position.set(100, 150, 75);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 450;
    sunLight.shadow.camera.left = -75;
    sunLight.shadow.camera.right = 75;
    sunLight.shadow.camera.top = 75;
    sunLight.shadow.camera.bottom = -75;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    const ambLight = new THREE.AmbientLight(isMoon ? 0x384454 : isVenus ? 0x6b3810 : 0x553222, 1.35);
    this.scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, isMoon ? 0x222630 : 0x3d1c14, 0.85);
    this.scene.add(hemiLight);

    // =========================================================================
    // HIGH-PRECISION 3D SPACECRAFT CRAFTING (PURE THREE.JS PBR)
    // =========================================================================
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;
    const kaptonBump = window.ProceduralTextures ? window.ProceduralTextures.generateKaptonFoilBump() : null;

    if (artifact.category === 'impact') {
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xededed, metalness: 0.45, roughness: 0.35 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.7 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });

      const hull = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 16, 32), whiteMat);
      hull.castShadow = true;
      hull.receiveShadow = true;
      this.spacecraft.add(hull);

      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 4.2, 32), darkMat);
      stripe.position.y = 2.5;
      stripe.castShadow = true;
      this.spacecraft.add(stripe);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), whiteMat);
      dome.position.y = 8.0;
      this.spacecraft.add(dome);

      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(2.3, 3.2, 24, 1, true), steelMat);
      nozzle.position.y = -9.2;
      nozzle.rotation.x = Math.PI;
      nozzle.castShadow = true;
      this.spacecraft.add(nozzle);

      const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3.0), steelMat);
      duct.position.set(1.6, -9.0, 0);
      this.spacecraft.add(duct);

      for (let pi = 0; pi < 2; pi++) {
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), darkMat);
        pod.position.set(pi === 0 ? 3.4 : -3.4, -4.0, 0);
        this.spacecraft.add(pod);
      }

      this.spacecraft.rotation.z = Math.PI * 0.38;
      this.spacecraft.position.set(-75, 100, 0);

    } else if (artifact.category === 'helicopter') {
      const goldFoil = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.9, roughness: 0.18, bumpMap: kaptonBump, bumpScale: 0.04 });
      const carbon = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
      const solarCell = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 });
      const darkLegs = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });

      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), goldFoil);
      bodyMesh.castShadow = true;
      this.spacecraft.add(bodyMesh);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2), carbon);
      mast.position.y = 2.8;
      this.spacecraft.add(mast);

      const solar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.9), solarCell);
      solar.position.y = 4.8;
      solar.castShadow = true;
      this.spacecraft.add(solar);

      for (let si = 0; si < 2; si++) {
        const swash = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2), darkLegs);
        swash.position.y = si === 0 ? 3.1 : 3.9;
        this.spacecraft.add(swash);
      }

      const bladeGeo = new THREE.BoxGeometry(10.2, 0.08, 0.75);
      this.blade1 = new THREE.Mesh(bladeGeo, carbon);
      this.blade1.position.y = 3.2;
      this.blade1.castShadow = true;

      this.blade2 = new THREE.Mesh(bladeGeo, carbon);
      this.blade2.position.y = 4.0;
      this.blade2.castShadow = true;

      this.spacecraft.add(this.blade1, this.blade2);

      for (let li = 0; li < 4; li++) {
        const ang = (li * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;

        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4), darkLegs);
        strut.position.set(1.5, -1.2, 0);
        strut.rotation.z = Math.PI / 3.8;
        strut.castShadow = true;
        legGroup.add(strut);

        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), darkLegs);
        foot.position.set(2.8, -2.4, 0);
        legGroup.add(foot);

        this.spacecraft.add(legGroup);
      }

      this.spacecraft.position.set(0, 2.4, 0);

    } else if (artifact.id === 'curiosity-skycrane') {
      const craneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.25 });
      const roverWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.3 });
      const darkSteel = new THREE.MeshStandardMaterial({ color: 0x222630, metalness: 0.85 });
      const goldFoil = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.2, bumpMap: kaptonBump, bumpScale: 0.04 });

      this.cranePlatform = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1.2, 12), craneMat);
      this.cranePlatform.position.y = 19;
      this.cranePlatform.castShadow = true;

      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 8, 1, true), darkSteel);
        nozzle.position.set(Math.cos(ang) * 4.6, 18.2, Math.sin(ang) * 4.6);
        nozzle.rotation.z = Math.cos(ang) * 0.45;
        this.cranePlatform.add(nozzle);
      }
      this.spacecraft.add(this.cranePlatform);

      this.roverBody = new THREE.Group();
      this.roverBody.position.y = 8.5;

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.7, 5.4), roverWhite);
      chassis.castShadow = true;
      this.roverBody.add(chassis);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2), darkSteel);
      mast.position.set(1.4, 2.4, 1.8);
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.9), darkSteel);
      head.position.set(1.4, 4.0, 1.8);
      this.roverBody.add(mast, head);

      const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.2, 12), goldFoil);
      rtg.rotation.x = Math.PI / 2;
      rtg.position.set(0, 0.4, -3.2);
      this.roverBody.add(rtg);

      for (let wx = -1; wx <= 1; wx += 2) {
        for (let wz = -1.9; wz <= 1.9; wz += 1.9) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.55, 12), darkSteel);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx * 2.8, -0.7, wz);
          wheel.castShadow = true;
          this.roverBody.add(wheel);
        }
      }

      this.spacecraft.add(this.roverBody);

      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      this.tetherGroup = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const pts = [
          new THREE.Vector3(Math.cos(a) * 2.4, 18.5, Math.sin(a) * 2.4),
          new THREE.Vector3(Math.cos(a) * 1.8, 9.4, Math.sin(a) * 1.8)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        this.tetherGroup.add(new THREE.Line(lineGeo, lineMat));
      }
      this.spacecraft.add(this.tetherGroup);
      this.spacecraft.position.set(0, 1.5, 0);

    } else if (isVenus) {
      const tiMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.28 });
      const darkBronze = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.75, roughness: 0.35 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });

      const torusBase = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.65, 16, 36), darkBronze);
      torusBase.rotation.x = Math.PI / 2;
      torusBase.position.y = -2.2;
      torusBase.castShadow = true;
      this.spacecraft.add(torusBase);

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.8), tiMat);
        strut.position.set(Math.cos(a) * 3.1, -1.0, Math.sin(a) * 3.1);
        strut.rotation.z = Math.cos(a) * 0.4;
        strut.rotation.x = -Math.sin(a) * 0.4;
        this.spacecraft.add(strut);
      }

      const sphereHull = new THREE.Mesh(new THREE.SphereGeometry(2.6, 28, 28), goldMat);
      sphereHull.position.y = 0.2;
      sphereHull.castShadow = true;
      this.spacecraft.add(sphereHull);

      const aeroDisk = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 3.6, 0.65, 28), tiMat);
      aeroDisk.position.y = 1.9;
      aeroDisk.castShadow = true;
      this.spacecraft.add(aeroDisk);

      const spool = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 2.2, 24), tiMat);
      spool.position.y = 3.2;
      this.spacecraft.add(spool);

      const drillArm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 0.45), darkBronze);
      drillArm.position.set(3.4, -1.5, 0);
      drillArm.rotation.z = -0.35;
      this.spacecraft.add(drillArm);

      this.spacecraft.position.set(0, 80, 0);

    } else if (isOuter && artifact.id === 'cassini-huygens') {
      const goldKapton = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });
      const silverAlum = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.82, roughness: 0.25 });

      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 2.2, 1.8, 32), goldKapton);
      saucer.position.y = -1.2;
      saucer.castShadow = true;
      this.spacecraft.add(saucer);

      const aftDome = new THREE.Mesh(new THREE.SphereGeometry(2.8, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), silverAlum);
      aftDome.position.y = -0.4;
      aftDome.castShadow = true;
      this.spacecraft.add(aftDome);

      const topRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.22, 12, 28), goldKapton);
      topRing.rotation.x = Math.PI / 2;
      topRing.position.y = 1.8;
      this.spacecraft.add(topRing);

      this.spacecraft.position.set(0, 80, 0);

    } else {
      // APOLLO LUNAR MODULE (LM) — HIGH-DETAIL DESCENT & ASCENT STAGE
      const goldKapton = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        bumpMap: kaptonBump,
        bumpScale: 0.05
      });
      const blackShield = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65 });
      const silverAlum = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.25 });
      const engineAlloy = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.2 });

      const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.2, 2.9, 8), goldKapton);
      base.castShadow = true;
      base.receiveShadow = true;
      this.spacecraft.add(base);

      const quadShield = new THREE.Mesh(new THREE.BoxGeometry(4.7, 2.92, 2.4), blackShield);
      this.spacecraft.add(quadShield);

      const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.2), silverAlum);
      mesa.position.set(0, 0, 4.4);
      mesa.castShadow = true;
      this.spacecraft.add(mesa);

      const bell = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.6, 20, 1, true), engineAlloy);
      bell.position.y = -2.2;
      bell.rotation.x = Math.PI;
      bell.castShadow = true;
      this.spacecraft.add(bell);

      this.engineLight = new THREE.PointLight(0x60a5fa, 5.0, 50);
      this.engineLight.position.set(0, -2.8, 0);
      this.engineLight.castShadow = true;
      this.spacecraft.add(this.engineLight);

      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      this.exhaustPlume = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6.0, 16, 1, true), plumeMat);
      this.exhaustPlume.position.y = -5.0;
      this.spacecraft.add(this.exhaustPlume);

      this.dummyAscentSolidGroup = new THREE.Group();
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 3.8), silverAlum);
      cabin.position.y = 2.6;
      cabin.castShadow = true;
      this.dummyAscentSolidGroup.add(cabin);

      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 1.6), silverAlum);
      porch.position.set(0, 1.4, 2.5);
      this.dummyAscentSolidGroup.add(porch);

      const winMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), winMat);
      winL.position.set(-1.0, 3.0, 1.95);
      winL.rotation.y = 0.2;
      const winR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), winMat);
      winR.position.set(1.0, 3.0, 1.95);
      winR.rotation.y = -0.2;
      this.dummyAscentSolidGroup.add(winL, winR);
      this.spacecraft.add(this.dummyAscentSolidGroup);

      const dish = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), silverAlum);
      dish.position.set(-2.2, 4.4, -1.8);
      dish.rotation.x = -Math.PI * 0.65;
      dish.rotation.y = Math.PI * 0.3;
      this.spacecraft.add(dish);

      for (let qi = 0; qi < 4; qi++) {
        const qAng = (qi * Math.PI) / 2;
        const qGroup = new THREE.Group();
        qGroup.position.set(Math.cos(qAng) * 2.4, 3.2, Math.sin(qAng) * 2.4);
        qGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), engineAlloy));
        this.spacecraft.add(qGroup);
      }

      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;

        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6.6), silverAlum);
        strut.position.set(4.4, -1.2, 0);
        strut.rotation.z = Math.PI / 4.1;
        strut.castShadow = true;
        legGroup.add(strut);

        const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 16), goldKapton);
        pad.position.set(6.8, -3.2, 0);
        pad.castShadow = true;
        legGroup.add(pad);

        const probe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.0),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
        );
        probe.position.set(6.8, -4.2, 0);
        legGroup.add(probe);

        if (i === 0) {
          const ladder = new THREE.Group();
          for (let r = 0; r < 8; r++) {
            const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), silverAlum);
            rung.rotation.x = Math.PI / 2;
            rung.position.set(2.0 + r * 0.55, 0.4 - r * 0.45, 0);
            ladder.add(rung);
          }
          legGroup.add(ladder);
        }

        this.spacecraft.add(legGroup);
      }

      this.spacecraft.position.set(0, 80, 0);
    }

    this.scene.add(this.spacecraft);

    // Build 1:1 Climbable Boarding Ladder & Detailed Walk-In Spacecraft / Rocket / Satellite Interior Cabin
    this.buildWalkableLadderAndInterior(artifact);

    // Disable frustum culling & backface culling across the entire 3D scene so no rocket/lander part ever disappears at any camera angle!
    this.scene.traverse((obj) => {
      if (obj.isMesh || obj.isLine || obj.isPoints) {
        obj.frustumCulled = false;
      }
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          m.side = THREE.DoubleSide;
          if (m.transparent) {
            m.depthWrite = false;
          }
        });
      }
    });

    this.camera.position.set(30, 32, 65);
    this.camera.lookAt(0, 16, 0);

    if (this.controls && this.spacecraft) {
      this.controls.target.copy(this.spacecraft.position);
    }
  }

  // ===========================================================================
  // WEBXR VR LASER POINTER CONTROLLERS & 3D INTERACTIVE CABIN RAYCASTER
  // ===========================================================================
  setupXRControllers() {
    if (!this.renderer || !this.renderer.xr || this.xrControllersSetup) return;
    this.xrControllersSetup = true;
    this.xrControllers = [];

    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -4.5)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });

    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      const laserLine = new THREE.Line(laserGeo, laserMat);
      controller.add(laserLine);

      // 3D VR Hand / Controller Grip Mesh
      const gripMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.055, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 })
      );
      controller.add(gripMesh);

      controller.addEventListener('selectstart', () => {
        if (this.cameraMode === 'walk') {
          this.triggerCabinInteraction(null, controller);
        }
      });

      this.cameraRig.add(controller);
      this.xrControllers.push(controller);
    }
  }

  generateIsogridTexture() {
    if (this.isogridTexture) return this.isogridTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Machined Aerospace Aluminum Base
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 512, 512);

    // CNC-Milled Triangular Isogrid Pockets (Authentic NASA S-IVB / LM / Orion Structural Pattern)
    const step = 64;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    for (let x = -512; x <= 512; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 512, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 512, 0); ctx.lineTo(x, 512); ctx.stroke();
    }

    // Recessed pocket shadows & node bosses
    ctx.fillStyle = '#64748b';
    for (let y = 0; y <= 512; y += step) {
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
      }
    }

    this.isogridTexture = new THREE.CanvasTexture(canvas);
    this.isogridTexture.wrapS = THREE.RepeatWrapping;
    this.isogridTexture.wrapT = THREE.RepeatWrapping;
    this.isogridTexture.repeat.set(3, 2);
    return this.isogridTexture;
  }

  generateKeyCapTexture(label, isHighlight = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isHighlight ? '#1e293b' : '#0f172a';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = isHighlight ? '#00f0ff' : '#94a3b8';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 112, 112);

    ctx.fillStyle = isHighlight ? '#00ff88' : '#f8fafc';
    ctx.font = label.length > 2 ? 'bold 28px monospace' : 'bold 46px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 66);

    return new THREE.CanvasTexture(canvas);
  }

  // ===========================================================================
  // 1:1 CLIMBABLE EVA LADDER & NASA SPACECRAFT / ROCKET / SATELLITE INTERIOR CABIN
  // ===========================================================================
  generateDSKYTexture(artifact) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cs = this.cabinState || {
      prog: '68',
      verb: '16',
      noun: '65',
      r1: '+00000',
      r2: '+01969',
      r3: '+00412',
      compActy: true,
      masterAlarm: false,
      throttlePct: 0
    };

    // Authentic AGC Block II DSKY Charcoal Anodized Upper Display Housing
    ctx.fillStyle = '#1e242b';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 496);

    // Left Status Annunciator Matrix (UPLINK ACTY, NO ATT, STBY, KEY REL, OPR ERR, TEMP, GIMBAL LOCK, PROG, RESTART, TRACKER)
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(24, 28, 205, 250);
    const lamps = [
      { label: 'UPLINK ACTY', on: cs.compActy, col: '#e2e8f0' },
      { label: 'TEMP', on: cs.masterAlarm, col: '#f59e0b' },
      { label: 'NO ATT', on: false, col: '#e2e8f0' },
      { label: 'GIMBAL LOCK', on: cs.masterAlarm, col: '#f59e0b' },
      { label: 'STBY', on: false, col: '#e2e8f0' },
      { label: 'PROG', on: true, col: '#f59e0b' },
      { label: 'KEY REL', on: false, col: '#e2e8f0' },
      { label: 'RESTART', on: cs.masterAlarm, col: '#ef4444' },
      { label: 'OPR ERR', on: false, col: '#e2e8f0' },
      { label: 'TRACKER', on: true, col: '#f59e0b' }
    ];
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    lamps.forEach((l, idx) => {
      const colIdx = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      const lx = 34 + colIdx * 96;
      const ly = 38 + rowIdx * 46;
      ctx.fillStyle = l.on ? l.col : '#262f38';
      ctx.fillRect(lx, ly, 88, 36);
      ctx.fillStyle = l.on ? '#090d16' : '#64748b';
      ctx.fillText(l.label, lx + 44, ly + 23);
    });

    // Right Electroluminescent Green Digital Display Window (PROG, VERB, NOUN, R1, R2, R3)
    ctx.fillStyle = '#04120a';
    ctx.fillRect(248, 28, 238, 250);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(248, 28, 238, 250);

    // COMP ACTY green indicator
    ctx.fillStyle = cs.compActy ? '#10b981' : '#064e3b';
    ctx.fillRect(262, 42, 68, 42);
    ctx.fillStyle = '#022c22';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('COMP', 296, 59);
    ctx.fillText('ACTY', 296, 75);

    // PROG / VERB / NOUN headers & 2-digit glowing green 7-segment numbers
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('PROG', 425, 48);
    ctx.fillText('VERB', 296, 108);
    ctx.fillText('NOUN', 425, 108);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(cs.prog, 425, 82);
    ctx.fillText(cs.verb, 296, 140);
    ctx.fillText(cs.noun, 425, 140);

    // Three 5-Digit Signed Registers (R1, R2, R3)
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(cs.r1, 468, 182);
    ctx.fillText(cs.r2, 468, 222);
    ctx.fillText(cs.r3, 468, 262);

    // Recessed Keybay Frame Background (3D physical keycaps sit on top of this!)
    ctx.fillStyle = '#090d14';
    ctx.fillRect(18, 296, 476, 200);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 296, 476, 200);

    return new THREE.CanvasTexture(canvas);
  }

  generateTelemetryScreenTexture(artifact) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const cs = this.cabinState || {
      prog: '68',
      throttlePct: 0,
      rcsArmed: true,
      glycolPump: true,
      sBandLocked: true,
      masterAlarm: false,
      lightMode: 0
    };

    ctx.fillStyle = cs.masterAlarm ? '#1f070b' : '#030914';
    ctx.fillRect(0, 0, 1024, 512);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Header Bar
    ctx.fillStyle = cs.masterAlarm ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(16, 16, 992, 54);
    ctx.strokeStyle = cs.masterAlarm ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 992, 54);

    ctx.fillStyle = cs.masterAlarm ? '#fca5a5' : '#10b981';
    ctx.font = 'bold 23px monospace';
    const name = artifact ? (artifact.name_en || artifact.id).toUpperCase() : 'NASA SPACECRAFT';
    const statusBanner = cs.masterAlarm ? '⚠️ MASTER ALARM / STAGE ABORT ARMED' : `NASA INTERNAL AVIONICS & TELEMETRY BUS // ${name}`;
    ctx.fillText(statusBanner, 34, 51);

    // Left Radar / Descent & Thrust Waveform Plot
    ctx.strokeStyle = cs.throttlePct > 0 ? '#f59e0b' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const freq = cs.throttlePct > 0 ? 0.09 : 0.045;
    const amp = 32 + cs.throttlePct * 0.45;
    for (let i = 0; i < 440; i += 6) {
      const px = 36 + i;
      const py = 215 + Math.sin(i * freq + cs.throttlePct) * amp + Math.cos(i * 0.13) * 16;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Left Sub-Readout Box: Active AGC Program & Engine Throttle
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(34, 310, 440, 125);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(34, 310, 440, 125);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 19px monospace';
    ctx.fillText(`AGC PROGRAM: P${cs.prog} | DPS THROTTLE: ${cs.throttlePct}%`, 50, 348);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`RCS THRUSTER QUADS: ${cs.rcsArmed ? 'ARMED (4/4)' : 'ISOLATED'}`, 50, 382);
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`GLYCOL COOLING LOOP: ${cs.glycolPump ? 'PUMP A+B ACTIVE' : 'STANDBY'}`, 50, 416);

    // Right Internal Subsystem Bars (ECS O2, He TANK, RTG/FUEL, BUS VOLT)
    const metrics = [
      { label: 'CABIN / HULL PRESSURE', val: '4.8 PSI (33.1 kPa)', pct: 0.88, col: '#10b981' },
      { label: 'DESCENT / ASCENT THRUST', val: `${cs.throttlePct}% (${Math.round(cs.throttlePct * 45.0)} N)`, pct: Math.max(0.08, cs.throttlePct / 100), col: '#f59e0b' },
      { label: 'THERMAL SHIELD / RTG CORE', val: cs.glycolPump ? '294.2 K (NOMINAL)' : '318.6 K (WARMING)', pct: cs.glycolPump ? 0.72 : 0.91, col: '#00f0ff' },
      { label: 'HIGH-GAIN S-BAND TELEMETRY', val: cs.sBandLocked ? 'LOCKED (DSN GOLDSTONE)' : 'OMNI ANTENNA BACKUP', pct: cs.sBandLocked ? 0.96 : 0.45, col: '#10b981' }
    ];
    metrics.forEach((m, idx) => {
      const my = 110 + idx * 92;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${m.label}: ${m.val}`, 510, my);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(510, my + 12, 470, 26);
      ctx.fillStyle = m.col;
      ctx.fillRect(510, my + 12, 470 * m.pct, 26);
    });

    // Bottom Schematic Readout + Visible Procedural Watermark (NASA Space Apps AI Compliance)
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`COORDS: ${artifact ? artifact.coords : '0.674N, 23.473E'} | MASS: ${artifact ? artifact.mass : '15,103 kg'} | CLICK ANY 3D BUTTON OR SWITCH`, 34, 468);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('⚙️ WATERMARK: AI-ASSISTED PROCEDURAL WEBGL / CANVAS2D RENDER • NO OFFICIAL NASA LOGO USED', 34, 492);

    return new THREE.CanvasTexture(canvas);
  }

  refreshCabinDisplays() {
    if (this.dskyScreenMesh && this.dskyScreenMesh.material) {
      if (this.dskyScreenMesh.material.map) this.dskyScreenMesh.material.map.dispose();
      this.dskyScreenMesh.material.map = this.generateDSKYTexture(this.currentArtifact);
      this.dskyScreenMesh.material.needsUpdate = true;
    }
    if (this.mainTelemetryMesh && this.mainTelemetryMesh.material) {
      if (this.mainTelemetryMesh.material.map) this.mainTelemetryMesh.material.map.dispose();
      this.mainTelemetryMesh.material.map = this.generateTelemetryScreenTexture(this.currentArtifact);
      this.mainTelemetryMesh.material.needsUpdate = true;
    }
  }

  playSwitchClickSound(freq = 880) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.uiAudioCtx) this.uiAudioCtx = new AudioCtx();
      if (this.uiAudioCtx.state === 'suspended') this.uiAudioCtx.resume();
      const osc = this.uiAudioCtx.createOscillator();
      const gain = this.uiAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.uiAudioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, this.uiAudioCtx.currentTime + 0.055);
      gain.gain.setValueAtTime(0.14, this.uiAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.uiAudioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.uiAudioCtx.destination);
      osc.start();
      osc.stop(this.uiAudioCtx.currentTime + 0.065);
    } catch (_) {}
  }

  buildWalkableLadderAndInterior(artifact) {
    if (this.walkableInteriorGroup) {
      this.scene.remove(this.walkableInteriorGroup);
    }
    this.walkableInteriorGroup = new THREE.Group();
    this.interactables = [];

    // Live Interactive Cabin State
    this.cabinState = {
      prog: '68',
      verb: '16',
      noun: '65',
      r1: '+00000',
      r2: '+01969',
      r3: '+00412',
      compActy: true,
      masterAlarm: false,
      throttlePct: 0,
      rcsArmed: true,
      glycolPump: true,
      sBandLocked: true,
      lightMode: 0, // 0: Nominal White, 1: Deep-Space Cyan, 2: Red Night-Adaptation
      hatchOpen: false,
      hatchProgress: 0.0
    };

    const body = artifact ? (artifact.body || 'moon') : 'moon';
    const category = artifact ? (artifact.category || 'lander') : 'lander';
    const groundY0 = this.getTerrainHeight(0, 0);
    const cabinFloorY = 4.5;

    const isogridTex = this.generateIsogridTexture();
    const kaptonBump = window.ProceduralTextures ? window.ProceduralTextures.generateKaptonFoilBump() : null;

    // High-Precision PBR Materials for NASA Spacecraft Interior & Boarding Ladder
    const isogridWallMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      map: isogridTex,
      bumpMap: isogridTex,
      bumpScale: 0.035,
      metalness: 0.72,
      roughness: 0.34
    });
    const isogridAlum = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.84, roughness: 0.26 });
    const chromeSwitchMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.12 });
    const brassNutMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.88, roughness: 0.24 });
    const darkPanelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.45 });
    const charcoalRack = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.65, roughness: 0.38 });
    const goldKapton = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
      bumpMap: kaptonBump,
      bumpScale: 0.04
    });
    const copperPipe = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const blueValve = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.22 });
    const redValve = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.85, roughness: 0.22 });
    const cyanGlow = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const greenGlow = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const amberGlow = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const redGlow = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      roughness: 0.08,
      metalness: 0.92
    });

    // =========================================================================
    // 1. EXTERIOR CLIMBABLE 12-RUNG EVA BOARDING LADDER & INGRESS PORCH (+Z SIDE)
    // =========================================================================
    const ladderGroup = new THREE.Group();
    this.walkableInteriorGroup.add(ladderGroup);

    const ladderBottomZ = 6.2;
    const ladderTopZ = 2.45;
    const dy = cabinFloorY - groundY0;
    const dz = ladderBottomZ - ladderTopZ;
    const ladderLen = Math.hypot(dy, dz);
    const ladderAngle = Math.atan2(dz, dy);

    for (let side = -1; side <= 1; side += 2) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, ladderLen, 16), isogridAlum);
      rail.position.set(side * 0.48, groundY0 + dy * 0.5, (ladderBottomZ + ladderTopZ) * 0.5);
      rail.rotation.x = -ladderAngle;
      rail.castShadow = true;
      ladderGroup.add(rail);

      const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, ladderLen, 12), cyanGlow);
      handrail.position.set(side * 0.56, groundY0 + dy * 0.5 + 0.35, (ladderBottomZ + ladderTopZ) * 0.5);
      handrail.rotation.x = -ladderAngle;
      ladderGroup.add(handrail);
    }

    const rungCount = 12;
    for (let r = 0; r < rungCount; r++) {
      const frac = (r + 0.5) / rungCount;
      const ry = groundY0 + frac * dy;
      const rz = ladderBottomZ - frac * dz;
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.96, 14), isogridAlum);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, ry, rz);
      rung.castShadow = true;
      ladderGroup.add(rung);
    }

    // Interactive Green Footpad at the Base of the Ladder (clicking it climbs directly into the cabin!)
    const entryPad = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
    );
    entryPad.rotation.x = -Math.PI / 2;
    entryPad.position.set(0, this.getExactSurfaceHeight(0, 6.3) + 0.04, 6.3);
    entryPad.userData.interactive = {
      label_tr: '🪜 [SOL TIK / VR TETİK] EVA MERDİVENİNDEN KABİN İÇİNE TIRMAN',
      label_en: '🪜 [CLICK / VR TRIGGER] CLIMB EVA LADDER INTO CABIN',
      onClick: () => {
        this.playSwitchClickSound(620);
        this.toggleCabinInterior();
      }
    };
    this.interactables.push(entryPad);
    ladderGroup.add(entryPad);

    const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 0.82), isogridWallMat);
    porchDeck.position.set(0, cabinFloorY - 0.06, 2.40);
    porchDeck.castShadow = true;
    ladderGroup.add(porchDeck);

    // Porch Handrails
    for (let side = -1; side <= 1; side += 2) {
      const pRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.78), isogridAlum);
      pRail.position.set(side * 0.78, cabinFloorY + 0.35, 2.40);
      ladderGroup.add(pRail);
    }

    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, cabinFloorY, 14), goldKapton);
        pillar.position.set(sx * 1.95, cabinFloorY * 0.5, sz * 1.95);
        this.walkableInteriorGroup.add(pillar);
      }
    }

    // =========================================================================
    // 2. WALK-IN PRESSURIZED NASA CABIN SHELL (CNC-Milled Triangular Isogrid)
    // =========================================================================
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, cabinFloorY, 0);
    this.walkableInteriorGroup.add(cabinGroup);

    const floorDeck = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 4.5), isogridWallMat);
    floorDeck.position.set(0, -0.08, 0);
    floorDeck.receiveShadow = true;
    cabinGroup.add(floorDeck);

    for (let vx = -1; vx <= 1; vx += 2) {
      const velcroPad = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.016, 1.85), blueValve);
      velcroPad.position.set(vx * 0.95, 0.01, 0.2);
      cabinGroup.add(velcroPad);
    }

    const ceilingDeck = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 4.5), darkPanelMat);
    ceilingDeck.position.set(0, 3.1, 0);
    cabinGroup.add(ceilingDeck);

    // Overhead Docking / COAS Viewport Window + 3D COAS Collimator Sight
    const topWindowFrame = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 14, 32), isogridAlum);
    topWindowFrame.rotation.x = Math.PI / 2;
    topWindowFrame.position.set(0, 3.01, -0.4);
    const topWindowGlass = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), glassMat);
    topWindowGlass.rotation.x = Math.PI / 2;
    topWindowGlass.position.set(0, 3.01, -0.4);
    cabinGroup.add(topWindowFrame, topWindowGlass);

    // 3D Crew Optical Alignment Sight (COAS) mounted above Commander's station
    const coasGroup = new THREE.Group();
    coasGroup.position.set(-0.95, 2.35, -1.88);
    const coasBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.26, 16), charcoalRack);
    coasBarrel.rotation.x = Math.PI / 3;
    const coasGlass = new THREE.Mesh(new THREE.CircleGeometry(0.052, 16), greenGlow);
    coasGlass.position.set(0, -0.09, 0.11);
    coasGroup.add(coasBarrel, coasGlass);
    cabinGroup.add(coasGroup);

    // Dynamic Interior Cabin PointLights (controllable via 3D Lighting Switch!)
    this.cabinLightMain = new THREE.PointLight(0xf8fafc, 2.5, 12);
    this.cabinLightMain.position.set(0, 2.75, 0);
    cabinGroup.add(this.cabinLightMain);

    this.cabinLightConsole = new THREE.PointLight(0x38bdf8, 1.5, 7);
    this.cabinLightConsole.position.set(0, 1.85, -1.55);
    cabinGroup.add(this.cabinLightConsole);

    // Structural Milled Isogrid Ring Frames (Ribs) around the Cabin Perimeter
    for (let rz = -1.8; rz <= 1.8; rz += 1.2) {
      const leftRib = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.1, 0.12), isogridAlum);
      leftRib.position.set(-2.15, 1.55, rz);
      const rightRib = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.1, 0.12), isogridAlum);
      rightRib.position.set(2.15, 1.55, rz);
      const topRib = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.12), isogridAlum);
      topRib.position.set(0, 2.98, rz);
      cabinGroup.add(leftRib, rightRib, topRib);
    }

    // Back (+Z) Bulkhead with Open Ingress/Egress Hatch Doorway + Stowed PLSS & ALSRC Rock Boxes
    const backWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.1, 0.14), isogridWallMat);
    backWallLeft.position.set(-1.5, 1.55, 2.18);
    const backWallRight = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.1, 0.14), isogridWallMat);
    backWallRight.position.set(1.5, 1.55, 2.18);
    const backWallHeader = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.85, 0.14), isogridWallMat);
    backWallHeader.position.set(0, 2.68, 2.18);
    cabinGroup.add(backWallLeft, backWallRight, backWallHeader);

    // Interactive Hinged Squared Ingress/Egress Hatch Door & Red Pressure-Relief Valve Wheel
    // Pivoted on the right doorframe hinge (x = +0.68, y = 1.12, z = 2.18) so it starts SEALED SHUT (hatchProgress = 0)
    // during rocket descent and swings smoothly outward when the astronaut opens it!
    this.hatchPivotGroup = new THREE.Group();
    this.hatchPivotGroup.position.set(0.68, 1.12, 2.18);
    cabinGroup.add(this.hatchPivotGroup);

    const hatchDoor = new THREE.Mesh(new THREE.BoxGeometry(1.36, 2.15, 0.09), isogridAlum);
    hatchDoor.position.set(-0.68, 0, 0);
    this.hatchDoor = hatchDoor;
    this.hatchPivotGroup.add(hatchDoor);

    // Armored Upper Hatch Viewport Window Frame on Door so astronaut can see the ladder outside
    const hatchWinFrame = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.11), charcoalRack);
    hatchWinFrame.position.set(0, 0.52, 0);
    const hatchWinGlass = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.30, 0.12), glassMat);
    hatchWinGlass.position.set(0, 0.52, 0);
    hatchDoor.add(hatchWinFrame, hatchWinGlass);

    // Dual-sided Red Pressure-Relief Valve Wheel on the Hatch Door
    const hatchWheel = new THREE.Group();
    hatchWheel.position.set(-0.22, -0.06, 0);
    for (let wzSide = -1; wzSide <= 1; wzSide += 2) {
      const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 12, 24), redValve);
      wheelRim.position.z = wzSide * 0.065;
      hatchWheel.add(wheelRim);
      for (let sp = 0; sp < 2; sp++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 8), chromeSwitchMat);
        spoke.rotation.z = (sp * Math.PI) / 2;
        spoke.position.z = wzSide * 0.065;
        hatchWheel.add(spoke);
      }
    }
    const wheelShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.16, 12), brassNutMat);
    wheelShaft.rotation.x = Math.PI / 2;
    hatchWheel.add(wheelShaft);
    this.hatchWheel = hatchWheel;
    hatchDoor.add(hatchWheel);

    // Illuminated 3D Hatch Latch Handle & Status Lamp above the door
    this.hatchStatusLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.08, 0.16),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    this.hatchStatusLamp.position.set(0, 2.28, 2.16);
    cabinGroup.add(this.hatchStatusLamp);

    const hatchInteract = {
      label_tr: '🚪 [SOL TIK / E TUŞU] BASINÇLI KABİN KAPAĞINI & VALFİNİ AÇ / DIŞARI ÇIK',
      label_en: '🚪 [CLICK / PRESS E] OPEN PRESSURIZED HATCH & STEP OUTSIDE',
      onClick: () => {
        if (!this.cabinState.hatchOpen) {
          this.triggerOpenHatch(false);
        } else if (this.walkState.isInsideCabin) {
          this.playSwitchClickSound(580);
          this.walkState.isInsideCabin = false;
          this.walkState.isOnLadder = true;
          this.walkState.x = 0;
          this.walkState.z = 2.52;
        } else {
          this.playSwitchClickSound(440);
          this.cabinState.hatchOpen = !this.cabinState.hatchOpen;
        }
      }
    };
    hatchDoor.userData.interactive = hatchInteract;
    hatchWheel.userData.interactive = hatchInteract;
    this.interactables.push(hatchDoor, hatchWheel);

    // Stowed EVA PLSS Backpacks & Apollo Lunar Sample Return Containers (ALSRC Rock Boxes) on Rear Wall
    for (let side = -1; side <= 1; side += 2) {
      const stowedPlss = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.22), isogridAlum);
      stowedPlss.position.set(side * 1.48, 1.55, 1.96);
      const plssBand = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.05, 0.23), redValve);
      plssBand.position.y = 0.22;
      stowedPlss.add(plssBand);
      cabinGroup.add(stowedPlss);

      // ALSRC Metallic Lunar Rock Sample Box with Latches on Floor
      const rockBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.34), chromeSwitchMat);
      rockBox.position.set(side * 1.48, 0.15, 1.85);
      cabinGroup.add(rockBox);
    }

    // =========================================================================
    // 3. FORWARD FLIGHT DECK (-Z WALL): SOLID EXTERIOR HULL + 3D FRAMED WINDOWS
    // =========================================================================
    const frontLowerWall = new THREE.Mesh(new THREE.BoxGeometry(4.48, 1.34, 0.18), isogridWallMat);
    frontLowerWall.position.set(0, 0.67, -2.18);
    const frontTopWall = new THREE.Mesh(new THREE.BoxGeometry(4.48, 0.84, 0.18), isogridWallMat);
    frontTopWall.position.set(0, 2.68, -2.18);

    // Solid exterior Isogrid aluminum center bulkhead skin + interior charcoal instrument rack
    const frontCenterHullWall = new THREE.Mesh(new THREE.BoxGeometry(1.56, 1.12, 0.14), isogridWallMat);
    frontCenterHullWall.position.set(0, 1.80, -2.21);
    const frontCenterPillar = new THREE.Mesh(new THREE.BoxGeometry(1.52, 1.26, 0.12), charcoalRack);
    frontCenterPillar.position.set(0, 1.80, -2.09);

    // Solid left & right outer corner bulkhead walls so the cabin exterior is 100% enclosed at all angles!
    const frontLeftOuterWall = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.12, 0.18), isogridWallMat);
    frontLeftOuterWall.position.set(-1.88, 1.80, -2.18);
    const frontRightOuterWall = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.12, 0.18), isogridWallMat);
    frontRightOuterWall.position.set(1.88, 1.80, -2.18);

    cabinGroup.add(
      frontLowerWall,
      frontTopWall,
      frontCenterHullWall,
      frontCenterPillar,
      frontLeftOuterWall,
      frontRightOuterWall
    );

    // 3D Beveled Observation Window Frames + Double-Sided Crystal-Clear Tinted Solar-Shield Glass Panes
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      roughness: 0.08,
      metalness: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let side = -1; side <= 1; side += 2) {
      const wx = side * 1.15;
      const wy = 1.80;
      const wz = -2.18;

      const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.03), windowGlassMat);
      winGlass.position.set(wx, wy, wz);
      cabinGroup.add(winGlass);

      // 3D Metallic Bezel Frame around each observation window
      const topFrame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.07, 0.22), goldKapton);
      topFrame.position.set(wx, wy + 0.46, wz);
      const botFrame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.07, 0.22), goldKapton);
      botFrame.position.set(wx, wy - 0.46, wz);
      const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.96, 0.22), isogridAlum);
      leftFrame.position.set(wx - 0.39, wy, wz);
      const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.96, 0.22), isogridAlum);
      rightFrame.position.set(wx + 0.39, wy, wz);
      cabinGroup.add(topFrame, botFrame, leftFrame, rightFrame);

      if (side === -1) {
        for (let tick = -3; tick <= 3; tick++) {
          const tickBar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.006, 0.006), amberGlow);
          tickBar.position.set(wx, wy + tick * 0.09, -2.13);
          cabinGroup.add(tickBar);
        }
      }
    }

    // Exterior Ascent Stage Thermal Kapton Collar & 4 Corner RCS Thruster Quad Assemblies
    const extLowerBandFront = new THREE.Mesh(new THREE.BoxGeometry(4.56, 0.48, 0.06), goldKapton);
    extLowerBandFront.position.set(0, 0.26, -2.28);
    const extLowerBandLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 4.56), goldKapton);
    extLowerBandLeft.position.set(-2.28, 0.26, 0);
    const extLowerBandRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 4.56), goldKapton);
    extLowerBandRight.position.set(2.28, 0.26, 0);
    cabinGroup.add(extLowerBandFront, extLowerBandLeft, extLowerBandRight);

    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const rcsPod = new THREE.Group();
        rcsPod.position.set(cx * 2.34, 2.25, cz * 1.95);
        const podBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.32), isogridAlum);
        rcsPod.add(podBox);
        const nozUp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 12, 1, true), charcoalRack);
        nozUp.position.y = 0.28;
        const nozDown = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 12, 1, true), charcoalRack);
        nozDown.position.y = -0.28;
        nozDown.rotation.x = Math.PI;
        rcsPod.add(nozUp, nozDown);
        cabinGroup.add(rcsPod);
      }
    }

    // Sloped Main Flight Instrument Console Desk (y = 1.05, z = -1.85)
    const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(4.15, 0.18, 0.72), charcoalRack);
    consoleDesk.position.set(0, 1.04, -1.84);
    consoleDesk.rotation.x = 0.22;
    cabinGroup.add(consoleDesk);

    // High-Resolution Wide NASA Telemetry & Radar Altimeter Display on Center Pillar
    const mainScreenMat = new THREE.MeshBasicMaterial({ map: this.generateTelemetryScreenTexture(artifact) });
    this.mainTelemetryMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.68), mainScreenMat);
    this.mainTelemetryMesh.position.set(0, 2.04, -2.01);
    cabinGroup.add(this.mainTelemetryMesh);

    // -------------------------------------------------------------------------
    // 3A. INTERACTIVE APOLLO GUIDANCE COMPUTER DSKY WITH 19 PHYSICAL 3D BEVELED KEYS!
    // -------------------------------------------------------------------------
    const dskyGroup = new THREE.Group();
    dskyGroup.position.set(0, 1.38, -1.94);
    dskyGroup.rotation.x = -0.18;
    cabinGroup.add(dskyGroup);

    const dskyHousing = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.14), charcoalRack);
    dskyGroup.add(dskyHousing);

    // Metallic Bezel Frame around DSKY
    const dskyBezel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.50, 0.12), isogridAlum);
    dskyBezel.position.z = -0.01;
    dskyGroup.add(dskyBezel);

    this.dskyScreenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.43, 0.45),
      new THREE.MeshBasicMaterial({ map: this.generateDSKYTexture(artifact) })
    );
    this.dskyScreenMesh.position.z = 0.072;
    dskyGroup.add(this.dskyScreenMesh);

    // 19 Individual 3D Sculpted Pushbutton Keycaps on the Lower DSKY Matrix!
    const dskyKeys = [
      'VERB', '+', '7', '8', '9', 'CLR', 'ENTR',
      'NOUN', '-', '4', '5', '6', 'PRO', 'RSET',
      'KEY', '0', '1', '2', '3', 'REL', 'STBY'
    ];
    const progs = [
      { prog: '63', verb: '06', noun: '63', r1: '-00485', r2: '-00124', r3: '+04250' },
      { prog: '64', verb: '16', noun: '64', r1: '+00042', r2: '-00018', r3: '+00520' },
      { prog: '66', verb: '06', noun: '60', r1: '-00003', r2: '-00001', r3: '+00045' },
      { prog: '68', verb: '16', noun: '65', r1: '+00000', r2: '+01969', r3: '+00412' },
      { prog: '12', verb: '37', noun: '12', r1: '+01850', r2: '+00640', r3: '+05520' }
    ];
    let progIdx = 3;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        const keyLabel = dskyKeys[r * 7 + c];
        const isActionKey = ['VERB', 'NOUN', 'PRO', 'ENTR', 'CLR', 'RSET'].includes(keyLabel);
        const keyCapGroup = new THREE.Group();
        const kx = (c - 3) * 0.056;
        const ky = -0.072 - r * 0.056;
        keyCapGroup.position.set(kx, ky, 0.082);

        // Metallic Key Collar
        const collar = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.048, 0.018), isogridAlum);
        // Depressable 3D Illuminated Keycap
        const capMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.044, 0.042, 0.024),
          new THREE.MeshBasicMaterial({ map: this.generateKeyCapTexture(keyLabel, isActionKey) })
        );
        capMesh.position.z = 0.008;
        keyCapGroup.add(collar, capMesh);

        capMesh.userData.interactive = {
          label_tr: `⌨️ [SOL TIK / VR TETİK] DSKY 3B TUŞU: "${keyLabel}" (AGC Bilgisayar Komutu Gönder)`,
          label_en: `⌨️ [CLICK / VR TRIGGER] DSKY 3D KEY: "${keyLabel}" (Execute AGC Command)`,
          onClick: () => {
            this.playSwitchClickSound(isActionKey ? 1040 : 780);
            // Mechanical 3D keycap depression animation!
            capMesh.position.z = 0.001;
            setTimeout(() => { capMesh.position.z = 0.008; }, 140);

            if (keyLabel === 'PRO' || keyLabel === 'ENTR' || keyLabel === 'VERB' || keyLabel === 'NOUN') {
              progIdx = (progIdx + 1) % progs.length;
              const p = progs[progIdx];
              this.cabinState.prog = p.prog;
              this.cabinState.verb = p.verb;
              this.cabinState.noun = p.noun;
              this.cabinState.r1 = p.r1;
              this.cabinState.r2 = p.r2;
              this.cabinState.r3 = p.r3;
              this.cabinState.compActy = !this.cabinState.compActy;
            } else if (keyLabel === 'CLR' || keyLabel === 'RSET') {
              this.cabinState.r1 = '+00000';
              this.cabinState.r2 = '+00000';
              this.cabinState.r3 = '+00000';
              this.cabinState.masterAlarm = false;
            } else if (/^[0-9]$/.test(keyLabel)) {
              this.cabinState.r1 = '+' + (this.cabinState.r1.slice(2) + keyLabel).slice(-5);
            }
            this.refreshCabinDisplays();
          }
        };
        this.interactables.push(capMesh);
        dskyGroup.add(keyCapGroup);
      }
    }

    // -------------------------------------------------------------------------
    // 3B. DUAL 3D GIMBALED FDAI "8-BALL" ATTITUDE INDICATORS (Interactive!)
    // -------------------------------------------------------------------------
    this.fdaiBalls = [];
    for (let side = -1; side <= 1; side += 2) {
      const fdaiBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.12, 28), isogridAlum);
      fdaiBezel.rotation.x = Math.PI / 2;
      fdaiBezel.position.set(side * 0.48, 1.46, -1.98);
      cabinGroup.add(fdaiBezel);

      const navBall = new THREE.Mesh(new THREE.SphereGeometry(0.128, 28, 28), charcoalRack);
      navBall.position.set(side * 0.48, 1.46, -1.94);
      const eqRing = new THREE.Mesh(new THREE.TorusGeometry(0.130, 0.006, 10, 28), cyanGlow);
      navBall.add(eqRing);
      const merRing = new THREE.Mesh(new THREE.TorusGeometry(0.130, 0.006, 10, 28), amberGlow);
      merRing.rotation.x = Math.PI / 2;
      navBall.add(merRing);

      navBall.userData.interactive = {
        label_tr: '🧭 [SOL TIK / VR TETİK] FDAI "8-BALL" JİROSKOP YÖNELİM KÜRESİNİ KALİBRE ET',
        label_en: '🧭 [CLICK / VR TRIGGER] CALIBRATE FDAI 8-BALL ATTITUDE GYRO',
        onClick: () => {
          this.playSwitchClickSound(720);
          navBall.rotation.x += 0.45;
          navBall.rotation.y += 0.65;
        }
      };
      this.interactables.push(navBall);
      this.fdaiBalls.push(navBall);
      cabinGroup.add(navBall);
    }

    // -------------------------------------------------------------------------
    // 3C. MULTI-PART 3D TOGGLE SWITCHES WITH HEX NUTS, U-GUARDS & LED JEWELS
    // -------------------------------------------------------------------------
    const consoleSwitches = [
      {
        x: -0.92,
        name_tr: 'ANA MOTOR İTKİ KONTROLÜ (DESCENT ENGINE ARM)',
        name_en: 'DESCENT ENGINE ARM SWITCH',
        onToggle: (st) => {
          this.cabinState.throttlePct = st ? 65 : 0;
        }
      },
      {
        x: -0.74,
        name_tr: 'RCS YÖNELİM İTİCİLERİ (4 QUAD THRUSTER BUS)',
        name_en: 'RCS 4-QUAD THRUSTER BUS SWITCH',
        onToggle: (st) => {
          this.cabinState.rcsArmed = st;
        }
      },
      {
        x: 0.74,
        name_tr: 'GLİKOL TERMAL SOĞUTMA POMPASI (ECS GLYCOL PUMP)',
        name_en: 'ECS GLYCOL COOLING PUMP SWITCH',
        onToggle: (st) => {
          this.cabinState.glycolPump = st;
        }
      },
      {
        x: 0.92,
        name_tr: 'S-BAND YÜKSEK KAZANÇLI TELEMETRİ ANTENİ',
        name_en: 'S-BAND HIGH-GAIN ANTENNA LOCK SWITCH',
        onToggle: (st) => {
          this.cabinState.sBandLocked = st;
        }
      },
      {
        x: 1.12,
        name_tr: 'KABİN İÇ AYDINLATMA MODU (BEYAZ / SİBER / GECE KIRMIZI)',
        name_en: 'CABIN FLOODLIGHT MODE SWITCH',
        onToggle: () => {
          this.cabinState.lightMode = (this.cabinState.lightMode + 1) % 3;
          if (this.cabinLightMain) {
            const colors = [0xf8fafc, 0x00f0ff, 0xef4444];
            this.cabinLightMain.color.setHex(colors[this.cabinState.lightMode]);
          }
        }
      }
    ];

    consoleSwitches.forEach((swCfg) => {
      const swGroup = new THREE.Group();
      swGroup.position.set(swCfg.x, 1.16, -1.72);
      swGroup.rotation.x = 0.22;

      // 6-Sided Hexagonal Mounting Nut & Bushing
      const hexNut = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.018, 6), brassNutMat);
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.032, 12), isogridAlum);
      bushing.position.y = 0.015;
      swGroup.add(hexNut, bushing);

      // U-Shaped Safety Switch Guard Brackets on Left & Right of Toggle
      for (let gSide = -1; gSide <= 1; gSide += 2) {
        const guard = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0045, 8, 16, Math.PI), chromeSwitchMat);
        guard.position.set(gSide * 0.026, 0.01, 0);
        guard.rotation.y = Math.PI / 2;
        swGroup.add(guard);
      }

      //Glowing Status LED Jewel behind the switch
      const ledJewel = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), greenGlow);
      ledJewel.position.set(0, 0.012, -0.055);
      swGroup.add(ledJewel);

      // Pivoting 3D Tapered Chrome Bat-Handle Lever
      const leverPivot = new THREE.Group();
      leverPivot.position.y = 0.025;
      leverPivot.rotation.x = -0.45; // Start in ON position
      const leverShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.065, 12), chromeSwitchMat);
      leverShaft.position.y = 0.032;
      const leverTip = new THREE.Mesh(new THREE.SphereGeometry(0.010, 12, 12), chromeSwitchMat);
      leverTip.position.y = 0.065;
      leverPivot.add(leverShaft, leverTip);
      swGroup.add(leverPivot);

      let isOn = true;
      const toggleAction = {
        label_tr: `🎚️ [SOL TIK / VR TETİK] 3B ŞALTER: ${swCfg.name_tr}`,
        label_en: `🎚️ [CLICK / VR TRIGGER] 3D SWITCH: ${swCfg.name_en}`,
        onClick: () => {
          this.playSwitchClickSound(isOn ? 640 : 960);
          isOn = !isOn;
          leverPivot.rotation.x = isOn ? -0.45 : 0.45;
          ledJewel.material = isOn ? greenGlow : amberGlow;
          swCfg.onToggle(isOn);
          this.refreshCabinDisplays();
        }
      };
      leverShaft.userData.interactive = toggleAction;
      leverTip.userData.interactive = toggleAction;
      hexNut.userData.interactive = toggleAction;
      this.interactables.push(leverShaft, leverTip, hexNut);
      cabinGroup.add(swGroup);
    });

    // -------------------------------------------------------------------------
    // 3D. KNURLED ROTARY SELECTOR KNOBS ON MAIN CONSOLE
    // -------------------------------------------------------------------------
    for (let k = -1; k <= 1; k += 2) {
      const knobGroup = new THREE.Group();
      knobGroup.position.set(k * 1.32, 1.15, -1.72);
      knobGroup.rotation.x = 0.22;

      const knobBase = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.025, 16), charcoalRack);
      const knobDial = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.042, 12), isogridAlum);
      knobDial.position.y = 0.022;
      const pointerBar = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.038), cyanGlow);
      pointerBar.position.set(0, 0.042, -0.01);
      knobDial.add(pointerBar);
      knobGroup.add(knobBase, knobDial);

      knobDial.userData.interactive = {
        label_tr: `🎛️ [SOL TIK / VR TETİK] DÖNER FREKANS & SENSÖR SEÇİCİ KADRAN (ROTARY DIAL)`,
        label_en: `🎛️ [CLICK / VR TRIGGER] ROTATE AVIONICS MODE SELECTOR DIAL`,
        onClick: () => {
          this.playSwitchClickSound(820);
          knobDial.rotation.y += Math.PI / 4;
          if (this.fdaiBalls.length > 0) {
            this.fdaiBalls.forEach((b) => { b.rotation.z += 0.25; });
          }
        }
      };
      this.interactables.push(knobDial);
      cabinGroup.add(knobGroup);
    }

    // -------------------------------------------------------------------------
    // 3E. INTERACTIVE 3D THROTTLE QUADRANT, ABORT STAGE BUTTON & ACA JOYSTICK
    // -------------------------------------------------------------------------
    const throttleBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.26), darkPanelMat);
    throttleBase.position.set(-0.42, 1.16, -1.68);
    const throttlePivot = new THREE.Group();
    throttlePivot.position.set(0, 0.05, 0);
    throttlePivot.rotation.x = 0.45;
    const throttleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 12), chromeSwitchMat);
    throttleHandle.position.set(0, 0.12, 0);
    const throttleGrip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.048, 0.048), redValve);
    throttleGrip.position.set(0, 0.24, 0);
    throttlePivot.add(throttleHandle, throttleGrip);
    throttleBase.add(throttlePivot);
    cabinGroup.add(throttleBase);

    const throttleAction = {
      label_tr: '🚀 [SOL TIK / VR TETİK] ANA İTKİ GAZ KOLU (DPS THROTTLE: %0 -> %25 -> %65 -> %100)',
      label_en: '🚀 [CLICK / VR TRIGGER] ADVANCE DESCENT ENGINE THROTTLE LEVER',
      onClick: () => {
        const steps = [0, 25, 65, 100];
        const nextIdx = (steps.indexOf(this.cabinState.throttlePct) + 1) % steps.length;
        this.cabinState.throttlePct = steps[nextIdx];
        this.playSwitchClickSound(420 + this.cabinState.throttlePct * 4);
        throttlePivot.rotation.x = 0.45 - (this.cabinState.throttlePct / 100) * 0.95;
        this.refreshCabinDisplays();
      }
    };
    throttleGrip.userData.interactive = throttleAction;
    throttleHandle.userData.interactive = throttleAction;
    this.interactables.push(throttleGrip, throttleHandle);

    // Guarded Red ABORT STAGE / MASTER ALARM Illuminated Pushbutton
    const abortHousing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.14), isogridAlum);
    abortHousing.position.set(0.42, 1.14, -1.68);
    const abortPlunger = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.10), redGlow);
    abortPlunger.position.y = 0.025;
    abortHousing.add(abortPlunger);
    cabinGroup.add(abortHousing);

    abortPlunger.userData.interactive = {
      label_tr: '🚨 [SOL TIK / VR TETİK] MASTER ALARM & ABORT STAGE ACİL DURUM BUTONU',
      label_en: '🚨 [CLICK / VR TRIGGER] MASTER ALARM & STAGE ABORT PUSHBUTTON',
      onClick: () => {
        this.cabinState.masterAlarm = !this.cabinState.masterAlarm;
        this.playSwitchClickSound(this.cabinState.masterAlarm ? 1320 : 520);
        abortPlunger.position.y = 0.008;
        setTimeout(() => { abortPlunger.position.y = 0.025; }, 160);
        if (this.cabinLightConsole) {
          this.cabinLightConsole.color.setHex(this.cabinState.masterAlarm ? 0xef4444 : 0x38bdf8);
        }
        this.refreshCabinDisplays();
      }
    };
    this.interactables.push(abortPlunger);

    // 3D Apollo ACA (Attitude Controller Assembly) 3-Axis Pistol-Grip Joystick on Right Armrest
    const acaBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.22), charcoalRack);
    acaBase.position.set(1.62, 1.08, -1.62);
    const acaBoot = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.08, 14), darkPanelMat);
    acaBoot.position.y = 0.08;
    const acaStick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.19, 12), charcoalRack);
    acaStick.position.set(0, 0.16, 0);
    acaStick.rotation.x = -0.15;
    const acaTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.035, 0.025), redValve);
    acaTrigger.position.set(0, 0.05, -0.022);
    acaStick.add(acaTrigger);
    acaBase.add(acaBoot, acaStick);
    cabinGroup.add(acaBase);

    acaStick.userData.interactive = {
      label_tr: '🕹️ [SOL TIK / VR TETİK] ACA 3-EKSENLİ YÖNELİM JOYSTICK KOLU (RCS PITCH/ROLL TESTİ)',
      label_en: '🕹️ [CLICK / VR TRIGGER] ACA 3-AXIS ATTITUDE CONTROLLER JOYSTICK',
      onClick: () => {
        this.playSwitchClickSound(740);
        acaStick.rotation.z = acaStick.rotation.z > 0 ? -0.25 : 0.25;
        this.fdaiBalls.forEach((b) => {
          b.rotation.x += 0.35;
          b.rotation.z -= 0.28;
        });
      }
    };
    this.interactables.push(acaStick);

    // =========================================================================
    // 4. LEFT & RIGHT SIDE WALLS + INTERACTIVE 120-BREAKER PANEL & CORE MODULE
    // =========================================================================
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.1, 4.4), isogridWallMat);
    leftWall.position.set(-2.18, 1.55, 0);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.1, 4.4), isogridWallMat);
    rightWall.position.set(2.18, 1.55, 0);
    cabinGroup.add(leftWall, rightWall);

    // Left Wall: Panels 11 & 16 Circuit Breaker Array (120 Individual Interactive 3D Breakers with Hex Collars!)
    const cbBoard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.48, 2.65), charcoalRack);
    cbBoard.position.set(-2.06, 1.72, -0.2);
    cabinGroup.add(cbBoard);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 15; col++) {
        const isRed = (row + col) % 7 === 0;
        const isAmber = (row + col) % 5 === 0;
        const swMat = isRed ? redValve : isAmber ? amberGlow : chromeSwitchMat;
        const breaker = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.052, 10), swMat);
        breaker.rotation.z = Math.PI / 2;
        breaker.position.set(-2.00, 1.15 + row * 0.16, -1.32 + col * 0.16);

        let pushedIn = true;
        breaker.userData.interactive = {
          label_tr: `⚡ [SOL TIK / VR TETİK] PANEL 11 DEVRE KESİCİ #${row * 15 + col + 1} (AÇ / KAPAT)`,
          label_en: `⚡ [CLICK / VR TRIGGER] PANEL 11 CIRCUIT BREAKER #${row * 15 + col + 1} (PULL / PUSH)`,
          onClick: () => {
            this.playSwitchClickSound(pushedIn ? 580 : 920);
            pushedIn = !pushedIn;
            breaker.position.x = pushedIn ? -2.00 : -1.96;
          }
        };
        this.interactables.push(breaker);
        cabinGroup.add(breaker);
      }
    }

    // Right Wall: Environmental Control System (ECS) LiOH Canisters, O2/Glycol Pipes & Interactive Valves
    for (let p = 0; p < 4; p++) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 2.8, 14),
        p % 2 === 0 ? copperPipe : isogridAlum
      );
      pipe.position.set(2.02, 1.45, -1.2 + p * 0.32);
      cabinGroup.add(pipe);

      const valveWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.082, 0.018, 10, 20),
        p % 2 === 0 ? blueValve : redValve
      );
      valveWheel.rotation.y = Math.PI / 2;
      valveWheel.position.set(1.95, 1.35 + (p % 2) * 0.35, -1.2 + p * 0.32);
      valveWheel.userData.interactive = {
        label_tr: `🔧 [SOL TIK / VR TETİK] ECS OKSİJEN / GLİKOL AKIŞ VALFİ #${p + 1} ÇEVİR`,
        label_en: `🔧 [CLICK / VR TRIGGER] TURN ECS OXYGEN / GLYCOL VALVE #${p + 1}`,
        onClick: () => {
          this.playSwitchClickSound(510);
          valveWheel.rotation.x += Math.PI / 3;
        }
      };
      this.interactables.push(valveWheel);
      cabinGroup.add(valveWheel);
    }

    for (let c = 0; c < 2; c++) {
      const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.68, 20), isogridAlum);
      canister.position.set(1.82, 0.55, 0.45 + c * 0.65);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.08, 20), goldKapton);
      cap.position.y = 0.34;
      canister.add(cap);
      cabinGroup.add(canister);
    }

    // Mission-Specific Center Pedestal / Internal Core Module (Interactive!)
    if (category === 'impact') {
      const gyroPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.85, 24), charcoalRack);
      gyroPedestal.position.set(0, 0.42, -0.45);
      const gyroSphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 28), goldKapton);
      gyroSphere.position.set(0, 1.05, -0.45);
      const gyroRing = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.025, 12, 28), cyanGlow);
      gyroRing.position.set(0, 1.05, -0.45);
      gyroRing.rotation.x = Math.PI / 3;
      gyroRing.userData.interactive = {
        label_tr: '🛰️ [SOL TIK / VR TETİK] SATURN V ST-124M ATALETSEL JİROSKOP HALKASINI DÖNDÜR',
        label_en: '🛰️ [CLICK / VR TRIGGER] SPIN ST-124M INERTIAL PLATFORM GYRO RING',
        onClick: () => {
          this.playSwitchClickSound(890);
          gyroRing.rotation.x += 0.6;
          gyroRing.rotation.y += 0.6;
        }
      };
      this.interactables.push(gyroRing);
      cabinGroup.add(gyroPedestal, gyroSphere, gyroRing);
    } else if (body === 'mars' || body === 'venus' || body === 'outer') {
      const rtgPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.92, 24), charcoalRack);
      rtgPedestal.position.set(0, 0.46, -0.45);
      cabinGroup.add(rtgPedestal);

      const rtgCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.65, 20),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xea580c, emissiveIntensity: 0.9, roughness: 0.3 })
      );
      rtgCore.position.set(0, 1.15, -0.45);
      rtgCore.userData.interactive = {
        label_tr: '☢️ [SOL TIK / VR TETİK] MMRTG PLÜTONYUM-238 NÜKLEER ÇEKİRDEK & NUMUNE KARUSELİ TESTİ',
        label_en: '☢️ [CLICK / VR TRIGGER] INSPECT MMRTG PU-238 NUCLEAR CORE & SAMPLE CAROUSEL',
        onClick: () => {
          this.playSwitchClickSound(660);
          rtgCore.rotation.y += Math.PI / 4;
        }
      };
      this.interactables.push(rtgCore);
      cabinGroup.add(rtgCore);

      for (let t = 0; t < 12; t++) {
        const ang = (t * Math.PI * 2) / 12;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 12), chromeSwitchMat);
        tube.position.set(Math.cos(ang) * 0.38, 0.98, -0.45 + Math.sin(ang) * 0.38);
        cabinGroup.add(tube);
      }
    } else {
      const engineCover = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.88, 28), isogridWallMat);
      engineCover.position.set(0, 0.44, -0.42);
      const engineTopCap = new THREE.Mesh(new THREE.CylinderGeometry(0.59, 0.59, 0.06, 28), goldKapton);
      engineTopCap.position.set(0, 0.89, -0.42);
      engineTopCap.userData.interactive = {
        label_tr: '🔥 [SOL TIK / VR TETİK] APS YÜKSELİŞ MOTORU (ASCENT ENGINE) KAPAK TELEMETRİSİ',
        label_en: '🔥 [CLICK / VR TRIGGER] INSPECT ASCENT PROPULSION SYSTEM (APS) ENGINE COVER',
        onClick: () => {
          this.playSwitchClickSound(540);
          this.cabinState.prog = '12';
          this.cabinState.verb = '37';
          this.cabinState.noun = '12';
          this.refreshCabinDisplays();
        }
      };
      this.interactables.push(engineTopCap);
      cabinGroup.add(engineCover, engineTopCap);
    }

    this.scene.add(this.walkableInteriorGroup);
  }

  // Raycast against interactive 3D cabin buttons/switches from cursor or center visor reticle
  getHoveredInteractive(ndcVec = null, xrController = null) {
    if (!this.interactRaycaster || !this.interactables || this.interactables.length === 0) return null;

    if (xrController) {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(xrController.matrixWorld);
      this.interactRaycaster.ray.origin.setFromMatrixPosition(xrController.matrixWorld);
      this.interactRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    } else {
      const coords = ndcVec || this.mouseNDC || new THREE.Vector2(0, 0);
      this.interactRaycaster.setFromCamera(coords, this.camera);
    }

    const hits = this.interactRaycaster.intersectObjects(this.interactables, false);
    if (hits && hits.length > 0 && hits[0].distance <= 5.5) {
      return hits[0].object;
    }

    // Fallback to center visor reticle (0, 0) if cursor isn't directly over a button
    if (!xrController && ndcVec) {
      this.interactRaycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const centerHits = this.interactRaycaster.intersectObjects(this.interactables, false);
      if (centerHits && centerHits.length > 0 && centerHits[0].distance <= 5.5) {
        return centerHits[0].object;
      }
    }
    return null;
  }

  updateInteractiveReticle() {
    if (this.cameraMode !== 'walk') return;
    const hitObj = this.getHoveredInteractive(this.mouseNDC);
    const dotEl = document.getElementById('walk-reticle-dot');
    const promptEl = document.getElementById('walk-interact-prompt');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;

    if (hitObj && hitObj.userData && hitObj.userData.interactive) {
      if (dotEl) dotEl.classList.add('active-target');
      if (promptEl) {
        promptEl.classList.remove('hidden');
        promptEl.innerText = isTr
          ? hitObj.userData.interactive.label_tr
          : hitObj.userData.interactive.label_en;
      }
    } else {
      if (dotEl) dotEl.classList.remove('active-target');
      if (promptEl) promptEl.classList.add('hidden');
    }
  }

  triggerCabinInteraction(ndcVec = null, xrController = null) {
    const hitObj = this.getHoveredInteractive(ndcVec, xrController);
    if (hitObj && hitObj.userData && hitObj.userData.interactive && hitObj.userData.interactive.onClick) {
      hitObj.userData.interactive.onClick();
    }
  }

  renderFrame() {
    if (!this.isPlaying) return;

    if (!this.renderer.xr.isPresenting) {
      const wrapper = this.canvas.parentElement;
      const w = wrapper && wrapper.clientWidth > 0 ? wrapper.clientWidth : window.innerWidth;
      const h = wrapper && wrapper.clientHeight > 0 ? wrapper.clientHeight : window.innerHeight;
      const finalW = w > 0 ? w : window.innerWidth;
      const finalH = h > 0 ? h : window.innerHeight;

      if (Math.abs(this.currentW - finalW) > 2 || Math.abs(this.currentH - finalH) > 2 || isNaN(this.camera.aspect)) {
        this.currentW = finalW;
        this.currentH = finalH;
        this.camera.aspect = finalW / finalH;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(finalW, finalH, true);
      }
    }

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.simTime += dt;

    this.updateSimulationPhysics(this.simTime, dt);
    this.updateHUD(this.simTime);
    this.updateCamera(this.simTime, dt);

    if (this.controls && this.cameraMode === 'free' && !this.renderer.xr.isPresenting) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateSimulationPhysics(t, dt) {
    const artifact = this.currentArtifact;
    if (!artifact || !this.spacecraft) return;

    const descentOffset = this.getDescentOffset(t);
    const showWalkCabin = (this.cameraMode === 'walk' || t >= 5.8);
    if (this.walkableInteriorGroup) {
      this.walkableInteriorGroup.visible = showWalkCabin;
      this.walkableInteriorGroup.position.y = descentOffset;
    }
    if (this.dummyAscentSolidGroup) {
      this.dummyAscentSolidGroup.visible = !showWalkCabin;
    }

    // Live Cockpit Avionics & Window Dust Plumes while descending in Walk Mode (t < 5.8)
    if (this.cameraMode === 'walk') {
      if (t < 5.8) {
        if (!this.lastCockpitTick || t - this.lastCockpitTick > 0.24) {
          this.lastCockpitTick = t;
          if (this.cabinState) {
            this.cabinState.prog = t < 3.0 ? '64' : '66';
            this.cabinState.throttlePct = Math.max(18, Math.round(85 - (t / 5.8) * 65));
            this.cabinState.r1 = '+' + String(Math.round(descentOffset * 10)).padStart(5, '0');
            this.cabinState.r2 = '-' + String(Math.round((descentOffset / 5.8) * 16 + 2)).padStart(5, '0');
            this.refreshCabinDisplays();
          }
        }
        // Spawn glowing rocket thruster plume & regolith dust flying past the front cockpit windows (-Z)!
        if (Math.random() < 0.75) {
          const winDustPos = new THREE.Vector3(
            (Math.random() - 0.5) * 4.5,
            descentOffset + 2.2,
            -2.8 - Math.random() * 2.5
          );
          const winDustVel = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            12 + Math.random() * 14,
            -6 - Math.random() * 10
          );
          const col = descentOffset < 22
            ? (artifact.body === 'venus' ? 0xd97706 : artifact.body === 'mars' ? 0xc45c2c : 0xcbd5e1)
            : 0x93c5fd;
          this.createParticle(winDustPos, winDustVel, col, 0.55, 0.22);
        }
      } else if (!this.touchdownConfirmed) {
        this.touchdownConfirmed = true;
        this.shakeIntensity = 0.75;
        this.playSwitchClickSound(1240);
        setTimeout(() => this.playSwitchClickSound(1560), 140);
        if (this.cabinState) {
          this.cabinState.prog = '68';
          this.cabinState.throttlePct = 0;
          this.cabinState.r1 = '+00000';
          this.cabinState.r2 = '+00000';
          this.refreshCabinDisplays();
        }
      }
    }

    if (artifact.category === 'impact') {
      if (this.cameraMode === 'walk') {
        this.spacecraft.visible = true;
        this.spacecraft.position.set(-8.2, 2.3 + descentOffset, -2.5);
        this.spacecraft.rotation.set(0.2, 0.4, Math.PI * 0.42);
      } else if (t < 3.2) {
        const progress = t / 3.2;
        this.spacecraft.position.x = -75 + progress * 66.8;
        this.spacecraft.position.y = 100 - progress * 97.7;
        this.spacecraft.position.z = -2.5;

        if (Math.random() < 0.9) {
          this.createParticle(
            this.spacecraft.position.clone().add(new THREE.Vector3(-4, 4, 0)),
            new THREE.Vector3(-15 - Math.random() * 8, 12 + Math.random() * 8, (Math.random() - 0.5) * 5),
            0xff9900,
            0.65
          );
        }
      } else if (t >= 3.2 && !this.impactTriggered) {
        this.impactTriggered = true;
        // Keep the impacted rocket stage visible resting in the impact crater at all camera angles!
        this.spacecraft.visible = true;
        this.spacecraft.position.set(-8.2, 2.3, -2.5);
        this.spacecraft.rotation.set(0.2, 0.4, Math.PI * 0.42);
        this.shakeIntensity = 4.0;

        const flashLight = new THREE.PointLight(0xfffaed, 18, 120);
        flashLight.position.set(0, 3, 0);
        this.scene.add(flashLight);
        setTimeout(() => this.scene.remove(flashLight), 350);

        const ringGeo = new THREE.RingGeometry(0.5, 4.0, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        this.shockwave = new THREE.Mesh(ringGeo, ringMat);
        this.shockwave.position.y = 0.4;
        this.scene.add(this.shockwave);

        for (let i = 0; i < 140; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 65,
            15 + Math.random() * 60,
            (Math.random() - 0.5) * 65
          );
          this.createParticle(new THREE.Vector3(0, 0.8, 0), vel, Math.random() > 0.4 ? 0xff3b00 : 0xffcc00, 3.2);
        }

        for (let i = 0; i < 180; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 95,
            8 + Math.random() * 40,
            (Math.random() - 0.5) * 95
          );
          this.createParticle(new THREE.Vector3(0, 0.4, 0), vel, 0xdbeafe, 4.0);
        }
      }

      if (this.shockwave) {
        this.shockwave.scale.multiplyScalar(1.08);
        this.shockwave.material.opacity *= 0.94;
        if (this.shockwave.material.opacity < 0.05) {
          this.scene.remove(this.shockwave);
          this.shockwave = null;
        }
      }

    } else if (artifact.category === 'helicopter') {
      if (this.blade1 && this.blade2) {
        const rpm = Math.min(t * 22, 85);
        this.blade1.rotation.y += rpm * dt;
        this.blade2.rotation.y -= rpm * dt;
      }

      if (this.cameraMode === 'walk') {
        this.spacecraft.position.set(0, 2.4 + descentOffset, 0);
      } else if (t > 1.5 && t < 6.4) {
        const targetY = Math.min((t - 1.5) * 3.8, 12);
        this.spacecraft.position.y = targetY;
        this.spacecraft.position.x = Math.sin((t - 1.5) * 1.2) * 6;

        if (Math.random() < 0.8) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 9, 0.2, (Math.random() - 0.5) * 9),
            new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 2.8, (Math.random() - 0.5) * 8),
            0xc45c2c,
            1.4
          );
        }
      } else if (t >= 6.4 && t < 9.4) {
        const landY = Math.max(2.4, 12 - (t - 6.4) * 4);
        this.spacecraft.position.y = landY;
      }

    } else if (artifact.id === 'curiosity-skycrane') {
      if (this.cameraMode === 'walk') {
        this.roverBody.position.y = 1.2 + descentOffset;
        if (this.tetherGroup) this.tetherGroup.visible = (t < 5.5);
        if (this.cranePlatform) this.cranePlatform.position.y = 18 + descentOffset;
      } else if (t < 4.5) {
        const progress = t / 4.5;
        this.roverBody.position.y = Math.max(1.2, 14 - progress * 12.8);

        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const pos = new THREE.Vector3(Math.cos(ang) * 4.6, 18, Math.sin(ang) * 4.6);
          this.createParticle(pos, new THREE.Vector3(Math.cos(ang) * 6, -24 - Math.random() * 12, Math.sin(ang) * 6), 0x00f0ff, 0.45);
        }
      } else if (t >= 4.5 && t < 4.8) {
        this.tetherGroup.visible = false;
        this.shakeIntensity = 0.6;
      } else if (t >= 4.8) {
        this.cranePlatform.position.x += 22 * dt;
        this.cranePlatform.position.y += 15 * dt;
        this.cranePlatform.rotation.z = -0.48;

        if (t > 8.0 && !this.craneCrashed) {
          this.craneCrashed = true;
          this.cranePlatform.visible = false;
          this.shakeIntensity = 2.2;
        }
      }

    } else {
      if (t < 5.8) {
        const currentY = 3.2 + descentOffset;
        this.spacecraft.position.y = currentY;

        if (this.engineLight) {
          this.engineLight.intensity = 4.5 + Math.random() * 2.5;
        }
        if (this.exhaustPlume) {
          this.exhaustPlume.visible = true;
          this.exhaustPlume.scale.set(1.0 + Math.random() * 0.2, 1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.2);
          this.exhaustPlume.material.opacity = 0.5 + Math.random() * 0.3;

          const exhaustPos = this.spacecraft.position.clone().add(new THREE.Vector3(0, -2.6, 0));
          for (let i = 0; i < 3; i++) {
            this.createParticle(
              exhaustPos,
              new THREE.Vector3((Math.random() - 0.5) * 2.5, -28 - Math.random() * 14, (Math.random() - 0.5) * 2.5),
              0xd0e8ff,
              0.45
            );
          }
        }

        if (currentY < 28) {
          const intensity = (28 - currentY) / 28;
          for (let i = 0; i < Math.floor(intensity * 6); i++) {
            const dustOrigin = new THREE.Vector3((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8);
            const dustVel = new THREE.Vector3(
              (Math.random() - 0.5) * 30 * intensity,
              Math.random() * 8 * intensity,
              (Math.random() - 0.5) * 30 * intensity
            );
            this.createParticle(dustOrigin, dustVel, artifact.body === 'venus' ? 0xd97706 : 0x9ca3af, 2.0);
          }
        }
      } else {
        this.spacecraft.position.y = 3.2;
        if (this.engineLight) this.engineLight.intensity = 0;
        if (this.exhaustPlume) this.exhaustPlume.visible = false;
        if (t < 6.1 && !this.touchdownConfirmed) {
          this.shakeIntensity = 0.8;
        }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 9.8 * 0.22 * dt;
        p.mesh.material.opacity = p.life / p.maxLife;
      }
    }
  }

  createParticle(position, velocity, color, maxLife, radius = 0.38) {
    const geo = new THREE.SphereGeometry(radius * (0.8 + Math.random() * 0.5), 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocity: velocity.clone(),
      life: maxLife,
      maxLife
    });
  }

  updateCamera(t, dt = 0.016) {
    if (!this.spacecraft) return;
    const sPos = this.spacecraft.position;

    if (this.cameraMode === 'walk') {
      if (this.controls) this.controls.enabled = false;
      this.updateAstronautWalk(dt);
      return;
    }

    if (this.cameraMode === 'free') {
      if (this.controls) this.controls.enabled = true;
      return;
    }

    if (this.controls) this.controls.enabled = false;

    if (this.cameraMode === 'follow') {
      this.camera.position.set(sPos.x + 18, sPos.y + 11, sPos.z + 32);
      this.camera.lookAt(sPos.x, sPos.y, sPos.z);
    } else if (this.cameraMode === 'ground') {
      this.camera.position.set(0, 2.2, 34);
      this.camera.lookAt(sPos.x, Math.max(1.2, sPos.y * 0.7), sPos.z);
    } else {
      const r = 46;
      const ang = t * 0.32;
      this.camera.position.set(
        Math.cos(ang) * r,
        Math.max(9, sPos.y * 0.4 + 15 + Math.sin(t * 0.25) * 5),
        Math.sin(ang) * r
      );
      this.camera.lookAt(sPos.x, Math.max(1.5, sPos.y * 0.5 + 2.2), sPos.z);
    }

    if (this.shakeIntensity > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.92;
    }
  }

  // ===========================================================================
  // REALISTIC ASTRONAUT WALKING, LADDER CLIMBING, CABIN INTERIOR & YXZ CAMERA
  // ===========================================================================
  updateAstronautWalk(dt) {
    const ws = this.walkState;
    ws.breathPhase += dt * 1.65;
    const speed = ws.isInsideCabin ? 2.6 : 4.8; // Careful indoor cabin movement vs. EVA surface stride
    let moveForward = 0;
    let moveRight = 0;

    if (ws.keys.w) moveForward += 1;
    if (ws.keys.s) moveForward -= 1;
    if (ws.keys.d) moveRight += 1;
    if (ws.keys.a) moveRight -= 1;

    // Also poll WebXR VR Controller Gamepad Thumbsticks if inside an XR headset!
    if (this.xrSession && this.xrSession.inputSources) {
      for (const source of this.xrSession.inputSources) {
        if (source.gamepad && source.gamepad.axes && source.gamepad.axes.length >= 4) {
          const axX = source.gamepad.axes[2] || 0;
          const axY = source.gamepad.axes[3] || 0;
          if (Math.abs(axY) > 0.15) moveForward -= axY;
          if (Math.abs(axX) > 0.15) moveRight += axX;
        }
      }
    }

    // Smoothly damp mouse-look rotation without any angle wrapping or gimbal lock
    if (ws.smoothYaw === undefined) ws.smoothYaw = ws.yaw;
    if (ws.smoothPitch === undefined) ws.smoothPitch = ws.pitch;
    const lookLerp = Math.min(1, dt * 18.0);
    ws.smoothYaw += (ws.yaw - ws.smoothYaw) * lookLerp;
    ws.smoothPitch += (ws.pitch - ws.smoothPitch) * lookLerp;
    // Guarantee pitch stays within safe human neck range (±58 deg)
    ws.smoothPitch = Math.max(-1.01, Math.min(1.01, ws.smoothPitch));

    const forwardX = -Math.sin(ws.smoothYaw);
    const forwardZ = -Math.cos(ws.smoothYaw);
    const rightX = Math.cos(ws.smoothYaw);
    const rightZ = -Math.sin(ws.smoothYaw);

    const isMoving = (Math.abs(moveForward) > 0.01 || Math.abs(moveRight) > 0.01);

    // Smooth acceleration / deceleration blend factor
    if (ws.moveBlend === undefined) ws.moveBlend = 0;
    const targetBlend = isMoving ? 1.0 : 0.0;
    ws.moveBlend += (targetBlend - ws.moveBlend) * Math.min(1, dt * 7.5);

    const cabinFloorY = 4.5;
    const descentOffset = this.getDescentOffset(this.simTime);
    const isDescending = this.simTime < 5.8;
    const groundY0 = this.getExactSurfaceHeight(0, 6.2);
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    const cabinBtn = document.getElementById('btn-walk-cabin');

    // Smoothly animate the Hinged Pressurized EVA Hatch Door & Spinning Red Valve Wheel!
    if (this.cabinState) {
      const targetHatch = this.cabinState.hatchOpen ? 1.0 : 0.0;
      const diff = targetHatch - (this.cabinState.hatchProgress || 0);
      if (Math.abs(diff) > 0.001) {
        this.cabinState.hatchProgress = (this.cabinState.hatchProgress || 0) + Math.sign(diff) * Math.min(Math.abs(diff), dt * 1.75);
      } else {
        this.cabinState.hatchProgress = targetHatch;
      }
      const hp = this.cabinState.hatchProgress || 0;
      if (this.hatchWheel) {
        this.hatchWheel.rotation.z = hp * Math.PI * 3.5;
      }
      if (this.hatchPivotGroup) {
        const doorSwing = Math.max(0, (hp - 0.16) / 0.84);
        this.hatchPivotGroup.rotation.y = -doorSwing * (Math.PI * 0.62);
      }
      if (this.hatchStatusLamp && this.hatchStatusLamp.material) {
        this.hatchStatusLamp.material.color.setHex(
          isDescending ? 0xef4444 : (this.cabinState.hatchOpen ? 0x10b981 : 0xf59e0b)
        );
      }
    }

    if (ws.handReachTimer && ws.handReachTimer > 0) {
      ws.handReachTimer = Math.max(0, ws.handReachTimer - dt);
    }

    if (isMoving) {
      const len = Math.hypot(moveForward, moveRight) || 1;
      const nx = (forwardX * moveForward + rightX * moveRight) / len;
      const nz = (forwardZ * moveForward + rightZ * moveRight) / len;

      const candidateX = ws.x + nx * speed * dt;
      const candidateZ = ws.z + nz * speed * dt;
      const candidateDist = Math.hypot(candidateX, candidateZ);

      // 1. Check if astronaut is inside the Pressurized Spacecraft Cabin (|x| <= 1.88, z in [-1.72, 2.25])
      if (ws.isInsideCabin) {
        // When walking up to the rear +Z Hatch Door (z > 1.15 and |x| < 0.88):
        // After touchdown, the astronaut automatically reaches out, spins the valve wheel, and opens the hatch door!
        if (candidateZ > 1.15 && Math.abs(candidateX) < 0.88 && !this.cabinState.hatchOpen) {
          this.triggerOpenHatch(false);
        }

        const hatchReadyToStepOut = !isDescending && this.cabinState && this.cabinState.hatchOpen && (this.cabinState.hatchProgress || 0) >= 0.62;

        // If hatch is open and astronaut walks out through the +Z doorway (|x| < 0.78 and z > 2.24), step onto the top ladder porch!
        if (hatchReadyToStepOut && candidateZ > 2.24 && Math.abs(candidateX) < 0.78) {
          ws.isInsideCabin = false;
          ws.isOnLadder = true;
          ws.x = Math.max(-0.45, Math.min(0.45, candidateX));
          ws.z = 2.48;
          if (cabinBtn) {
            cabinBtn.classList.remove('active');
            cabinBtn.innerText = isTr ? '🦶 Yüzeye Tam İn / Kabine Dön (E)' : '🦶 Step to Surface / Return (E)';
          }
        } else {
          // Constrain smoothly within cabin walls & around center pedestal (radius 0.72m at z = -0.42)
          const maxCabinZ = hatchReadyToStepOut ? 2.26 : 1.78;
          const clampedX = Math.max(-1.82, Math.min(1.82, candidateX));
          const clampedZ = Math.max(-1.62, Math.min(maxCabinZ, candidateZ));
          if (Math.hypot(clampedX, clampedZ + 0.42) > 0.72) {
            ws.x = clampedX;
            ws.z = clampedZ;
          }
        }
      } else {
        // 2. Check if astronaut is in the Exterior Boarding Ladder Corridor (|x| < 0.95, z between 2.15 and 6.35)
        const inLadderCorridor = Math.abs(candidateX) < 0.95 && candidateZ >= 2.10 && candidateZ <= 6.35;
        if (inLadderCorridor) {
          ws.isOnLadder = true;
          ws.x = Math.max(-0.55, Math.min(0.55, candidateX));
          ws.z = candidateZ;
          // Climbing back up to the top of the ladder (z <= 2.18 while moving toward -Z) steps back inside the cabin!
          if (ws.z <= 2.18 && nz < 0) {
            this.cabinState.hatchOpen = true;
            ws.isInsideCabin = true;
            ws.isOnLadder = false;
            ws.z = 1.85;
            ws.y = cabinFloorY + descentOffset;
            if (cabinBtn) {
              cabinBtn.classList.add('active');
              cabinBtn.innerText = isTr ? '🚪 Kabinden Yüzeye Çık (E)' : '🚪 Exit Cabin to Surface (E)';
            }
          }
        } else {
          ws.isOnLadder = false;
          // Standard surface movement outside central lander hull (radius 4.4m)
          if (candidateDist > 4.4 && candidateDist < 120) {
            ws.x = candidateX;
            ws.z = candidateZ;
          }
        }
      }

      ws.stepPhase += dt * (ws.isInsideCabin ? 5.2 : 6.4);

      // Spawn ribbed lunar footprint & dust puff on every surface footfall (when on planetary regolith)
      const stepInterval = Math.PI * 0.72;
      const stepIndex = Math.floor(ws.stepPhase / stepInterval);
      if (stepIndex > ws.lastStepCount && ws.isGrounded && !ws.isInsideCabin && !ws.isOnLadder) {
        ws.lastStepCount = stepIndex;
        const isLeftFoot = (stepIndex % 2 === 0);
        const strideBack = -0.10;
        const footX = ws.x + forwardX * strideBack;
        const footZ = ws.z + forwardZ * strideBack;
        this.spawnFootprint(footX, footZ, ws.smoothYaw, isLeftFoot);
        this.spawnBootDust(footX, footZ, 4);
      }
    }

    // Vertical Elevation: Inside Descending/Landed Cabin vs. Climbing Ladder vs. Planetary Surface Gravity
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const gravity = body === 'moon' ? 3.2 : body === 'outer' ? 2.8 : body === 'mars' ? 5.5 : 9.8;
    const groundY = this.getExactSurfaceHeight(ws.x, ws.z);

    if (ws.isInsideCabin) {
      // Ride smoothly inside the descending rocket cabin from 68m altitude down to 4.5m deck height!
      const engineVib = isDescending
        ? (Math.sin(this.simTime * 46) * 0.011 + Math.cos(this.simTime * 31) * 0.008)
        : 0;
      ws.y = cabinFloorY + descentOffset + engineVib;
      ws.vy = 0;
      ws.isGrounded = true;
    } else if (ws.isOnLadder) {
      // Smoothly climb up/down the 12 ladder rungs based on z position (z = 6.35 -> groundY0, z = 2.35 -> cabinFloorY)
      const climbFrac = Math.max(0, Math.min(1, (6.35 - ws.z) / (6.35 - 2.35)));
      ws.y = groundY0 + climbFrac * (cabinFloorY - groundY0);
      ws.vy = 0;
      ws.isGrounded = true;
    } else if (!ws.isGrounded || ws.y > groundY + 0.04) {
      ws.vy -= gravity * dt;
      ws.y += ws.vy * dt;
      if (ws.y <= groundY) {
        ws.y = groundY;
        ws.vy = 0;
        ws.isGrounded = true;
        this.spawnFootprint(ws.x, ws.z, ws.smoothYaw, true);
        this.spawnFootprint(ws.x, ws.z, ws.smoothYaw, false);
        this.spawnBootDust(ws.x, ws.z, 10);
      }
    } else {
      ws.y = groundY;
    }

    // Keep the exterior spacecraft / rocket / descent stage visible at all elevations and angles;
    // only hide the solid dummy ascent block so the walkable interior cabin is unobstructed!
    if (this.spacecraft) {
      this.spacecraft.visible = true;
    }
    if (this.dummyAscentSolidGroup) {
      this.dummyAscentSolidGroup.visible = false;
    }

    // Smooth C2-continuous sinusoidal EVA stride bob & natural weight-transfer sway
    const groundFactor = ws.isGrounded ? ws.moveBlend : 0;
    const strideWave = 0.5 - 0.5 * Math.cos(ws.stepPhase * 2.0);
    const bounceAmp = ws.isInsideCabin ? 0.032 : 0.075;
    const verticalBounce = groundFactor * strideWave * bounceAmp + (1 - groundFactor) * Math.sin(ws.breathPhase) * 0.008;
    const lateralSway = groundFactor * Math.sin(ws.stepPhase) * (ws.isInsideCabin ? 0.018 : 0.036);
    const rollSway = groundFactor * Math.sin(ws.stepPhase) * (ws.isInsideCabin ? 0.006 : 0.012);
    const pitchBob = groundFactor * Math.cos(ws.stepPhase * 2.0) * (ws.isInsideCabin ? 0.005 : 0.009);

    // Animate First-Person Astronaut Arms & Gloved Hands (including Hatch Valve Opening & Ladder Climbing!)
    if (this.fpLeftArm && this.fpRightArm) {
      const swing = groundFactor * Math.sin(ws.stepPhase) * 0.14 + (1 - groundFactor) * Math.sin(ws.breathPhase) * 0.022;
      const climbLiftL = ws.isOnLadder ? Math.sin(ws.stepPhase) * 0.12 : 0;
      const climbLiftR = ws.isOnLadder ? -Math.sin(ws.stepPhase) * 0.12 : 0;
      const jumpLift = ws.isGrounded ? 0 : Math.min(0.16, Math.abs(ws.vy) * 0.038);
      const reachWave = ws.handReachTimer > 0 ? Math.sin((1.05 - ws.handReachTimer) * Math.PI) : 0;

      this.fpLeftArm.position.set(-0.27 + lateralSway * 0.35, -0.26 + strideWave * groundFactor * 0.025 + jumpLift * 0.35 + climbLiftL, -0.44 - swing * 0.32);
      this.fpLeftArm.rotation.set(0.42 + swing * 0.48 + jumpLift + climbLiftL * 1.4, 0.22 + lateralSway * 0.2, -0.18 - rollSway * 1.2);

      this.fpRightArm.position.set(
        0.28 + lateralSway * 0.35 - reachWave * 0.14,
        -0.26 + strideWave * groundFactor * 0.025 + jumpLift * 0.35 + climbLiftR + reachWave * 0.18,
        -0.44 + swing * 0.32 - reachWave * 0.22
      );
      this.fpRightArm.rotation.set(
        0.38 - swing * 0.48 + jumpLift + climbLiftR * 1.4 + reachWave * 0.65,
        -0.20 + lateralSway * 0.2 + reachWave * 0.35,
        0.15 - rollSway * 1.2 - reachWave * Math.sin(this.simTime * 16) * 0.45
      );
    }

    // Animate 3rd-Person Full Articulated Astronaut Suit (2-Bone Arms + 2-Bone Legs + Torso Twist)
    if (this.tpAstronaut) {
      this.tpAstronaut.position.set(ws.x, ws.y + verticalBounce * 0.75, ws.z);
      this.tpAstronaut.rotation.y = ws.smoothYaw;

      if (this.tpLimbs && this.tpLimbs.leftArm) {
        const phase = ws.stepPhase;
        const blend = ws.moveBlend;
        const jumpPose = ws.isGrounded ? 0 : 0.35;
        const ladderPose = ws.isOnLadder ? 0.55 : 0;

        if (this.tpLimbs.upperBody) {
          this.tpLimbs.upperBody.rotation.x = 0.06 * blend + ladderPose * 0.25 + Math.sin(ws.breathPhase) * 0.012;
          this.tpLimbs.upperBody.rotation.y = -Math.sin(phase) * 0.08 * blend;
          this.tpLimbs.upperBody.rotation.z = Math.cos(phase) * 0.035 * blend;
        }

        if (this.tpLimbs.helmetGroup) {
          this.tpLimbs.helmetGroup.rotation.x = -ws.smoothPitch * 0.45;
          this.tpLimbs.helmetGroup.rotation.y = Math.sin(ws.breathPhase * 0.6) * 0.04;
        }

        const armSwing = Math.sin(phase) * 0.46 * blend;
        this.tpLimbs.leftArm.rotation.x = armSwing - jumpPose * 0.5 - ladderPose * 0.85;
        this.tpLimbs.rightArm.rotation.x = -armSwing - jumpPose * 0.5 - ladderPose * 0.85;

        if (this.tpLimbs.leftForearm && this.tpLimbs.rightForearm) {
          this.tpLimbs.leftForearm.rotation.x = 0.28 + Math.max(0, Math.sin(phase)) * 0.42 * blend + jumpPose * 0.4 + ladderPose * 0.5;
          this.tpLimbs.rightForearm.rotation.x = 0.28 + Math.max(0, -Math.sin(phase)) * 0.42 * blend + jumpPose * 0.4 + ladderPose * 0.5;
        }

        const leftHipAngle = -Math.sin(phase) * 0.55 * blend - jumpPose * 0.35 - ladderPose * 0.4;
        const rightHipAngle = Math.sin(phase) * 0.55 * blend - jumpPose * 0.20 - ladderPose * 0.4;
        this.tpLimbs.leftLeg.rotation.x = leftHipAngle;
        this.tpLimbs.rightLeg.rotation.x = rightHipAngle;

        if (this.tpLimbs.leftShin && this.tpLimbs.rightShin) {
          const leftKneeBend = Math.max(0, -Math.cos(phase)) * 0.68 * blend + jumpPose * 0.65 + ladderPose * 0.6;
          const rightKneeBend = Math.max(0, Math.cos(phase)) * 0.68 * blend + jumpPose * 0.55 + ladderPose * 0.6;
          this.tpLimbs.leftShin.rotation.x = leftKneeBend;
          this.tpLimbs.rightShin.rotation.x = rightKneeBend;
        }
      }
    }

    // =========================================================================
    // GIMBAL-FREE YXZ CAMERA ORIENTATION (NEVER FLIPS UPSIDE DOWN OR SHAKES!)
    // =========================================================================
    this.camera.rotation.order = 'YXZ';

    if (this.renderer.xr && this.renderer.xr.isPresenting) {
      // In real WebXR VR headset: move the cameraRig dolly on the surface or inside the cabin; headset controls head look!
      this.cameraRig.position.set(ws.x, ws.y, ws.z);
      this.cameraRig.rotation.set(0, ws.smoothYaw, 0, 'YXZ');
    } else if (this.walkViewMode === 'tp') {
      // 3rd-Person Over-the-Shoulder Camera using direct YXZ Euler (no lookAt flip!)
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      const camDist = ws.isInsideCabin ? 1.65 : 3.45;
      const tpPitch = Math.max(-0.85, Math.min(0.85, ws.smoothPitch * 0.75 - 0.10));
      const horizDist = camDist * Math.cos(tpPitch);
      const camX = ws.x - forwardX * horizDist + rightX * (0.42 + lateralSway * 0.35);
      const camZ = ws.z - forwardZ * horizDist + rightZ * (0.42 + lateralSway * 0.35);
      const minGroundY = ws.isInsideCabin ? cabinFloorY + 0.5 : this.getExactSurfaceHeight(camX, camZ) + 0.55;
      const camY = Math.max(minGroundY, ws.y + 1.55 + verticalBounce * 0.45 - camDist * Math.sin(tpPitch));

      this.camera.position.set(camX, camY, camZ);
      this.camera.rotation.set(tpPitch, ws.smoothYaw, rollSway * 0.35, 'YXZ');
    } else {
      // 1st-Person Astronaut Visor & Hands Camera using pure YXZ Euler (zero gimbal lock, 360° smooth!)
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      const eyeY = ws.y + ws.eyeHeight + verticalBounce;
      const effectivePitch = Math.max(-1.02, Math.min(1.02, ws.smoothPitch + pitchBob));

      this.camera.position.set(ws.x + rightX * lateralSway, eyeY, ws.z + rightZ * lateralSway);
      this.camera.rotation.set(effectivePitch, ws.smoothYaw, rollSway, 'YXZ');
    }

    // Update 1:1 Walk HUD telemetry
    const dist = Math.hypot(ws.x, ws.z).toFixed(1);
    const distEl = document.getElementById('walk-hud-dist');
    const gravEl = document.getElementById('walk-hud-grav');
    const statusEl = document.getElementById('walk-xr-status');
    if (statusEl && !this.xrSession) {
      if (ws.isInsideCabin) {
        if (isDescending) {
          statusEl.innerText = isTr
            ? `🚀 ROKET İNİŞİ AKTİF (İrtifa: +${descentOffset.toFixed(1)}m): Kokpit pencerelerinden inişi izleyin! Yüzeye temas edince arkadaki kapağı (+Z / E tuşu) açıp dışarı çıkabilirsiniz!`
            : `🚀 POWERED DESCENT ACTIVE (Alt: +${descentOffset.toFixed(1)}m): Watch landing through cockpit windows! After touchdown, open rear hatch (+Z / E) to step outside!`;
        } else if (!this.cabinState.hatchOpen) {
          statusEl.innerText = isTr
            ? '🛬 İNİŞ TAMAMLANDI! Arkadaki Basınçlı Kapağa (+Z) yürüyün, kırmızı valfe tıklayın veya [E] tuşuna basarak kapağı açıp yüzeye çıkın!'
            : '🛬 TOUCHDOWN CONFIRMED! Walk to the rear Pressurized Hatch (+Z), click the red valve wheel, or press [E] to open the hatch and step outside!';
        } else {
          statusEl.innerText = isTr
            ? '🚪 KAPAK AÇILDI! Açık kapıdan (+Z) merdivene yürüyün veya [E] tuşuna basarak gezegen yüzeyine inin!'
            : '🚪 HATCH OPEN! Walk out through the open doorway (+Z) onto the ladder or press [E] to step onto the surface!';
        }
      } else if (ws.isOnLadder) {
        statusEl.innerText = isTr
          ? '🪜 EVA MERDİVENİ AKTİF (Yüzeye doğru yürüyün veya [E] tuşuna basarak doğrudan zemine inin)'
          : '🪜 ON EVA BOARDING LADDER (Walk down toward the surface or press [E] to step onto the ground)';
      } else {
        statusEl.innerText = isTr
          ? '🥽 1:1 ASTRONOT YÜZEY YÜRÜYÜŞÜ AKTİF (WASD: Yürü • SPACE: Sıçra • Merdivene Yürü / E: Kabine Gir • V: 1./3. Şahıs • F: Fener)'
          : '🥽 1:1 ASTRONAUT SURFACE WALK ACTIVE (WASD: Walk • SPACE: Jump • Walk to Ladder / E: Enter Cabin • V: View • F: Torch)';
      }
    }
    if (distEl) {
      if (ws.isInsideCabin) {
        distEl.innerText = isDescending
          ? (isTr ? `KONUM: 🚀 İNİŞ KOKPİTİ (İrtifa: +${descentOffset.toFixed(1)}m)` : `LOCATION: 🚀 DESCENT COCKPIT (Alt: +${descentOffset.toFixed(1)}m)`)
          : (isTr ? `KONUM: 🏠 ARACIN İÇ KABİNİ (+4.5m Güverte)` : `LOCATION: 🏠 INSIDE CABIN (+4.5m Deck)`);
      } else if (ws.isOnLadder) {
        distEl.innerText = isTr ? `KONUM: 🪜 EVA MERDİVENİ (+${(ws.y - groundY0).toFixed(1)}m)` : `LOCATION: 🪜 EVA LADDER (+${(ws.y - groundY0).toFixed(1)}m)`;
      } else {
        distEl.innerText = isTr ? `ARACA MESAFE: ${dist} m (1:1 Ölçek)` : `DISTANCE TO CRAFT: ${dist} m (1:1 Scale)`;
      }
    }
    if (gravEl) {
      const gravLabel = body === 'moon' ? '1.62 m/s² (0.16g)' : body === 'mars' ? '3.72 m/s² (0.38g)' : body === 'venus' ? '8.87 m/s² (92 bar)' : '1.35 m/s² (0.14g)';
      gravEl.innerText = isTr ? `YERÇEKİMİ: ${gravLabel} | GÖZ HİZASI: ${(ws.y + 1.75).toFixed(2)} m | AYAK İZİ: ${this.footprints.length}` : `GRAVITY: ${gravLabel} | EYE LEVEL: ${(ws.y + 1.75).toFixed(2)} m | FOOTPRINTS: ${this.footprints.length}`;
    }

    // Raycast against 3D cabin buttons, switches, DSKY keys & ladder hatch for live reticle prompt
    this.updateInteractiveReticle();
  }

  updateHUD(t) {
    const altEl = document.getElementById('hud-alt');
    const speedEl = document.getElementById('hud-speed');
    const phaseEl = document.getElementById('hud-phase');
    const thrustEl = document.getElementById('hud-thrust');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;

    const artifact = this.currentArtifact;
    if (!artifact) return;

    if (this.cameraMode === 'walk') {
      const descentOffset = this.getDescentOffset(t);
      if (t < 5.8) {
        if (altEl) altEl.innerText = `${descentOffset.toFixed(1)} m (Kokpit İnişi)`;
        if (speedEl) speedEl.innerText = `-${Math.max(1.2, descentOffset * 0.22).toFixed(1)} m/s`;
        if (thrustEl) thrustEl.innerText = `${this.cabinState ? this.cabinState.throttlePct : 75}% (İniş Roketi Aktif)`;
        if (phaseEl) {
          phaseEl.innerText = isTr
            ? "🚀 KOKPİT İÇİNDEN YÜZEYE İNİŞ SÜRÜYOR — Pencerelerden ve DSKY ekranından alçalmayı takip edin!"
            : "🚀 FIRST-PERSON COCKPIT DESCENT IN PROGRESS — Monitor altitude via windows and DSKY!";
        }
      } else {
        const dist = Math.hypot(this.walkState.x, this.walkState.z).toFixed(1);
        if (altEl) altEl.innerText = this.walkState.isInsideCabin ? "+4.5 m (Kabin İçi)" : "1.75 m (Astronot Göz Hizası)";
        if (speedEl) speedEl.innerText = this.walkState.isInsideCabin ? (this.cabinState.hatchOpen ? "KAPAK AÇIK (Çıkış Hazır)" : "KAPAK KAPALI (Açmak için E / Tıkla)") : `${dist} m (Araca Mesafe)`;
        if (thrustEl) thrustEl.innerText = this.walkViewMode === 'fp' ? "1. ŞAHIS (ELLER & VİZÖR)" : "3. ŞAHIS (TAM ASTRONOT)";
        if (phaseEl) {
          phaseEl.innerText = this.walkState.isInsideCabin
            ? (isTr
                ? "🛬 İNİŞ TAMAMLANDI: Arkadaki kapağa (+Z) yürüyün, kırmızı valfe tıklayın veya [E] tuşuyla kapağı açıp dışarı çıkın!"
                : "🛬 LANDED: Walk to the rear hatch (+Z), click the red valve wheel, or press [E] to open the hatch and exit!")
            : (isTr
                ? "🥽 1:1 ASTRONOT YÜZEY YÜRÜYÜŞÜ AKTİF (WASD: Yürü • SPACE: Sıçra • V: Kamera Değiştir • E: Kabin)"
                : "🥽 1:1 ASTRONAUT SURFACE WALK ACTIVE (WASD: Walk • SPACE: Jump • V: Switch View • E: Cabin)");
        }
      }
      return;
    }

    if (artifact.category === 'impact') {
      const speed = Math.max(0, 2580 - t * 40);
      const alt = Math.max(0, 9200 - t * 2875);
      if (altEl) altEl.innerText = `${Math.round(alt)} m`;
      if (speedEl) speedEl.innerText = `${Math.round(speed)} m/s (9,288 km/h)`;
      if (thrustEl) thrustEl.innerText = "0% (Balistik Serbest Düşüş)";
      if (phaseEl) {
        phaseEl.innerText = t < 3.2
          ? (isTr ? "KİNETİK YÖRÜNGEDEN ALÇALMA" : "ORBITAL KINETIC PLUNGE")
          : (isTr ? "💥 ÇARPIŞMA: SİSMİK ÇAN DALGASI AKTİF (ALSEP)" : "💥 IMPACT: SEISMIC RINGING ACTIVE (ALSEP)");
      }
    } else if (artifact.category === 'helicopter') {
      const alt = this.spacecraft ? this.spacecraft.position.y : 0;
      if (altEl) altEl.innerText = `${alt.toFixed(1)} m`;
      if (speedEl) speedEl.innerText = `${(t < 5 ? 3.5 : 0.8).toFixed(1)} m/s`;
      if (thrustEl) thrustEl.innerText = "2,400 RPM (Çift Ters Rotor)";
      if (phaseEl) {
        phaseEl.innerText = t < 1.5
          ? (isTr ? "ROTOR DÖNÜŞ BAŞLANGICI" : "ROTOR SPIN-UP")
          : t < 6.4
            ? (isTr ? "DİKİNE UÇUŞ & SEYİR" : "VERTICAL CLIMB & CRUISE")
            : (isTr ? "VALINOR TEPELERİ İNİŞİ" : "VALINOR HILLS TOUCHDOWN");
      }
    } else if (artifact.body === 'venus') {
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 3.2) : 0;
      if (altEl) altEl.innerText = `${(currentY * 1.5).toFixed(1)} m`;
      if (speedEl) speedEl.innerText = currentY > 0.1 ? `-7.8 m/s (Aerodinamik Disk Freni)` : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = "92 ATM CO₂ Atmosferik Frenleme (465°C)";
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5
          ? (isTr ? "YOĞUN VENÜS ATMOSFERİNDE ALÇALMA" : "VENUS SUPERCRITICAL ATMOSPHERE DESCENT")
          : (isTr ? "✅ VENÜS BAZALT YÜZEYİNE İNİŞ TAMAMLANDI!" : "✅ VENUS BASALT SURFACE TOUCHDOWN CONFIRMED!");
      }
    } else {
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 3.2) : 0;
      if (altEl) altEl.innerText = `${(currentY * 1.5).toFixed(1)} m`;
      if (speedEl) speedEl.innerText = currentY > 0.1 ? `-${Math.max(1.2, currentY * 0.15).toFixed(1)} m/s` : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = currentY > 0.1 ? "78% (DPS İniş Roketi)" : "0% (MOTOR SUSTURULDU)";
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5
          ? (isTr ? "FRENLEME & YUMUŞAK ALÇALMA" : "BRAKING & TERMINAL DESCENT")
          : (isTr ? "✅ TEMAS IŞIĞI YANDI: THE EAGLE HAS LANDED!" : "✅ TOUCHDOWN CONFIRMED: EAGLE HAS LANDED!");
      }
    }
  }
}

window.SpaceSimulation = new MissionSimulationTheater();
