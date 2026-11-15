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
      isInsideCabin: true,
      isOnLadder: false,
      isDrivingRover: false,
      keys: { w: false, a: false, s: false, d: false },
      isLooking: false,
      lastMouseX: 0,
      lastMouseY: 0,
      stepPhase: 0,
      lastStepCount: 0,
      breathPhase: 0,
      collectedSamples: 0,
      totalSamples: 8,
      lastActionMsg: ''
    };
    this.xrSession = null;
    this.vrCleanUI = false;
    this.xrButtonPrev = { left: [], right: [] };
    this.xrControllerPrevPos = [new THREE.Vector3(), new THREE.Vector3()];
    this.xrControllerPosInit = [false, false];
    this.vrTouchCooldown = 0;

    // Handheld XRF / Raman Archaeological Spectrometer
    this.isSpectrometerActive = false;
    this.isActivelyScanning = false;
    this.spectrometerGroup = null;
    this.spectrometerBeam = null;
    this.spectrometerContactRing = null;
    this.lastSpectrometerTarget = null;
    this.lastSpecChirpTime = 0;
  }

  setCleanVRGameMode(clean) {
    this.vrCleanUI = !!clean;
    if (!this.overlay) this.overlay = document.getElementById('simulation-modal');
    if (this.overlay) {
      this.overlay.classList.toggle('vr-game-clean-ui', this.vrCleanUI);
    }
    const cleanUiBtn = document.getElementById('btn-walk-clean-ui');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    if (cleanUiBtn) {
      cleanUiBtn.innerText = this.vrCleanUI
        ? (isTr ? '🎮 Arayüzü Göster / Normal Mod (H)' : '🎮 Show UI / Normal Mode (H)')
        : (isTr ? '🎮 Arayüzü Gizle / Oyun Modu (H)' : '🎮 Hide UI / Game Mode (H)');
    }
    this.updateVRGameMiniPill();
    setTimeout(() => this.onResize(), 30);
  }

  toggleCleanVRGameMode() {
    this.setCleanVRGameMode(!this.vrCleanUI);
    this.playSwitchClickSound(this.vrCleanUI ? 840 : 620);
  }

  updateVRGameMiniPill(customMsg = null) {
    const textEl = document.getElementById('vr-game-mission-text');
    if (!textEl) return;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const ws = this.walkState;
    if (customMsg) {
      ws.lastActionMsg = customMsg;
    }
    const loc = ws.isDrivingRover
      ? (isTr ? '🚙 LRV SÜRÜŞÜ' : '🚙 DRIVING LRV')
      : ws.isInsideCabin
        ? (isTr ? '🚀 KOKPİT İÇİ' : '🚀 IN COCKPIT')
        : ws.isOnLadder
          ? (isTr ? '🪜 MERDİVEN' : '🪜 ON LADDER')
          : (isTr ? '🧑🏼‍🚀 YÜZEY EVA' : '🧑🏼‍🚀 SURFACE EVA');
    const extra = ws.lastActionMsg ? ` • ${ws.lastActionMsg}` : '';
    textEl.innerText = isTr
      ? `🎮 VR OYUN MODU (${loc}) • Numune: ${ws.collectedSamples}/${ws.totalSamples}${extra}`
      : `🎮 VR GAME MODE (${loc}) • Samples: ${ws.collectedSamples}/${ws.totalSamples}${extra}`;
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
    this.renderer.toneMappingExposure = 1.18;
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
        if (this.currentArtifact && this.currentArtifact.vrAllowed === false) {
          this.triggerVRDisallowAlert();
          return;
        }
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

    const scannerToggleBtn = document.getElementById('btn-walk-scanner');
    if (scannerToggleBtn) {
      scannerToggleBtn.addEventListener('click', () => this.toggleSpectrometer());
    }

    const specTriggerBtn = document.getElementById('btn-spec-trigger');
    if (specTriggerBtn) {
      specTriggerBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startSpectrometerScan();
      });
      specTriggerBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.stopSpectrometerScan();
      });
      specTriggerBtn.addEventListener('pointerleave', () => this.stopSpectrometerScan());
    }

    const cabinToggleBtn = document.getElementById('btn-walk-cabin');
    if (cabinToggleBtn) {
      cabinToggleBtn.addEventListener('click', () => this.toggleCabinInterior());
    }

    const roverToggleBtn = document.getElementById('btn-walk-rover');
    if (roverToggleBtn) {
      roverToggleBtn.addEventListener('click', () => this.toggleRoverDrive());
    }

    const cleanUiBtn = document.getElementById('btn-walk-clean-ui');
    if (cleanUiBtn) {
      cleanUiBtn.addEventListener('click', () => this.toggleCleanVRGameMode());
    }

    const miniPill = document.getElementById('vr-game-mini-pill');
    if (miniPill) {
      miniPill.addEventListener('click', () => this.toggleCleanVRGameMode());
    }

    const xrBtn = document.getElementById('btn-sim-webxr');
    if (xrBtn) {
      xrBtn.addEventListener('click', () => {
        if (this.currentArtifact && this.currentArtifact.vrAllowed === false) {
          this.triggerVRDisallowAlert();
          return;
        }
        this.enterWebXR();
      });
    }

    // Big always-visible "Enter Meta Quest 3S VR" button (stays visible even in clean game UI mode)
    const questBtn = document.getElementById('btn-enter-quest-vr');
    if (questBtn) {
      questBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.currentArtifact && this.currentArtifact.vrAllowed === false) {
          this.triggerVRDisallowAlert();
          return;
        }
        this.enterWebXR();
      });
      questBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      questBtn.addEventListener('pointerup', (e) => e.stopPropagation());
    }
    this.updateQuestVRButton();

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
      if (code === 'KeyG') {
        this.toggleSpectrometer();
      }
      if (code === 'KeyR') {
        this.toggleRoverDrive();
      }
      if (code === 'KeyE') {
        // First check if looking at an interactive 3D object/sample/rover within reach; otherwise toggle cabin/hatch/rover!
        const hitObj = this.getHoveredInteractive(this.mouseNDC);
        if (hitObj && hitObj.userData && hitObj.userData.interactive && hitObj.userData.interactive.onClick) {
          hitObj.userData.interactive.onClick();
        } else if (this.walkState.isDrivingRover) {
          this.toggleRoverDrive();
        } else {
          this.toggleCabinInterior();
        }
      }
      if (code === 'KeyH' || code === 'Tab' || code === 'KeyM') {
        if (code === 'Tab') e.preventDefault();
        // When in Clean VR Game Mode, pressing H or TAB restores all normal UI buttons!
        this.toggleCleanVRGameMode();
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
        if (this.isSpectrometerActive) {
          this.startSpectrometerScan();
        }
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
        if (this.isSpectrometerActive) {
          this.stopSpectrometerScan();
        }
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
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
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

  triggerInnerAirlockDoor() {
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const statusEl = document.getElementById('walk-xr-status');
    const btn = document.getElementById('btn-walk-cabin');

    if (this.simTime < 5.5) {
      this.playSwitchClickSound(290);
      setTimeout(() => this.playSwitchClickSound(240), 110);
      if (statusEl) {
        statusEl.innerText = isTr
          ? `⚠️ HAVA KİLİDİ GÜVENLİĞİ: Roket inişte (+${this.getDescentOffset().toFixed(1)}m)! İniş tamamlanmadan kapılar açılamaz!`
          : `⚠️ AIRLOCK INTERLOCK: Rocket descending (+${this.getDescentOffset().toFixed(1)}m)! Wait for touchdown!`;
      }
      return false;
    }

    if (!this.cabinState) return false;

    // REAL NASA AIRLOCK INTERLOCK RULE: Outer Door #2 MUST be sealed before Inner Door #1 can open!
    if (this.cabinState.outerHatchOpen) {
      this.cabinState.outerHatchOpen = false;
      this.cabinState.hatchOpen = false;
      this.playSwitchClickSound(520);
    }

    this.cabinState.innerHatchOpen = true;
    this.cabinState.airlockPressurePsi = 4.8;
    this.walkState.handReachTimer = 0.95;
    this.playHatchPneumaticSound();
    this.refreshCabinDisplays();

    this.updateVRGameMiniPill(
      isTr
        ? '1. KAPI (İç Basınç Kapısı) Açıldı — Hava Kilidi Odasına Yürüyün!'
        : 'DOOR 1 (Inner Bulkhead) Open — Walk Into Airlock Chamber!'
    );

    if (btn) {
      btn.classList.add('active');
      btn.innerText = isTr ? '🚪 2. Dış Kapıyı Aç (E)' : '🚪 Open Outer Door #2 (E)';
    }
    return true;
  }

  triggerOuterAirlockDoor() {
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const statusEl = document.getElementById('walk-xr-status');
    const btn = document.getElementById('btn-walk-cabin');

    if (this.simTime < 5.5) {
      this.playSwitchClickSound(290);
      if (statusEl) {
        statusEl.innerText = isTr
          ? `⚠️ HAVA KİLİDİ GÜVENLİĞİ: Roket inişte (+${this.getDescentOffset().toFixed(1)}m)!`
          : `⚠️ AIRLOCK INTERLOCK: Rocket descending (+${this.getDescentOffset().toFixed(1)}m)!`;
      }
      return false;
    }

    if (!this.cabinState) return false;

    // REAL NASA AIRLOCK INTERLOCK RULE: Inner Door #1 MUST seal shut before Outer Door #2 opens to space vacuum!
    if (this.cabinState.innerHatchOpen) {
      this.cabinState.innerHatchOpen = false;
      this.playSwitchClickSound(480);
    }

    this.cabinState.outerHatchOpen = true;
    this.cabinState.hatchOpen = true;
    this.cabinState.airlockPressurePsi = 0.0;
    this.walkState.handReachTimer = 1.05;
    this.playHatchPneumaticSound();
    this.refreshCabinDisplays();

    this.updateVRGameMiniPill(
      isTr
        ? '1. İç Kapı Kilitlendi • Hava Kilidi Vakuma Dengelendi • 2. Dış Kapı Açıldı!'
        : 'Inner Door #1 Sealed • Airlock Depressurized • Outer Door #2 Open!'
    );

    if (btn) {
      btn.classList.add('active');
      btn.innerText = isTr ? '🚪 1. İç Kapıyı Aç / Kapat (E)' : '🚪 Toggle Airlock Doors (E)';
    }
    return true;
  }

  triggerOpenHatch() {
    if (!this.cabinState) return false;
    // Sequential 2-Door Airlock Logic (ONLY opens/closes doors — NEVER teleports the astronaut!):
    if (this.walkState.isInsideCabin && this.walkState.z < 1.65 && !this.cabinState.innerHatchOpen) {
      return this.triggerInnerAirlockDoor();
    }
    if (!this.cabinState.outerHatchOpen) {
      return this.triggerOuterAirlockDoor();
    }
    return this.triggerInnerAirlockDoor();
  }

  resolveCabinCollision(candX, candZ) {
    // 1. FRONT FLIGHT INSTRUMENT CONSOLE TABLE (consoleDesk front edge is at z = -1.50):
    // Keep a strict 0.52m body + outstretched-arm buffer so astronaut can NEVER enter or clip into the table!
    const minCabinZ = -0.98;
    let x = Math.max(-1.54, Math.min(1.50, candX));
    let z = Math.max(minCabinZ, candZ);

    // 2. CENTER CORE PEDESTAL (located at x = 0, z = +0.25 with mesh radius 0.38m):
    // Smooth radial sliding collision around radius 0.72m so astronaut glides around it without ever clipping or getting stuck
    const pedZ = 0.25;
    const pedRadius = 0.72;
    const dxPed = x;
    const dzPed = z - pedZ;
    const distPed = Math.hypot(dxPed, dzPed);
    if (distPed < pedRadius) {
      if (distPed > 0.0001) {
        x = (dxPed / distPed) * pedRadius;
        z = pedZ + (dzPed / distPed) * pedRadius;
      } else {
        z = pedZ - pedRadius;
      }
      z = Math.max(minCabinZ, z);
    }

    // 3. REAR STOWED EQUIPMENT LOCKERS & INNER AIRLOCK BULKHEAD WALL (Door #1 at z = 1.65):
    // IMPORTANT: Only allow walking through Door #1 or Door #2 once the 3D door leaves are physically >= 72% swung open!
    const innerDoorOpenEnough = this.cabinState && (this.cabinState.innerHatchProgress || 0) >= 0.72;
    const outerDoorOpenEnough = this.cabinState && (this.cabinState.outerHatchProgress || 0) >= 0.72;

    if (z > 1.42) {
      if (Math.abs(x) > 0.46) {
        // If already inside the Airlock Chamber (z >= 1.60), clamp x within the airlock tunnel walls (|x| <= 0.46)
        if (this.walkState.z >= 1.60) {
          x = Math.max(-0.46, Math.min(0.46, x));
        } else {
          // In main cabin outside the doorway width: block against the rear bulkhead wall at z = 1.42
          z = 1.42;
        }
      } else if (!innerDoorOpenEnough && this.walkState.z < 1.65) {
        // In front of closed/opening Inner Door #1 (door at z = 1.65): hold cleanly at z = 1.48 (17 cm from door)
        z = Math.min(1.48, z);
      }
    }

    // 4. INSIDE THE AIRLOCK CHAMBER (z in [1.65, 2.68]):
    if (this.walkState.z >= 1.65) {
      x = Math.max(-0.46, Math.min(0.46, x));
      if (!innerDoorOpenEnough) {
        // Inner Door #1 is closed behind the astronaut: hold at z >= 1.78 (13 cm from Door #1)
        z = Math.max(1.78, z);
      }
    }

    // 5. OUTER EVA AIRLOCK DOOR (#2 at z = 2.68):
    // When Door #2 is closed/opening (< 72%), hold cleanly at z = 2.54 (14 cm from Door #2)!
    const maxAirlockZ = outerDoorOpenEnough ? 2.86 : 2.54;
    z = Math.min(maxAirlockZ, z);

    return { x, z };
  }

  toggleCabinInterior() {
    if (this.cameraMode !== 'walk') {
      this.setCameraMode('walk');
      return;
    }
    const ws = this.walkState;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const btn = document.getElementById('btn-walk-cabin');

    // Pressing E or clicking the door button ONLY opens/closes the Airlock Doors — it NEVER teleports the astronaut!
    if (ws.isInsideCabin) {
      if (ws.z < 1.65) {
        // Inside Main Cabin: if Door #1 is closed, open Door #1; if Door #1 is already open, cycle to Door #2 (or close Door #1)
        if (!this.cabinState.innerHatchOpen) {
          this.triggerInnerAirlockDoor();
        } else {
          this.cabinState.innerHatchOpen = false;
          this.playSwitchClickSound(460);
          this.refreshCabinDisplays();
          this.updateVRGameMiniPill(isTr ? '1. İç Basınç Kapısı Kapatıldı' : 'Inner Door #1 Closed');
          if (btn) btn.innerText = isTr ? '🚪 1. İç Kapıyı Aç (E)' : '🚪 Open Inner Door #1 (E)';
        }
      } else {
        // Inside Airlock Chamber (between Door #1 and Door #2):
        // Toggle between opening Outer Door #2 (sealing Door #1) and opening Inner Door #1 (sealing Door #2)!
        if (!this.cabinState.outerHatchOpen) {
          this.triggerOuterAirlockDoor();
        } else {
          this.triggerInnerAirlockDoor();
        }
      }
    } else {
      // Outside on the EVA Porch, Boarding Ladder, or Planetary Surface:
      // Toggle Outer EVA Door #2 open/closed without teleporting!
      if (!this.cabinState.outerHatchOpen) {
        this.triggerOuterAirlockDoor();
      } else {
        this.cabinState.outerHatchOpen = false;
        this.cabinState.hatchOpen = false;
        this.playSwitchClickSound(460);
        this.refreshCabinDisplays();
        this.updateVRGameMiniPill(isTr ? '2. Dış EVA Kapısı Kapatıldı' : 'Outer EVA Door #2 Closed');
        if (btn) btn.innerText = isTr ? '🚪 2. Dış Kapıyı Aç (E)' : '🚪 Open Outer Door #2 (E)';
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
    const inXR = !!this.xrSession;
    if (this.fpRig) {
      this.fpRig.visible = isWalk && (this.walkViewMode === 'fp' || inXR);
    }
    // In the Quest headset the real tracked controllers carry the EVA gloves,
    // so hide the desktop head-locked arms (prevents duplicate floating hands).
    if (this.fpLeftArm) this.fpLeftArm.visible = !inXR;
    if (this.fpRightArm) this.fpRightArm.visible = !inXR;
    if (this.tpAstronaut) {
      this.tpAstronaut.visible = isWalk && this.walkViewMode === 'tp' && !inXR;
    }
  }

  triggerAstronautJump() {
    if (this.walkState.isGrounded && !this.walkState.isInsideCabin && !this.walkState.isDrivingRover) {
      const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
      const jumpVel = body === 'moon' ? 4.4 : body === 'outer' ? 4.6 : body === 'mars' ? 3.5 : 2.6;
      this.walkState.vy = jumpVel;
      this.walkState.isGrounded = false;
      this.spawnBootDust(this.walkState.x, this.walkState.z, 10);
    }
  }

  toggleRoverDrive() {
    if (this.walkState.isInsideCabin || this.walkState.isOnLadder) return;
    if (!this.lrvPropGroup) {
      if (this.currentArtifact && this.currentArtifact.vrAllowed !== false) {
        this.buildLunarRoverProp(this.walkState.x + 3.0, this.walkState.z + 1.0);
      } else {
        return;
      }
    }
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const ws = this.walkState;
    ws.isDrivingRover = !ws.isDrivingRover;
    this.playSwitchClickSound(ws.isDrivingRover ? 780 : 520);

    const rBtn = document.getElementById('btn-walk-rover');
    const overlay = document.getElementById('rover-dash-overlay');

    if (ws.isDrivingRover) {
      if (!this.roverState) {
        this.roverState = {
          speed: 0,
          heading: this.lrvPropGroup.rotation.y,
          steerAngle: 0,
          pitch: 0,
          roll: 0,
          wheelAngle: 0,
          odometer: 0,
          tBarPitch: 0,
          tBarRoll: 0
        };
      } else {
        this.roverState.speed = 0;
        this.roverState.steerAngle = 0;
        this.roverState.heading = this.lrvPropGroup.rotation.y;
      }
      ws.x = this.lrvPropGroup.position.x;
      ws.z = this.lrvPropGroup.position.z;
      ws.y = this.lrvPropGroup.position.y;
      ws.smoothYaw = this.roverState.heading;

      if (rBtn) {
        rBtn.classList.add('active');
        rBtn.innerText = isTr ? '🚗 LRV Araçtan İn (R)' : '🚗 Dismount Rover (R)';
      }
      if (overlay) overlay.classList.remove('hidden');
      this.updateVRGameMiniPill(isTr ? '🚙 LRV Ay Aracı Sürüş Modu Aktif (W/S: Gaz/Fren • A/D: Direksiyon)' : '🚙 LRV Moon Buggy Driving Active (W/S: Throttle • A/D: Steer)');
      this.updateRoverDashboardHUD(this.roverState);
    } else {
      if (window.SpaceAudio) window.SpaceAudio.setRoverMotorHum(false);
      const rYaw = this.roverState ? this.roverState.heading : this.lrvPropGroup.rotation.y;
      ws.x = this.lrvPropGroup.position.x - Math.cos(rYaw) * 1.55;
      ws.z = this.lrvPropGroup.position.z + Math.sin(rYaw) * 1.55;
      ws.y = this.getExactSurfaceHeight(ws.x, ws.z);

      if (rBtn) {
        rBtn.classList.remove('active');
        rBtn.innerText = isTr ? '🚙 Araca Bin / Sür (R)' : '🚙 Drive Rover (R)';
      }
      if (overlay) overlay.classList.add('hidden');
      this.updateVRGameMiniPill(isTr ? 'LRV Araçtan İnildi — Yüzey EVA Modu' : 'Dismounted LRV Rover — Surface EVA');
    }
  }

  updateRoverDashboardHUD(rState) {
    const overlay = document.getElementById('rover-dash-overlay');
    if (!overlay) return;
    if (!this.walkState.isDrivingRover) {
      if (!overlay.classList.contains('hidden')) overlay.classList.add('hidden');
      return;
    }
    if (overlay.classList.contains('hidden')) overlay.classList.remove('hidden');

    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const speedKmh = (Math.abs(rState.speed || 0) * 3.6).toFixed(1);
    const speedEl = document.getElementById('rover-dash-speed');
    if (speedEl) speedEl.innerText = `${speedKmh} km/h`;

    const pitchDeg = ((rState.pitch || 0) * 180 / Math.PI).toFixed(1);
    const rollDeg = ((rState.roll || 0) * 180 / Math.PI).toFixed(1);
    const inclineEl = document.getElementById('rover-dash-incline');
    if (inclineEl) {
      inclineEl.innerText = `${pitchDeg >= 0 ? '+' : ''}${pitchDeg}° / ${rollDeg >= 0 ? '+' : ''}${rollDeg}°`;
    }

    let deg = (((-rState.heading * 180 / Math.PI) % 360) + 360) % 360;
    let card = 'K';
    if (deg >= 337.5 || deg < 22.5) card = isTr ? 'K' : 'N';
    else if (deg < 67.5) card = isTr ? 'KD' : 'NE';
    else if (deg < 112.5) card = isTr ? 'D' : 'E';
    else if (deg < 157.5) card = isTr ? 'GD' : 'SE';
    else if (deg < 202.5) card = isTr ? 'G' : 'S';
    else if (deg < 247.5) card = isTr ? 'GB' : 'SW';
    else if (deg < 292.5) card = isTr ? 'B' : 'W';
    else card = isTr ? 'KB' : 'NW';

    const headingEl = document.getElementById('rover-dash-heading');
    if (headingEl) {
      headingEl.innerText = `${Math.round(deg).toString().padStart(3, '0')}° ${card}`;
    }

    const odoEl = document.getElementById('rover-dash-odo');
    if (odoEl) {
      const odoM = Math.round(rState.odometer || 0);
      odoEl.innerText = odoM >= 1000 ? `${(odoM / 1000).toFixed(2)} km` : `${odoM} m`;
    }

    const titleEl = document.getElementById('rover-dash-title');
    if (titleEl) {
      titleEl.innerText = isTr ? '🚙 APOLLO LRV AY ARACI TELEMETRİSİ' : '🚙 APOLLO LRV TELEMETRY';
    }
    const motorEl = document.getElementById('rover-motor-status');
    if (motorEl) {
      const isMoving = Math.abs(rState.speed || 0) > 0.05;
      motorEl.innerText = isMoving
        ? (isTr ? 'MOTOR: 4× 0.25 HP AKTİF (80:1 HARMONİK)' : 'MOTOR: 4× 0.25 HP ACTIVE (80:1 HARMONIC)')
        : (isTr ? 'MOTOR: 4× 0.25 HP BOŞTA' : 'MOTOR: 4× 0.25 HP IDLE');
    }
    const footerEl = document.getElementById('rover-dash-footer');
    if (footerEl) {
      footerEl.innerHTML = isTr
        ? '<span>KONTROL: [W]: Gaz • [S]: Fren/Geri • [A/D]: Direksiyon • [E / R]: Araçtan İn</span>'
        : '<span>CONTROLS: [W]: Throttle • [S]: Brake/Reverse • [A/D]: Steer • [E / R]: Dismount</span>';
    }
  }

  updateRoverDrivingPhysics(dt, isXR) {
    const ws = this.walkState;
    if (!this.roverState) {
      this.roverState = {
        speed: 0,
        heading: this.lrvPropGroup ? this.lrvPropGroup.rotation.y : -0.65,
        steerAngle: 0,
        pitch: 0,
        roll: 0,
        wheelAngle: 0,
        odometer: 0,
        tBarPitch: 0,
        tBarRoll: 0
      };
    }
    const rState = this.roverState;

    // 1. Inputs: Keyboard WASD or WebXR Left Thumbstick
    let throttle = 0;
    let steer = 0;

    if (ws.keys.w) throttle += 1.0;
    if (ws.keys.s) throttle -= 1.0;
    if (ws.keys.a) steer -= 1.0;
    if (ws.keys.d) steer += 1.0;

    if (isXR && this.xrSession && this.xrSession.inputSources) {
      for (const source of this.xrSession.inputSources) {
        const gp = source.gamepad;
        if (!gp || !gp.axes) continue;
        const axes = gp.axes;
        const axX = axes.length >= 4 ? (axes[2] || 0) : (axes[0] || 0);
        const axY = axes.length >= 4 ? (axes[3] || 0) : (axes[1] || 0);
        const deadzone = 0.15;
        if (source.handedness === 'left') {
          if (Math.abs(axY) > deadzone) throttle = -axY;
          if (Math.abs(axX) > deadzone) steer = axX;
        }
      }
    }

    // 2. Smooth Steering Angle (max ~26.5 deg = 0.46 rad)
    const maxSteerRad = 0.46;
    const targetSteer = steer * maxSteerRad;
    rState.steerAngle += (targetSteer - rState.steerAngle) * Math.min(1.0, dt * 7.5);

    // 3. Velocity Integration with NASA LRV 16 km/h max speed & authentic inertia
    const maxFwdSpeed = 4.5; // ~16.2 km/h
    const maxRevSpeed = 1.8; // ~6.5 km/h
    const accelRate = 3.2;   // m/s^2
    const brakeRate = 5.8;   // m/s^2
    const rollResistance = 1.4; // m/s^2

    if (throttle > 0.05) {
      if (rState.speed < -0.1) {
        rState.speed += brakeRate * dt;
      } else {
        const target = throttle * maxFwdSpeed;
        rState.speed += (target - rState.speed) * Math.min(1.0, dt * accelRate);
      }
    } else if (throttle < -0.05) {
      if (rState.speed > 0.1) {
        rState.speed = Math.max(0, rState.speed - brakeRate * dt);
      } else {
        const targetRev = throttle * maxRevSpeed;
        rState.speed += (targetRev - rState.speed) * Math.min(1.0, dt * accelRate);
      }
    } else {
      if (Math.abs(rState.speed) > 0.02) {
        const drag = Math.sign(rState.speed) * rollResistance * dt;
        if (Math.abs(drag) >= Math.abs(rState.speed)) {
          rState.speed = 0;
        } else {
          rState.speed -= drag;
        }
      } else {
        rState.speed = 0;
      }
    }

    // 4. Kinematics (Bicycle / Ackermann turning model)
    const wheelbase = 2.3;
    if (Math.abs(rState.speed) > 0.01 && Math.abs(rState.steerAngle) > 0.005) {
      const turnRate = (rState.speed / wheelbase) * Math.tan(rState.steerAngle);
      rState.heading += turnRate * dt;
    }
    while (rState.heading > Math.PI) rState.heading -= Math.PI * 2;
    while (rState.heading < -Math.PI) rState.heading += Math.PI * 2;

    const stepDist = rState.speed * dt;
    const fwdX = Math.sin(rState.heading);
    const fwdZ = Math.cos(rState.heading);
    const candX = ws.x + fwdX * stepDist;
    const candZ = ws.z + fwdZ * stepDist;
    const candDist = Math.hypot(candX, candZ);

    if (candDist > 4.5 && candDist < 135) {
      ws.x = candX;
      ws.z = candZ;
    } else if (candDist <= 4.5) {
      // Gentle bumper bounce off lunar module landing pads
      rState.speed = -rState.speed * 0.35;
      if (window.SpaceAudio) window.SpaceAudio.playRoverSuspensionBump(0.6);
    }
    rState.odometer += Math.abs(stepDist);

    // 5. 4-Corner Terrain Height Sampling for Conforming Pitch & Roll
    const cHead = Math.cos(rState.heading);
    const sHead = Math.sin(rState.heading);

    const calcCornerH = (lx, lz) => {
      const wx = ws.x + lx * cHead + lz * sHead;
      const wz = ws.z - lx * sHead + lz * cHead;
      return { x: wx, z: wz, y: this.getExactSurfaceHeight(wx, wz) };
    };

    const fl = calcCornerH(-0.95, 1.15);
    const fr = calcCornerH(0.95, 1.15);
    const rl = calcCornerH(-0.95, -1.15);
    const rr = calcCornerH(0.95, -1.15);

    const yFront = (fl.y + fr.y) * 0.5;
    const yRear = (rl.y + rr.y) * 0.5;
    const yLeft = (fl.y + rl.y) * 0.5;
    const yRight = (fr.y + rr.y) * 0.5;
    const yCenter = (yFront + yRear) * 0.5;

    const targetPitch = Math.atan2(yFront - yRear, 2.3);
    const targetRoll = Math.atan2(yRight - yLeft, 1.9);

    const prevPitch = rState.pitch;
    rState.pitch += (targetPitch - rState.pitch) * Math.min(1.0, dt * 8.5);
    rState.roll += (targetRoll - rState.roll) * Math.min(1.0, dt * 8.5);

    ws.y = yCenter + 0.38;
    ws.vy = 0;
    ws.isGrounded = true;

    // Suspension bump audio on crater rims and slopes
    const pitchDelta = Math.abs(rState.pitch - prevPitch) / Math.max(0.01, dt);
    if (pitchDelta > 1.2 && Math.abs(rState.speed) > 1.0 && window.SpaceAudio) {
      window.SpaceAudio.playRoverSuspensionBump(Math.min(1.0, pitchDelta * 0.35));
    }

    // 6. Update 3D LRV Prop Group Transform
    if (this.lrvPropGroup) {
      this.lrvPropGroup.position.set(ws.x, ws.y, ws.z);
      this.lrvPropGroup.rotation.order = 'YXZ';
      this.lrvPropGroup.rotation.set(rState.pitch, rState.heading, -rState.roll);
    }

    // 7. Update Wheel Spin and Steering Knuckles
    const wheelRadius = 0.32;
    rState.wheelAngle += stepDist / wheelRadius;
    if (this.lrvWheelNodes) {
      for (const w of this.lrvWheelNodes) {
        if (w.isFront) {
          w.knuckle.rotation.y = rState.steerAngle;
        } else {
          w.knuckle.rotation.y = -rState.steerAngle * 0.25;
        }
        w.spinGroup.rotation.x = rState.wheelAngle;
      }
    }

    // 8. Central T-Bar Joystick Tilt
    const targetTBarPitch = -throttle * 0.28;
    const targetTBarRoll = steer * 0.22;
    rState.tBarPitch += (targetTBarPitch - rState.tBarPitch) * Math.min(1.0, dt * 10.0);
    rState.tBarRoll += (targetTBarRoll - rState.tBarRoll) * Math.min(1.0, dt * 10.0);
    if (this.lrvTBar) {
      this.lrvTBar.rotation.x = rState.tBarPitch;
      this.lrvTBar.rotation.z = rState.tBarRoll;
    }

    // 9. Rear Wheel Lunar Dust Roostertails
    if (Math.abs(rState.speed) > 0.6 && Math.random() < 0.65) {
      this.spawnBootDust(rl.x, rl.z, 2);
      this.spawnBootDust(rr.x, rr.z, 2);
    }

    // 10. Traction Motor Audio & WebXR Haptics
    const speedRatio = Math.min(1.0, Math.abs(rState.speed) / maxFwdSpeed);
    if (window.SpaceAudio) {
      window.SpaceAudio.setRoverMotorHum(Math.abs(rState.speed) > 0.05, speedRatio);
    }
    if (isXR && Math.abs(rState.speed) > 0.1) {
      this.pulseXRHaptics(0.08 + speedRatio * 0.24, 25);
    }

    // 11. Live Telemetry Dashboard HUD
    this.updateRoverDashboardHUD(rState);

    // 12. Seating & Camera Orientation
    this.updateRoverCameras(dt, isXR);
  }

  updateRoverCameras(dt, isXR) {
    const ws = this.walkState;
    const rState = this.roverState;
    if (!rState) return;

    // Driver Seat local offset inside chassis:
    // x = -0.42, y = 0.95 (eye height from chassis center), z = -0.15
    const seatOffset = new THREE.Vector3(-0.42, 0.95, -0.15);
    seatOffset.applyEuler(new THREE.Euler(rState.pitch, rState.heading, -rState.roll, 'YXZ'));
    const driverEye = new THREE.Vector3(ws.x, ws.y, ws.z).add(seatOffset);

    if (isXR) {
      // WebXR 6-DoF Room-scale Headset anchoring
      const xrSeat = new THREE.Vector3(-0.42, 0.22, -0.15);
      xrSeat.applyEuler(new THREE.Euler(0, rState.heading, 0));
      this.cameraRig.position.set(ws.x + xrSeat.x, ws.y + xrSeat.y, ws.z + xrSeat.z);
      this.cameraRig.rotation.set(0, rState.heading, 0, 'YXZ');
    } else if (this.walkViewMode === 'tp') {
      // 3rd-Person Chase Camera Behind LRV
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      const camDist = 4.2;
      const camHeight = 1.95;
      const chaseOffset = new THREE.Vector3(
        -Math.sin(rState.heading) * camDist,
        camHeight,
        -Math.cos(rState.heading) * camDist
      );
      const camX = ws.x + chaseOffset.x;
      const camZ = ws.z + chaseOffset.z;
      const terrainCamY = this.getExactSurfaceHeight(camX, camZ) + 0.6;
      const camY = Math.max(terrainCamY, ws.y + chaseOffset.y);

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(ws.x, ws.y + 0.65, ws.z);

      // Animate 3rd-Person Astronaut Seated in Left Driver Seat
      if (this.tpAstronaut) {
        this.tpAstronaut.visible = true;
        const tpSeat = new THREE.Vector3(-0.42, 0.14, -0.15);
        tpSeat.applyEuler(new THREE.Euler(rState.pitch, rState.heading, -rState.roll, 'YXZ'));
        this.tpAstronaut.position.set(ws.x + tpSeat.x, ws.y + tpSeat.y, ws.z + tpSeat.z);
        this.tpAstronaut.rotation.order = 'YXZ';
        this.tpAstronaut.rotation.set(rState.pitch, rState.heading, -rState.roll);

        if (this.tpLimbs) {
          if (this.tpLimbs.leftLeg) this.tpLimbs.leftLeg.rotation.x = 1.45;
          if (this.tpLimbs.rightLeg) this.tpLimbs.rightLeg.rotation.x = 1.45;
          if (this.tpLimbs.leftShin) this.tpLimbs.leftShin.rotation.x = 1.45;
          if (this.tpLimbs.rightShin) this.tpLimbs.rightShin.rotation.x = 1.45;
          if (this.tpLimbs.leftArm) this.tpLimbs.leftArm.rotation.x = -0.65;
          if (this.tpLimbs.rightArm) this.tpLimbs.rightArm.rotation.x = -0.75;
          if (this.tpLimbs.leftForearm) this.tpLimbs.leftForearm.rotation.x = 0.85;
          if (this.tpLimbs.rightForearm) this.tpLimbs.rightForearm.rotation.x = 0.95;
        }
      }
    } else {
      // 1st-Person Astronaut Visor In-Cockpit Camera
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      this.camera.position.copy(driverEye);

      const effectivePitch = Math.max(-1.0, Math.min(1.0, ws.smoothPitch + rState.pitch * 0.75));
      const effectiveYaw = rState.heading + ws.smoothYaw;
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(effectivePitch, effectiveYaw, -rState.roll * 0.75);

      if (this.tpAstronaut) this.tpAstronaut.visible = false;

      // Animate 1st-Person Gloved Hands Gripping T-Bar & Armrest
      if (this.fpLeftArm && this.fpRightArm) {
        this.fpLeftArm.position.set(-0.32, -0.25, -0.45);
        this.fpLeftArm.rotation.set(0.65, 0.25, -0.15);

        this.fpRightArm.position.set(0.24 + rState.tBarRoll * 0.2, -0.22 + rState.tBarPitch * 0.15, -0.42);
        this.fpRightArm.rotation.set(0.75 + rState.tBarPitch * 0.5, -0.15, 0.18 + rState.tBarRoll * 0.4);
      }
    }
  }

  triggerVRDisallowAlert() {
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const art = this.currentArtifact;
    const title = isTr ? '⛔ VR MODU ENGELLENDİ (KAZA SAHASI)' : '⛔ VR MODE DISABLED (CRASH SITE)';
    const desc = art ? (isTr ? art.vrDisallowReason_tr : art.vrDisallowReason_en)
                     : (isTr ? 'Bu araç yüzeye yumuşak iniş yapamamış bir çarpışma/kaza enkazıdır. VR yüzey yürüyüşü engellenmiştir.'
                             : 'This craft is an impact/crash wreck with no soft landing. VR surface EVA is disabled.');
    if (window.app && window.app.showToast) {
      window.app.showToast(title, desc, 'error');
    }
    if (window.SpaceAudio) window.SpaceAudio.playTelemetryPing(220, 0.16);
    this.updateVRGameMiniPill(title);
  }

  setCameraMode(mode) {
    const isMobileDevice = (typeof window !== 'undefined') && (
      (window.innerWidth <= 768) || 
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
    if (isMobileDevice && mode === 'walk') {
      mode = 'cinematic';
    }
    if (mode === 'walk') {
      if (this.currentArtifact && this.currentArtifact.vrAllowed === false) {
        this.triggerVRDisallowAlert();
        this.cameraMode = 'cinematic';
        const camSelect = document.getElementById('sim-cam-select');
        if (camSelect) camSelect.value = 'cinematic';
        return;
      }
    }
    this.cameraMode = mode;
    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect && camSelect.value !== mode) camSelect.value = mode;

    const walkHud = document.getElementById('walk-hud-overlay');
    const walkBtn = document.getElementById('btn-sim-walk');
    const cabinBtn = document.getElementById('btn-walk-cabin');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    if (mode === 'walk') {
      // Automatically enter Clean Full-Screen VR Game Mode (surrounding buttons hidden; press H/TAB/ESC/Quest-X to restore)
      this.setCleanVRGameMode(true);

      // Start the rocket/lander descending from the sky with the astronaut INSIDE the pressurized cabin!
      if (this.simTime > 5.8 && !this.walkDescentPlayed) {
        this.simTime = 0;
        this.touchdownConfirmed = false;
      }
      this.walkDescentPlayed = true;

      const isApolloLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(this.currentArtifact ? this.currentArtifact.id : '');

      if (this.spacecraft) {
        this.spacecraft.visible = true;
      }
      this.camera.rotation.order = 'YXZ';
      this.walkState.keys = { w: false, a: false, s: false, d: false };
      this.walkState.isLooking = false;

      if (isApolloLM) {
        // Place the astronaut INSIDE the descending Apollo LM cockpit facing the front windows & DSKY computer!
        this.walkState.isInsideCabin = true;
        this.walkState.isOnLadder = false;
        this.walkState.isDrivingRover = false;
        this.walkState.x = -0.52;
        this.walkState.z = -0.78;
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
          this.cabinState.innerHatchOpen = false;
          this.cabinState.innerHatchProgress = 0.0;
          this.cabinState.outerHatchOpen = false;
          this.cabinState.outerHatchProgress = 0.0;
          this.cabinState.airlockPressurePsi = 4.8;
          this.cabinState.prog = '64';
          this.cabinState.throttlePct = 82;
          this.refreshCabinDisplays();
        }

        if (cabinBtn) {
          cabinBtn.style.display = 'inline-flex';
          cabinBtn.classList.add('active');
          cabinBtn.innerText = isTr
            ? '🚪 Çift Kapılı Hava Kilidini Aç & Çık (E)'
            : '🚪 Open Dual-Door Airlock & Exit (E)';
        }
        this.updateVRGameMiniPill(isTr ? 'Roket İnişte — İniş Sonrası Kapıyı Açın!' : 'Rocket Descending — Open Hatch After Touchdown!');
      } else {
        // FOR ALL UNMANNED SITES (Apollo 13 S-IVB, Rovers, Landers, Probes):
        // Astronaut stands directly on foot on the planetary surface inspecting the spacecraft!
        this.walkState.isInsideCabin = false;
        this.walkState.isOnLadder = false;
        this.walkState.isDrivingRover = false;
        this.walkState.x = 0;
        this.walkState.z = 8.5;
        this.walkState.y = this.getTerrainHeight(0, 8.5);
        this.walkState.vy = 0;
        this.walkState.isGrounded = true;
        this.walkState.yaw = 0;
        this.walkState.pitch = 0;
        this.walkState.smoothYaw = 0;
        this.walkState.smoothPitch = 0;
        this.walkState.moveBlend = 0;
        this.walkState.handReachTimer = 0;

        if (cabinBtn) {
          cabinBtn.style.display = 'none';
        }
        this.updateVRGameMiniPill(isTr ? '1:1 Yüzey Yürüyüşü Aktif' : '1:1 Surface Walk Active');
      }

      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = true;
      if (walkHud) walkHud.classList.remove('hidden');
      this.updateSimulationLanguage();
      this.updateQuestVRButton();
      if (walkBtn) walkBtn.classList.add('active');
      if (this.controls) this.controls.enabled = false;
    } else {
      this.setCleanVRGameMode(false);
      this.camera.rotation.order = 'XYZ';
      this.camera.rotation.z = 0;
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      this.walkState.keys = { w: false, a: false, s: false, d: false };
      this.walkState.isLooking = false;
      this.walkState.isInsideCabin = false;
      this.walkState.isOnLadder = false;
      this.walkState.isDrivingRover = false;
      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = false;
      if (walkHud) walkHud.classList.add('hidden');
      const specCard = document.getElementById('spectrometer-card');
      if (specCard) specCard.classList.add('hidden');
      if (this.isSpectrometerActive) {
        this.isSpectrometerActive = false;
        const btn = document.getElementById('btn-walk-scanner');
        if (btn) btn.classList.remove('active');
        if (window.SpaceAudio) window.SpaceAudio.setSpectrometerBeamHum(false);
      }
      if (this.spectrometerContactRing) this.spectrometerContactRing.visible = false;
      if (this.spectrometerBeam) this.spectrometerBeam.material.opacity = 0.0;
      if (walkBtn) walkBtn.classList.remove('active');
      if (this.controls) {
        this.controls.enabled = (mode === 'free');
        if (this.spacecraft) this.controls.target.copy(this.spacecraft.position);
      }
    }
    this.updateAstronautVisibility();
  }

  // ===========================================================================
  // META QUEST 3S / WEBXR IMMERSIVE SESSION ENTRY
  // requestSession() is called IMMEDIATELY inside the click handler (no awaits before it),
  // so the Quest Browser never drops the user-activation gesture.
  // ===========================================================================
  async enterWebXR() {
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const statusEl = document.getElementById('walk-xr-status');
    if (this.xrSession) return;

    if (!navigator.xr) {
      if (this.cameraMode !== 'walk') this.setCameraMode('walk');
      if (statusEl) {
        statusEl.innerText = isTr
          ? '⚠️ Bu tarayıcı WebXR desteklemiyor. Meta Quest 3S içindeki Meta Quest Browser ile HTTPS üzerinden açın. (Masaüstü: WASD + Mouse)'
          : '⚠️ WebXR not available. Open this page in Meta Quest Browser over HTTPS. (Desktop: WASD + Mouse)';
      }
      this.updateVRGameMiniPill(isTr ? 'WebXR yok — Quest Browser + HTTPS gerekli' : 'No WebXR — needs Quest Browser + HTTPS');
      return;
    }

    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };
    let session = null;
    let sessionMode = 'immersive-vr';
    try {
      session = await navigator.xr.requestSession('immersive-vr', sessionInit);
    } catch (errVR) {
      console.warn('immersive-vr failed, trying immersive-ar:', errVR);
      try {
        session = await navigator.xr.requestSession('immersive-ar', sessionInit);
        sessionMode = 'immersive-ar';
      } catch (errAR) {
        console.warn('WebXR session could not start:', errAR);
      }
    }

    if (!session) {
      if (this.cameraMode !== 'walk') this.setCameraMode('walk');
      if (statusEl) {
        statusEl.innerText = isTr
          ? '⚠️ VR oturumu başlatılamadı. Sayfanın HTTPS olduğundan ve Quest Browser izinlerinin açık olduğundan emin olun.'
          : '⚠️ VR session could not start. Make sure the page is HTTPS and Quest Browser permissions are allowed.';
      }
      return;
    }

    // Enter walk mode (astronaut starts inside the descending cabin) + clean game UI
    if (this.cameraMode !== 'walk') this.setCameraMode('walk');
    this.setCleanVRGameMode(true);

    this.xrSession = session;
    this.xrHeadPrev = null;
    this.xrSnap = { armed: true };
    this.xrButtonPrev = { left: [], right: [] };
    this.xrControllerPosInit = [false, false];
    this.vrTouchLast = [null, null];
    this.xrLocalRefFallback = false;

    // Meta Quest 3S / Quest 3 performance: native framebuffer scale + fixed foveated rendering + 90Hz refresh rate
    try { if (this.renderer.xr.setFramebufferScaleFactor) this.renderer.xr.setFramebufferScaleFactor(1.0); } catch (_) {}

    try {
      this.renderer.xr.setReferenceSpaceType('local-floor');
      await this.renderer.xr.setSession(session);
    } catch (refErr) {
      console.warn('local-floor unavailable, falling back to local:', refErr);
      this.xrLocalRefFallback = true;
      this.renderer.xr.setReferenceSpaceType('local');
      await this.renderer.xr.setSession(session);
    }
    try { if (this.renderer.xr.setFoveation) this.renderer.xr.setFoveation(1.0); } catch (_) {}

    // Target locked 90Hz / 72Hz framerate in Meta Quest Browser
    try {
      if (session.supportedFrameRates && session.updateTargetFrameRate) {
        const rates = session.supportedFrameRates;
        if (rates.includes(90)) await session.updateTargetFrameRate(90);
        else if (rates.includes(72)) await session.updateTargetFrameRate(72);
      }
    } catch (_) {}

    this.updateAstronautVisibility();
    this.updateQuestVRButton();
    this.attachToolsToXRControllers();
    this.showVRHelpPanel(true);
    this.pulseXRHaptics(0.6, 80);

    if (statusEl) {
      statusEl.innerText = isTr
        ? `🥽 META QUEST 3S ${sessionMode === 'immersive-ar' ? 'MR' : 'VR'} AKTİF • Sol Çubuk: Yürü • Sağ Çubuk: 30° Dön • Tetik: Lazer Tara/Işınlan • A: Zıpla • B: LRV/Kapı • X: Spektrometre & Tablet • Y: Yardım`
        : `🥽 META QUEST 3S ${sessionMode === 'immersive-ar' ? 'MR' : 'VR'} ACTIVE • L-Stick: Walk • R-Stick: 30° Turn • Trigger: Laser Scan/Teleport • A: Jump • B: LRV/Door • X: Spectrometer & Tablet • Y: Help`;
    }
    this.updateVRGameMiniPill(isTr ? 'Meta Quest 3S VR Oturumu Başladı' : 'Meta Quest 3S VR Session Started');

    session.addEventListener('end', () => {
      this.xrSession = null;
      this.xrHeadPrev = null;
      if (this.cameraRig) {
        this.cameraRig.position.set(0, 0, 0);
        this.cameraRig.rotation.set(0, 0, 0);
      }
      if (this.vrHelpPanel) this.vrHelpPanel.visible = false;
      this.reattachToolsToFPArms();
      this.updateAstronautVisibility();
      this.updateQuestVRButton();
      setTimeout(() => this.onResize(), 60);
    });
  }

  async updateQuestVRButton() {
    const btn = document.getElementById('btn-enter-quest-vr');
    if (!btn) return;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    if (this.xrSession) {
      btn.classList.add('hidden');
      return;
    }
    btn.classList.remove('hidden');
    let supported = false;
    try {
      supported = !!(navigator.xr && (await navigator.xr.isSessionSupported('immersive-vr')));
    } catch (_) {}
    btn.classList.toggle('xr-unsupported', !supported);
    btn.innerHTML = supported
      ? (isTr ? '🥽 META QUEST 3S — VR\'A GİR' : '🥽 META QUEST 3S — ENTER VR')
      : (isTr ? '🥽 VR\'A GİR (Quest Browser + HTTPS gerekli)' : '🥽 ENTER VR (needs Quest Browser + HTTPS)');
  }

  // In-world floating controls help board for Meta Quest 3S (toggle with Y)
  updateVRHelpPanelContent() {
    if (!this.vrHelpCanvas) {
      this.vrHelpCanvas = document.createElement('canvas');
      this.vrHelpCanvas.width = 1024;
      this.vrHelpCanvas.height = 700;
    }
    const canvas = this.vrHelpCanvas;
    const ctx = canvas.getContext('2d');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    ctx.fillStyle = 'rgba(4, 11, 24, 0.94)';
    ctx.fillRect(0, 0, 1024, 700);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 1012, 688);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 38px monospace';
    ctx.fillText(isTr ? '🎮 META QUEST 3S KONTROLLERİ' : '🎮 META QUEST 3S CONTROLS', 40, 64);
    const rows = isTr ? [
      ['SOL ÇUBUK', 'Bakış yönüne yürü (analog hız)'],
      ['SOL ÇUBUK BAS', 'Koş (basılı tut)'],
      ['SAĞ ÇUBUK ◀ ▶', '30° adım dönüş (mide bulantısız)'],
      ['SAĞ ÇUBUK BAS', 'EVA feneri aç / kapat'],
      ['TETİK (TRIGGER)', 'Lazerle tara • Buton/kapı • Zemine ışınlan'],
      ['GRIP + KOL SALLA', 'Kollarınla yürü (gerçek yürüyüş hissi)'],
      ['GERÇEK YÜRÜME', 'Odada yürü — çarpışmalı oda ölçeği'],
      ['ELLE DOKUN', 'Butona eldiveninle fiziksel dokun'],
      ['A', 'Zıpla (kabin içinde: kapıyı aç/kapat)'],
      ['B', 'LRV Ay aracına bin/in • Kabin kapısı'],
      ['X', '🔬 XRF Lazer Spektrometresi ve Bilim Tableti'],
      ['Y', 'Bu yardım panelini aç / kapat']
    ] : [
      ['LEFT STICK', 'Walk toward gaze (analog speed)'],
      ['LEFT STICK CLICK', 'Sprint (hold)'],
      ['RIGHT STICK ◀ ▶', '30° snap turn (comfort)'],
      ['RIGHT STICK CLICK', 'Toggle EVA torch'],
      ['TRIGGER', 'Fire laser scan • Buttons/doors • Teleport'],
      ['GRIP + SWING ARMS', 'Arm-swing locomotion'],
      ['REAL WALKING', 'Room-scale walking with collision'],
      ['HAND TOUCH', 'Physically press buttons with glove'],
      ['A', 'Jump (in cabin: open/close door)'],
      ['B', 'Mount/dismount LRV • Cabin door'],
      ['X', '🔬 XRF Laser Spectrometer & Science Tablet'],
      ['Y', 'Show / hide this help board']
    ];
    rows.forEach((r, i) => {
      const y = 112 + i * 38;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(r[0], 40, y);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '24px monospace';
      ctx.fillText(r[1], 400, y);
    });

    // Bottom Red Exit Bar
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(36, 592, 952, 74);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 592, 952, 74);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(
      isTr
        ? '🚪 [TETİKLE TIKLA VEYA DOKUN] VR MODUNDAN ÇIK & ANA EKRANA DÖN'
        : '🚪 [CLICK TRIGGER OR TOUCH] EXIT VR & RETURN TO MAIN VIEW',
      52,
      640
    );

    if (this.vrHelpTexture) {
      this.vrHelpTexture.needsUpdate = true;
    }
  }

  showVRHelpPanel(visible) {
    this.updateVRHelpPanelContent();
    if (!this.vrHelpPanel) {
      this.vrHelpTexture = new THREE.CanvasTexture(this.vrHelpCanvas);
      this.vrHelpPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 0.78),
        new THREE.MeshBasicMaterial({ map: this.vrHelpTexture, transparent: true, side: THREE.DoubleSide, depthTest: false })
      );
      this.vrHelpPanel.renderOrder = 999;
      this.vrHelpPanel.visible = false;

      // Make the Help Panel interactable so pointing at it and clicking triggers exit!
      this.vrHelpPanel.userData.interactive = {
        label_tr: '🚪 [SOL TIK / VR TETİK] VR VE SİMÜLASYONDAN ÇIK & ANA EKRANA DÖN',
        label_en: '🚪 [CLICK / VR TRIGGER] EXIT VR & RETURN TO MAIN VIEW',
        onClick: () => {
          this.pulseXRHaptics(0.85, 60);
          this.stopSimulation();
        }
      };
      if (this.interactables && !this.interactables.includes(this.vrHelpPanel)) {
        this.interactables.push(this.vrHelpPanel);
      }
    }
    if (this.cameraRig && this.vrHelpPanel.parent !== this.cameraRig) {
      this.cameraRig.add(this.vrHelpPanel);
    }
    this.vrHelpPanel.visible = !!visible;
    // Place it in front of the user's gaze on the next XR frame (head pose is fresh then)
    this.vrHelpNeedsPlace = !!visible;
  }

  placeVRHelpPanel() {
    if (!this.vrHelpPanel || !this.camera) return;
    const hp = this.camera.position;
    const e = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
    const yaw = e.y;
    this.vrHelpPanel.position.set(hp.x - Math.sin(yaw) * 1.25, Math.max(0.9, hp.y - 0.12), hp.z - Math.cos(yaw) * 1.25);
    this.vrHelpPanel.rotation.set(0, yaw, 0);
  }

  getXRController(hand) {
    if (!this.xrControllers) return null;
    const found = this.xrControllers.find((c) => c && c.userData && c.userData.handedness === hand);
    if (found) return found;
    return hand === 'left' ? this.xrControllers[0] : this.xrControllers[1];
  }

  handleQuestFaceButton(button) {
    const ws = this.walkState;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    if (button === 'A') {
      this.pulseXRHaptics(0.55, 40, 'right');
      if (ws.isInsideCabin || ws.isOnLadder) {
        this.toggleCabinInterior();
      } else {
        this.triggerAstronautJump();
      }
    } else if (button === 'B') {
      this.pulseXRHaptics(0.65, 45, 'right');
      if (ws.isDrivingRover) {
        this.toggleRoverDrive();
      } else if (!ws.isInsideCabin && !ws.isOnLadder && this.lrvPropGroup &&
                 Math.hypot(ws.x - this.lrvPropGroup.position.x, ws.z - this.lrvPropGroup.position.z) < 4.2) {
        this.toggleRoverDrive();
      } else {
        this.toggleCabinInterior();
      }
    } else if (button === 'X') {
      this.pulseXRHaptics(0.65, 45, 'left');
      this.toggleSpectrometer();
    } else if (button === 'Y') {
      this.pulseXRHaptics(0.45, 30, 'left');
      this.showVRHelpPanel(!(this.vrHelpPanel && this.vrHelpPanel.visible));
    }
  }

  startSurfaceWalk(artifact) {
    const isMobileDevice = (typeof window !== 'undefined') && (
      (window.innerWidth <= 768) || 
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
    if (isMobileDevice) {
      // Mobile fallback: Never enter VR mode on mobile; launch standard 3D simulation
      this.cameraMode = 'cinematic';
      this.startSimulation(artifact);
      return;
    }
    if (artifact && artifact.vrAllowed === false) {
      this.currentArtifact = artifact;
      this.triggerVRDisallowAlert();
      this.cameraMode = 'cinematic';
      this.startSimulation(artifact);
      return;
    }
    this.cameraMode = 'walk';
    this.startSimulation(artifact);
    this.setCameraMode('walk');
  }

  getTerrainHeight(vx, vz) {
    const d = Math.sqrt(vx * vx + vz * vz);
    // Multi-frequency planetary topography (macro hills + meso undulations + micro regolith hummocks)
    let y = Math.sin(vx * 0.048) * Math.cos(vz * 0.048) * 1.95;
    y += Math.sin(vx * 0.125 + 1.1) * Math.cos(vz * 0.115) * 0.68;
    y += Math.sin(vx * 0.28 - 0.7) * Math.sin(vz * 0.26 + 0.4) * 0.22;
    y += Math.cos((vx + vz) * 0.52) * 0.07;

    if (d < 22) {
      // Flat landing pad zone around spacecraft so landing pads & ladder rest cleanly at y = 0
      const blend = Math.max(0, (d - 10.5) / 11.5);
      y *= blend * blend;
    } else if (d < 44) {
      const rim = 1 - Math.abs((d - 33) / 11);
      if (rim > 0) y += rim * 1.65;
    }

    // Sculpted 3D Walkable Impact Craters (bowl depression + raised ejecta rim)
    const craters = [
      { cx: -19.0, cz: -16.0, r: 6.8, depth: 1.45 },
      { cx:  22.0, cz:  18.0, r: 8.2, depth: 1.75 },
      { cx: -24.0, cz:  22.0, r: 7.4, depth: 1.55 },
      { cx:  26.0, cz: -23.0, r: 9.0, depth: 1.90 },
      { cx:   0.0, cz: -28.0, r: 7.8, depth: 1.65 },
      { cx:  34.0, cz:   2.0, r: 6.2, depth: 1.30 },
      { cx: -32.0, cz:  -2.0, r: 8.5, depth: 1.70 }
    ];
    for (let i = 0; i < craters.length; i++) {
      const c = craters[i];
      const cd = Math.hypot(vx - c.cx, vz - c.cz);
      if (cd < c.r * 1.45) {
        const u = cd / c.r;
        if (u < 1.0) {
          // Parabolic crater bowl
          y -= c.depth * (1.0 - u * u);
          // Inner rim uplift near u = 0.85..1.0
          if (u > 0.72) {
            const rimU = (u - 0.72) / 0.28;
            y += c.depth * 0.32 * Math.sin(rimU * Math.PI * 0.5);
          }
        } else {
          // Outer raised ejecta ramp (u = 1.0..1.45)
          const ejectaU = 1.0 - (u - 1.0) / 0.45;
          y += c.depth * 0.32 * ejectaU * ejectaU;
        }
      }
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

    // Check VR / Walk permission for this artifact
    const walkOpt = document.querySelector('#sim-cam-select option[value="walk"]');
    const walkBtn = document.getElementById('btn-sim-walk');
    const xrBtn = document.getElementById('btn-sim-webxr');
    const questBtn = document.getElementById('btn-enter-quest-vr');

    if (artifact.vrAllowed === false) {
      if (this.cameraMode === 'walk') {
        this.cameraMode = 'cinematic';
      }
      if (walkOpt) {
        walkOpt.disabled = true;
        walkOpt.style.display = 'none';
      }
      if (walkBtn) {
        walkBtn.style.display = 'none';
        walkBtn.disabled = true;
      }
      if (xrBtn) {
        xrBtn.style.display = 'none';
        xrBtn.disabled = true;
      }
      if (questBtn) {
        questBtn.style.display = 'none';
      }
    } else {
      if (walkOpt) {
        walkOpt.disabled = false;
        walkOpt.style.display = '';
      }
      if (walkBtn) {
        walkBtn.style.display = '';
        walkBtn.disabled = false;
      }
      if (xrBtn) {
        xrBtn.style.display = '';
        xrBtn.disabled = false;
      }
      if (questBtn) {
        questBtn.style.display = '';
      }
    }

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) camSelect.value = this.cameraMode;

    this.overlay.classList.add('open');

    this.onResize();
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 60);

    const titleEl = document.getElementById('sim-title');
    const badgeEl = document.getElementById('sim-badge');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    const isMobileDevice = (typeof window !== 'undefined') && (
      (window.innerWidth <= 768) || 
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    if (titleEl) titleEl.innerText = isTr ? artifact.name_tr : artifact.name_en;
    if (badgeEl) {
      if (isMobileDevice) {
        if (artifact.vrAllowed === false) {
          badgeEl.innerText = isTr ? "💥 KİNETİK ÇARPIŞMA CANLANDIRMASI" : "💥 KINETIC IMPACT REENACTMENT";
          badgeEl.style.borderColor = "#ef4444";
          badgeEl.style.color = "#f87171";
        } else if (artifact.category === 'helicopter') {
          badgeEl.innerText = isTr ? "🚁 OTONOM MARS HELİKOPTERİ UÇUŞU" : "🚁 AUTONOMOUS MARS ROTORCRAFT";
          badgeEl.style.borderColor = "#00f0ff";
          badgeEl.style.color = "#00f0ff";
        } else if (artifact.body === 'venus') {
          badgeEl.innerText = isTr ? "🔥 VENÜS 92 ATM BASINÇLI İNİŞ" : "🔥 VENUS 92 ATM PRESSURE DESCENT";
          badgeEl.style.borderColor = "#f59e0b";
          badgeEl.style.color = "#fcd34d";
        } else if (artifact.body === 'outer') {
          badgeEl.innerText = isTr ? "🪐 DIŞ GÜNEŞ SİSTEMİ İNİŞİ" : "🪐 OUTER SOLAR SYSTEM TOUCHDOWN";
          badgeEl.style.borderColor = "#38bdf8";
          badgeEl.style.color = "#7dd3fc";
        } else {
          badgeEl.innerText = isTr ? "🛰️ BAŞARILI YUMUŞAK İNİŞ SİMÜLASYONU" : "🛰️ SOFT LANDING 3D REENACTMENT";
          badgeEl.style.borderColor = "#10b981";
          badgeEl.style.color = "#34d399";
        }
      } else if (artifact.vrAllowed === false) {
        if (artifact.category === 'impact') {
          badgeEl.innerText = isTr ? "💥 KİNETİK ÇARPIŞMA CANLANDIRMASI (VR KAPALI)" : "💥 KINETIC IMPACT REENACTMENT (VR DISABLED)";
        } else if (artifact.id === 'curiosity-skycrane') {
          badgeEl.innerText = isTr ? "💥 SKY CRANE ROKET KAZASI (VR KAPALI)" : "💥 SKY CRANE ROCKET IMPACT SCAR (VR DISABLED)";
        } else if (artifact.id === 'perseverance-backshell-chute') {
          badgeEl.innerText = isTr ? "💥 PARAŞÜT & GÖVDE ÇARPIŞMA ENKAZI (VR KAPALI)" : "💥 BACKSHELL & CHUTE IMPACT DEBRIS (VR DISABLED)";
        } else if (artifact.id === 'galileo-probe') {
          badgeEl.innerText = isTr ? "🔥 JÜPİTER ATMOSFERİK İMHA (KATI YÜZEY YOK - VR KAPALI)" : "🔥 JUPITER ATMOSPHERIC ENTRY (NO SURFACE - VR DISABLED)";
        } else {
          badgeEl.innerText = isTr ? "💥 KAZA / ÇARPIŞMA SAHASI (VR KAPALI)" : "💥 CRASH / IMPACT REENACTMENT (VR DISABLED)";
        }
        badgeEl.style.borderColor = "#ef4444";
        badgeEl.style.color = "#f87171";
      } else if (artifact.category === 'helicopter') {
        badgeEl.innerText = isTr ? "🚁 OTONOM MARS HELİKOPTERİ UÇUŞU & VR AKTİF" : "🚁 AUTONOMOUS MARS ROTORCRAFT & VR ACTIVE";
        badgeEl.style.borderColor = "#00f0ff";
        badgeEl.style.color = "#00f0ff";
      } else if (artifact.body === 'venus') {
        badgeEl.innerText = isTr ? "🔥 VENÜS 92 ATM BASINÇLI İNİŞ & VR AKTİF" : "🔥 VENUS 92 ATM PRESSURE DESCENT & VR ACTIVE";
        badgeEl.style.borderColor = "#f59e0b";
        badgeEl.style.color = "#fcd34d";
      } else if (artifact.body === 'outer') {
        badgeEl.innerText = isTr ? "🪐 DIŞ GÜNEŞ SİSTEMİ İNİŞ & VR AKTİF" : "🪐 OUTER SOLAR SYSTEM TOUCHDOWN & VR ACTIVE";
        badgeEl.style.borderColor = "#38bdf8";
        badgeEl.style.color = "#7dd3fc";
      } else {
        badgeEl.innerText = isTr ? "🛰️ BAŞARILI YUMUŞAK İNİŞ & 1:1 VR YÜRÜYÜŞ" : "🛰️ SUCCESSFUL SOFT LANDING & 1:1 VR EVA";
        badgeEl.style.borderColor = "#10b981";
        badgeEl.style.color = "#34d399";
      }
    }

    if (isMobileDevice) {
      if (this.cameraMode === 'walk') this.cameraMode = 'cinematic';
      const walkOpt = document.querySelector('#sim-cam-select option[value="walk"]');
      if (walkOpt) {
        walkOpt.style.display = 'none';
        walkOpt.disabled = true;
      }
      const walkBtn = document.getElementById('btn-sim-walk');
      if (walkBtn) walkBtn.style.display = 'none';
      const xrBtn = document.getElementById('btn-sim-webxr');
      if (xrBtn) xrBtn.style.display = 'none';
      const questBtn = document.getElementById('btn-enter-quest-vr');
      if (questBtn) questBtn.style.display = 'none';
      const walkOverlay = document.getElementById('walk-hud-overlay');
      if (walkOverlay) walkOverlay.classList.add('hidden');
    }

    if (window.SpaceAudio) {
      window.SpaceAudio.playRadioTransmission(artifact.audioSnippet || artifact.quote_en || "");
    }

    this.buildSimulationScene(artifact);
    if (typeof this.currentDegradationFactor === 'number') {
      this.applyDegradation(this.currentDegradationFactor, artifact);
    }
    this.setCameraMode(this.cameraMode);

    this.lastTime = performance.now();
    // Use setAnimationLoop so both standard desktop browsers and WebXR headsets render seamlessly
    this.renderer.setAnimationLoop(() => this.renderFrame());
  }

  applyDegradation(factor, artifact = null) {
    factor = Math.max(0, Math.min(1, typeof factor === 'number' ? factor : 0.75));
    this.currentDegradationFactor = factor;
    if (!this.spacecraft) return;

    const targetArt = artifact || this.currentArtifact;
    const body = (targetArt && targetArt.body) ? targetArt.body.toLowerCase() : (this.currentBody || 'moon');

    this.spacecraft.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (!m || !m.color) return;

          if (!m.userData) m.userData = {};
          if (!m.userData.origColor) {
            m.userData.origColor = m.color.clone();
            m.userData.origRoughness = m.roughness !== undefined ? m.roughness : 0.25;
            m.userData.origMetalness = m.metalness !== undefined ? m.metalness : 0.5;
            m.userData.origBumpScale = m.bumpScale !== undefined ? m.bumpScale : 0.04;
          }

          const orig = m.userData;

          // 1. Gold / Amber MLI Kapton Foil
          if (orig.origColor.r > 0.8 && orig.origColor.g > 0.4 && orig.origColor.b < 0.3) {
            const bleached = new THREE.Color(0xdce2e8);
            m.color.copy(orig.origColor).lerp(bleached, factor * 0.92);
            m.roughness = Math.min(0.85, orig.origRoughness + factor * 0.52);
            m.metalness = Math.max(0.42, orig.origMetalness - factor * 0.4);
            if (m.bumpScale !== undefined) {
              m.bumpScale = orig.origBumpScale + factor * 0.14;
            }
          }
          // 2. Solar Arrays (Dark blue/indigo cells)
          else if (orig.origColor.b > 0.22 && orig.origColor.r < 0.2) {
            let solarDust = new THREE.Color(0x3e5265);
            if (body === 'mars') solarDust = new THREE.Color(0x7c4930);
            else if (body === 'venus') solarDust = new THREE.Color(0x2d251e);
            m.color.copy(orig.origColor).lerp(solarDust, factor * 0.86);
            m.roughness = Math.min(0.88, orig.origRoughness + factor * 0.65);
            m.metalness = Math.max(0.2, orig.origMetalness - factor * 0.55);
          }
          // 3. White / Light Chassis Coatings
          else if (orig.origColor.r > 0.85 && orig.origColor.g > 0.85 && orig.origColor.b > 0.85) {
            let dustColor = new THREE.Color(0x9fa8b2);
            if (body === 'mars') dustColor = new THREE.Color(0xcc6f43);
            else if (body === 'venus') dustColor = new THREE.Color(0x382f25);
            else if (body === 'outer') dustColor = new THREE.Color(0xa26d46);
            m.color.copy(orig.origColor).lerp(dustColor, factor * 0.82);
            m.roughness = Math.min(0.92, orig.origRoughness + factor * 0.48);
          }
          // 4. Structural Metals
          else if (orig.origMetalness > 0.6) {
            m.roughness = Math.min(0.78, orig.origRoughness + factor * 0.45);
          }

          m.needsUpdate = true;
        });
      }
    });
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
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    if (window.SpaceAudio) {
      window.SpaceAudio.setRoverMotorHum(false);
      window.SpaceAudio.setSpectrometerBeamHum(false);
    }
    if (this.isSpectrometerActive) {
      this.isSpectrometerActive = false;
      const card = document.getElementById('spectrometer-card');
      if (card) card.classList.add('hidden');
      const btn = document.getElementById('btn-walk-scanner');
      if (btn) btn.classList.remove('active');
    }
    if (this.spectrometerContactRing) {
      this.spectrometerContactRing.visible = false;
    }
    if (this.spectrometerBeam) {
      this.spectrometerBeam.material.opacity = 0.0;
    }
    this.walkState.keys = { w: false, a: false, s: false, d: false };
    this.walkState.isLooking = false;
    this.walkState.isDrivingRover = false;
    const roverDash = document.getElementById('rover-dash-overlay');
    if (roverDash) roverDash.classList.add('hidden');
    const roverBtn = document.getElementById('btn-walk-rover');
    if (roverBtn) {
      roverBtn.classList.remove('active');
      const isTr = window.app ? window.app.currentLang === 'tr' : false;
      roverBtn.innerText = isTr ? '🚙 Araca Bin / Sür (R)' : '🚙 Drive Rover (R)';
    }
    this.setCleanVRGameMode(false);
    if (this.controls) this.controls.enabled = false;
    if (this.cameraRig) {
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
    }
    if (this.vrHelpPanel) this.vrHelpPanel.visible = false;
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
    this.reattachToolsToFPArms();

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

      // Commander Red Armband & YİĞİDO ORBİT Team Mission Patch on Left Shoulder
      const armBand = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.081, 0.042, 16), redCommander);
      armBand.position.y = -0.12;
      shoulderGroup.add(armBand);

      if (!this.teamLogoTexture) {
        this.teamLogoTexture = new THREE.TextureLoader().load('assets/yigido-orbit-logo.jpg');
      }
      const patchMat = isLeft
        ? new THREE.MeshStandardMaterial({ map: this.teamLogoTexture, roughness: 0.55, metalness: 0.12 })
        : redCommander;
      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.058, 0.078),
        patchMat
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
  // HIGH-DETAIL INTERACTIVE LUNAR ROVING VEHICLE (LRV "MOON BUGGY") & SURFACE PROPS
  // ===========================================================================
  buildLunarRoverProp(x, z) {
    const lrv = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    lrv.position.set(x, y + 0.38, z);
    lrv.rotation.order = 'YXZ';
    lrv.rotation.y = -0.65;
    this.lrvPropGroup = lrv;
    this.lrvWheels = [];
    this.lrvWheelNodes = [];
    this.roverState = {
      speed: 0,
      heading: -0.65,
      steerAngle: 0,
      pitch: 0,
      roll: 0,
      wheelAngle: 0,
      odometer: 0,
      tBarPitch: 0,
      tBarRoll: 0
    };

    // PBR Aerospace Materials
    const alumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.28 });
    const darkAlumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.35 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
    const wireMeshMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.82, roughness: 0.32, wireframe: true });
    const tireRubberMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.38, roughness: 0.72 });
    const chevronMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.92, roughness: 0.18 });
    const fenderMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.52, roughness: 0.44 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.90 });

    const roverInteract = {
      label_tr: '🚙 [SOL TIK / E / R / VR TETİK] LRV AY ARACINA BİN & YÜZEYDE SÜR (1:1 SÜRÜŞ MODU)',
      label_en: '🚙 [CLICK / E / R / VR TRIGGER] MOUNT & DRIVE LRV MOON BUGGY ON SURFACE',
      onClick: () => {
        this.toggleRoverDrive();
      }
    };

    // 1. Chassis Frame (3.1m long, 1.8m track width)
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.10, 2.75), alumMat);
    chassis.castShadow = true;
    chassis.userData.interactive = roverInteract;
    lrv.add(chassis);

    // Front angled nose chassis
    const frontChassis = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.85), alumMat);
    frontChassis.position.set(0, 0.05, 1.65);
    frontChassis.rotation.x = -0.08;
    frontChassis.userData.interactive = roverInteract;
    lrv.add(frontChassis);

    // Tubular front bumper
    const bumper = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.45, 12), darkAlumMat);
    bumper.rotation.z = Math.PI / 2;
    bumper.position.set(0, 0.12, 2.10);
    lrv.add(bumper);

    // Rear cargo deck platform
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.85), alumMat);
    rearDeck.position.set(0, 0.08, -1.65);
    rearDeck.userData.interactive = roverInteract;
    lrv.add(rearDeck);

    // Side safety rails
    for (let side = -1; side <= 1; side += 2) {
      const sideRail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 10), darkAlumMat);
      sideRail.rotation.x = Math.PI / 2;
      sideRail.position.set(side * 0.75, 0.22, 0);
      lrv.add(sideRail);
    }

    // 2. Forward LCRU Gold Electronics Box & Antennas
    const lcru = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.38, 0.55), goldMat);
    lcru.position.set(0, 0.25, 1.25);
    lcru.userData.interactive = roverInteract;
    lrv.add(lcru);

    // High-Gain Parabolic Umbrella Wire Dish Antenna
    const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 10), alumMat);
    dishPole.position.set(-0.48, 0.75, 0.95);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45),
      wireMeshMat
    );
    dish.position.set(-0.48, 1.45, 0.95);
    dish.rotation.x = Math.PI * 0.72;
    dish.rotation.y = 0.25;

    const feedHorn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), darkAlumMat);
    feedHorn.position.set(-0.48, 1.45, 0.65);
    feedHorn.rotation.x = -Math.PI * 0.28;
    lrv.add(dishPole, dish, feedHorn);

    // Low-Gain whip antenna
    const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8), darkAlumMat);
    whip.position.set(0.48, 0.75, 1.15);
    lrv.add(whip);

    // Ground-Controlled Television Assembly (GCTA Camera)
    const camPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 10), alumMat);
    camPost.position.set(0.48, 0.35, 1.55);
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.28), goldMat);
    camBody.position.set(0.48, 0.58, 1.55);
    const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12), darkAlumMat);
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0.48, 0.58, 1.72);
    lrv.add(camPost, camBody, camLens);

    // 3. Center Control Console & Articulated T-Bar Hand Controller
    const consolePedestal = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.42), darkAlumMat);
    consolePedestal.position.set(0, 0.20, 0.12);
    consolePedestal.userData.interactive = roverInteract;
    lrv.add(consolePedestal);

    const dashPanel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.28), alumMat);
    dashPanel.position.set(0, 0.38, 0.24);
    dashPanel.rotation.x = -0.45;
    lrv.add(dashPanel);

    const tBarRoot = new THREE.Group();
    tBarRoot.position.set(0, 0.36, 0.14);
    const tStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.30, 10), darkAlumMat);
    tStem.position.y = 0.15;
    const tHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 12), rubberMat);
    tHandle.position.y = 0.30;
    tHandle.rotation.z = Math.PI / 2;
    tBarRoot.add(tStem, tHandle);
    lrv.add(tBarRoot);
    this.lrvTBar = tBarRoot;

    // 4. Twin Astronaut Folding Seats (Left: Driver, Right: Navigator)
    for (let s = -1; s <= 1; s += 2) {
      const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.50), seatMat);
      seatBottom.position.set(s * 0.42, 0.14, -0.15);
      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.56, 0.06), seatMat);
      seatBack.position.set(s * 0.42, 0.42, -0.40);
      seatBack.rotation.x = -0.15;
      seatBottom.userData.interactive = roverInteract;
      seatBack.userData.interactive = roverInteract;
      if (this.surfaceInteractables) this.surfaceInteractables.push(seatBottom, seatBack);
      lrv.add(seatBottom, seatBack);
    }

    // 5. Rear Cargo Pallet (Apollo Rock Sample Collection Boxes)
    const rockBox1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.34), alumMat);
    rockBox1.position.set(-0.35, 0.25, -1.65);
    const rockBox2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.34), alumMat);
    rockBox2.position.set(0.35, 0.25, -1.65);
    lrv.add(rockBox1, rockBox2);

    // 6. 4 Independent Wheel Assemblies with Steering Knuckles & 24 Chevron Treads
    for (let wx = -1; wx <= 1; wx += 2) {
      for (let wz = -1; wz <= 1; wz += 2) {
        const isFront = wz > 0;
        const isLeft = wx < 0;

        const wGroup = new THREE.Group();
        wGroup.position.set(wx * 0.98, -0.02, wz * 1.15);

        // Steering Knuckle Group (Pivots around local Y axis for Ackermann steering)
        const knuckle = new THREE.Group();
        wGroup.add(knuckle);

        // Amber Fiberglass Dust Fender (attached to knuckle so it turns with wheel)
        const fender = new THREE.Mesh(
          new THREE.CylinderGeometry(0.44, 0.44, 0.26, 16, 1, true, 0, Math.PI),
          fenderMat
        );
        fender.rotation.z = Math.PI / 2;
        fender.position.set(0, 0.05, 0);
        knuckle.add(fender);

        // Rubber trailing flap on fender
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.01), rubberMat);
        flap.position.set(0, -0.06, (wz > 0 ? -1 : -1) * 0.38);
        knuckle.add(flap);

        // Spinning Spindle Group (Rotates around local X axis with velocity)
        const spinGroup = new THREE.Group();
        knuckle.add(spinGroup);

        // 6a. Woven zinc-coated piano-wire mesh tire
        const tireTorus = new THREE.Mesh(
          new THREE.TorusGeometry(0.32, 0.10, 12, 28),
          wireMeshMat
        );
        tireTorus.rotation.y = Math.PI / 2;
        spinGroup.add(tireTorus);

        // 6b. Inner bump stop rubber ring
        const innerTorus = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.04, 8, 20),
          tireRubberMat
        );
        innerTorus.rotation.y = Math.PI / 2;
        spinGroup.add(innerTorus);

        // 6c. 24 Titanium chevron tread strips riveted across wire mesh
        const numChevrons = 24;
        for (let c = 0; c < numChevrons; c++) {
          const ang = (c / numChevrons) * Math.PI * 2;
          const r = 0.32;
          const cy = Math.sin(ang) * r;
          const cz = Math.cos(ang) * r;

          const chevL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.02), chevronMat);
          chevL.position.set(-0.04, cy, cz);
          chevL.rotation.x = -ang;
          chevL.rotation.y = 0.25;

          const chevR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.02), chevronMat);
          chevR.position.set(0.04, cy, cz);
          chevR.rotation.x = -ang;
          chevR.rotation.y = -0.25;

          spinGroup.add(chevL, chevR);
        }

        // 6d. Spun aluminum motor hub & gold center cap
        const motorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16), alumMat);
        motorHub.rotation.z = Math.PI / 2;
        spinGroup.add(motorHub);

        const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.20, 12), goldMat);
        hubCap.rotation.z = Math.PI / 2;
        spinGroup.add(hubCap);

        this.lrvWheels.push(spinGroup);
        this.lrvWheelNodes.push({
          isFront: isFront,
          isLeft: isLeft,
          localOffset: new THREE.Vector3(wx * 0.98, -0.02, wz * 1.15),
          group: wGroup,
          knuckle: knuckle,
          spinGroup: spinGroup
        });

        tireTorus.userData.interactive = roverInteract;
        if (this.surfaceInteractables) this.surfaceInteractables.push(tireTorus);

        lrv.add(wGroup);
      }
    }

    // 7. Dual Forward Headlights & Spotlights
    for (let hSide = -1; hSide <= 1; hSide += 2) {
      const lampCase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 14), alumMat);
      lampCase.rotation.x = Math.PI / 2;
      lampCase.position.set(hSide * 0.52, 0.28, 1.48);
      const lampLens = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
      lampLens.position.set(hSide * 0.52, 0.28, 1.542);
      lrv.add(lampCase, lampLens);

      const roverLight = new THREE.SpotLight(0xfff7ed, 3.2, 45, Math.PI / 4.5, 0.45, 1.2);
      roverLight.position.set(hSide * 0.52, 0.28, 1.55);
      const lightTarget = new THREE.Object3D();
      lightTarget.position.set(hSide * 0.52, -0.4, 25);
      lrv.add(roverLight, lightTarget);
      roverLight.target = lightTarget;
    }

    if (this.surfaceInteractables) {
      this.surfaceInteractables.push(chassis, frontChassis, rearDeck, lcru, consolePedestal);
    }
    this.scene.add(lrv);
  }

  // ===========================================================================
  // AUTHENTIC HISTORICAL SURFACE EQUIPMENT BUILDERS (LOCATION-SPECIFIC)
  // ===========================================================================
  buildModularEquipmentTransporter(x, z) {
    const met = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    met.position.set(x, y + 0.28, z);
    met.rotation.y = 0.45;

    const alumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.95), alumMat);
    deck.castShadow = true;
    met.add(deck);

    for (let side = -1; side <= 1; side += 2) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16), rubberMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.48, 0, 0);
      wheel.castShadow = true;
      met.add(wheel);
    }

    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.65), goldMat);
    tray.position.set(0, 0.15, -0.05);
    tray.castShadow = true;
    met.add(tray);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.15), alumMat);
    handle.rotation.x = Math.PI / 3.2;
    handle.position.set(0, 0.38, 0.65);
    met.add(handle);

    met.userData.interactive = {
      label_tr: '🛞 [SOL TIK / E / VR TETİK] APOLLO 14 MET ÇEKÇEĞİNİ İNCELE (Ay El Arabası)',
      label_en: '🛞 [CLICK / E / VR TRIGGER] INSPECT APOLLO 14 MET CART (Modular Transporter)',
      onClick: () => {
        this.playSwitchClickSound(880);
        if (window.SpaceAudio && this.currentArtifact) {
          window.SpaceAudio.playRadioTransmission(this.currentArtifact.audioSnippet || '');
        }
        const isTr = window.app ? window.app.currentLang === 'tr' : false;
        this.updateVRGameMiniPill(isTr ? 'Apollo 14 MET "Ay El Arabası" İncelendi' : 'Inspected Apollo 14 MET Cart');
      }
    };
    this.surfaceInteractables.push(deck, tray);
    this.scene.add(met);
  }

  buildSurveyorProbeProp(x, z) {
    const surveyor = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    surveyor.position.set(x, y + 0.45, z);
    surveyor.rotation.y = -0.55;

    const alumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.15 });

    const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 0.95, 3), alumMat);
    frame.castShadow = true;
    surveyor.add(frame);

    for (let i = 0; i < 3; i++) {
      const legAng = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), alumMat);
      leg.position.set(Math.cos(legAng) * 0.75, -0.22, Math.sin(legAng) * 0.75);
      leg.rotation.z = Math.cos(legAng) * 0.55;
      leg.rotation.x = -Math.sin(legAng) * 0.55;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), whiteMat);
      foot.position.set(Math.cos(legAng) * 1.25, -0.45, Math.sin(legAng) * 1.25);
      surveyor.add(leg, foot);
    }

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), alumMat);
    mast.position.set(0, 0.95, 0);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.04), solarMat);
    panel.position.set(0, 1.85, 0);
    panel.rotation.y = 0.35;
    surveyor.add(mast, panel);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), alumMat);
    arm.position.set(0.65, -0.25, 0.55);
    arm.rotation.x = 0.45;
    surveyor.add(arm);

    surveyor.userData.interactive = {
      label_tr: '📡 [SOL TIK / E / VR TETİK] SURVEYOR 3 ROBOTİK SONDASINI İNCELE (Apollo 12 Arkeolojisi)',
      label_en: '📡 [CLICK / E / VR TRIGGER] INSPECT SURVEYOR 3 ROBOTIC PROBE',
      onClick: () => {
        this.playSwitchClickSound(920);
        if (window.SpaceAudio && this.currentArtifact) {
          window.SpaceAudio.playRadioTransmission(this.currentArtifact.audioSnippet || '');
        }
        const isTr = window.app ? window.app.currentLang === 'tr' : false;
        this.updateVRGameMiniPill(isTr ? 'Surveyor 3 Robotik Sondası İncelendi' : 'Inspected Surveyor 3 Robotic Probe');
      }
    };
    this.surfaceInteractables.push(frame, panel);
    this.scene.add(surveyor);
  }

  buildSojournerRoverProp(x, z) {
    const rover = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    rover.position.set(x, y + 0.18, z);
    rover.rotation.y = 0.65;

    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.82, roughness: 0.3 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x172554, metalness: 0.92, roughness: 0.12 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.35 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.65), chassisMat);
    chassis.castShadow = true;
    rover.add(chassis);

    const solar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.62), solarMat);
    solar.position.y = 0.10;
    rover.add(solar);

    for (let side = -1; side <= 1; side += 2) {
      for (let w = -1; w <= 1; w++) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side * 0.28, -0.09, w * 0.22);
        wheel.castShadow = true;
        rover.add(wheel);
      }
    }

    const apxs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), chassisMat);
    apxs.rotation.x = Math.PI / 2;
    apxs.position.set(0, -0.04, 0.38);
    rover.add(apxs);

    rover.userData.interactive = {
      label_tr: '🤖 [SOL TIK / E / VR TETİK] SOJOURNER ROVERINI İNCELE (10.6 kg İlk Mars Gezgini)',
      label_en: '🤖 [CLICK / E / VR TRIGGER] INSPECT SOJOURNER MICRO-ROVER (10.6 kg First Mars Rover)',
      onClick: () => {
        this.playSwitchClickSound(980);
        if (window.SpaceAudio && this.currentArtifact) {
          window.SpaceAudio.playRadioTransmission(this.currentArtifact.audioSnippet || '');
        }
        const isTr = window.app ? window.app.currentLang === 'tr' : false;
        this.updateVRGameMiniPill(isTr ? 'Sojourner Mikro-Roverı İncelendi' : 'Inspected Sojourner Micro-Rover');
      }
    };
    this.surfaceInteractables.push(chassis, solar);
    this.scene.add(rover);
  }

  buildMarsExplorationRoverProp(x, z) {
    const mer = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    mer.position.set(x, y + 0.38, z);
    mer.rotation.y = -0.45;

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.28 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 1.5), goldMat);
    body.castShadow = true;
    mer.add(body);

    const solarDeck = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 1.6), solarMat);
    solarDeck.position.y = 0.21;
    solarDeck.castShadow = true;
    mer.add(solarDeck);

    for (let side = -1; side <= 1; side += 2) {
      for (let w = -1; w <= 1; w++) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.11, 14), metalMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side * 0.82, -0.25, w * 0.58);
        wheel.castShadow = true;
        mer.add(wheel);
      }
    }

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.25), metalMat);
    mast.position.set(0.35, 0.82, 0.45);
    const cameraHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.18), darkMat);
    cameraHead.position.set(0.35, 1.45, 0.45);
    mer.add(mast, cameraHead);

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.02, 0.08, 16), metalMat);
    dish.position.set(-0.35, 0.35, -0.45);
    dish.rotation.x = -0.45;
    mer.add(dish);

    mer.userData.interactive = {
      label_tr: '🛰️ [SOL TIK / E / VR TETİK] MARS KEŞİF GEZGİNİNİ İNCELE (MER Spirit/Opportunity)',
      label_en: '🛰️ [CLICK / E / VR TRIGGER] INSPECT MARS EXPLORATION ROVER (MER)',
      onClick: () => {
        this.playSwitchClickSound(940);
        if (window.SpaceAudio && this.currentArtifact) {
          window.SpaceAudio.playRadioTransmission(this.currentArtifact.audioSnippet || '');
        }
        const isTr = window.app ? window.app.currentLang === 'tr' : false;
        this.updateVRGameMiniPill(isTr ? 'Mars Keşif Gezgini (MER) İncelendi' : 'Inspected Mars Exploration Rover');
      }
    };
    this.surfaceInteractables.push(body, solarDeck);
    this.scene.add(mer);
  }

  buildInSightStationProps(x, z) {
    const station = new THREE.Group();
    const y = this.getExactSurfaceHeight(x, z);
    station.position.set(x, y + 0.18, z);

    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.22 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.82, roughness: 0.28 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 });

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), copperMat);
    dome.position.set(0, 0, 0);
    dome.castShadow = true;
    station.add(dome);

    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 3.2), orangeMat);
    cable.position.set(-0.55, -0.16, -1.5);
    cable.rotation.y = 0.35;
    station.add(cable);

    const mole = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.24), silverMat);
    mole.position.set(1.4, 0.05, 0.8);
    station.add(mole);

    station.userData.interactive = {
      label_tr: '🔊 [SOL TIK / E / VR TETİK] SEIS SİSMOMETRE KUBBESİNİ DİNLE (Mars Depremleri)',
      label_en: '🔊 [CLICK / E / VR TRIGGER] LISTEN TO SEIS SEISMOMETER DOME',
      onClick: () => {
        this.playSwitchClickSound(640);
        if (window.SpaceAudio) {
          window.SpaceAudio.playTelemetryPing(520, 0.3);
        }
        const isTr = window.app ? window.app.currentLang === 'tr' : false;
        this.updateVRGameMiniPill(isTr ? 'SEIS Sismometresi Aktif (Mars Sismik Kayıtları)' : 'SEIS Seismometer Active (Marsquake data)');
      }
    };
    this.surfaceInteractables.push(dome, mole);
    this.scene.add(station);
  }

  // =========================================================================
  // VEHICLE SURFACE & WALKABLE DECK PROFILE (PHYSICS COLLISION & CLIMBING)
  // Calculates physical deck elevation, top solar panel heights, and obstacle radius
  // Allows astronauts to jump and walk ON TOP of space vehicles without freezing!
  // =========================================================================
  getVehicleSurfaceProfile(x, z) {
    if (!this.spacecraft) {
      return { isOverVehicle: false, deckY: 0, radius: 2.8, isWalkableDeck: false };
    }
    const art = this.currentArtifact;
    const sPos = this.spacecraft.position;
    const dx = x - (sPos.x || 0);
    const dz = z - (sPos.z || 0);
    const d = Math.hypot(dx, dz);
    const descentOffset = (this.getDescentOffset && typeof this.simTime === 'number') ? this.getDescentOffset(this.simTime) : 0;
    const isLanded = typeof this.simTime === 'number' ? (this.simTime >= 5.8) : true;

    const isApolloLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(art ? art.id : '');
    const isRover = art && (art.category === 'rover' || (art.id && art.id.includes('rover')) || ['curiosity', 'perseverance', 'opportunity', 'spirit', 'sojourner'].includes(art.id));
    const isVenera = art && (art.category === 'venera' || (art.id && art.id.includes('venera')));
    const isHelicopter = art && (art.category === 'helicopter' || (art.id && art.id === 'ingenuity'));

    if (isApolloLM) {
      // Apollo Lunar Module Descent Stage:
      // Octagonal launch deck atop descent stage: radius 2.55m, deck height y = 3.25m
      // Landing gear outrigger struts: radius up to 4.2m, step height y = 0.55m
      if (d <= 2.55) {
        return { isOverVehicle: true, deckY: (isLanded ? 3.25 : 3.25 + descentOffset), radius: 2.55, isWalkableDeck: true };
      }
      if (d <= 4.2) {
        return { isOverVehicle: true, deckY: 0.55, radius: 4.2, isWalkableDeck: true };
      }
      return { isOverVehicle: false, deckY: 0, radius: 2.55, isWalkableDeck: false };
    }

    if (isRover) {
      // Mars Rovers (Curiosity, Perseverance, Opportunity, Spirit, Sojourner):
      // Main chassis, RTG / warm electronics box, and photovoltaic solar wings: deck height y = 1.45m
      // Rocker-bogie wheel suspension tops: y = 0.65m
      if (d <= 2.5) {
        return { isOverVehicle: true, deckY: 1.45, radius: 2.5, isWalkableDeck: true };
      }
      if (d <= 3.4) {
        return { isOverVehicle: true, deckY: 0.65, radius: 3.4, isWalkableDeck: true };
      }
      return { isOverVehicle: false, deckY: 0, radius: 2.5, isWalkableDeck: false };
    }

    if (isVenera) {
      // Soviet Venera Landers:
      // Aerodynamic brake disk & top instrument ring: deck height y = 1.65m
      // Toroidal shock-absorber base ring: y = 0.45m
      if (d <= 2.3) {
        return { isOverVehicle: true, deckY: 1.65, radius: 2.3, isWalkableDeck: true };
      }
      if (d <= 3.2) {
        return { isOverVehicle: true, deckY: 0.45, radius: 3.2, isWalkableDeck: true };
      }
      return { isOverVehicle: false, deckY: 0, radius: 2.3, isWalkableDeck: false };
    }

    if (isHelicopter) {
      // Ingenuity Mars Helicopter:
      // Fuselage box & solar panel mast: y = 2.2m
      if (d <= 1.4) {
        return { isOverVehicle: true, deckY: 2.2, radius: 1.4, isWalkableDeck: true };
      }
      return { isOverVehicle: false, deckY: 0, radius: 1.4, isWalkableDeck: false };
    }

    // Default landers, probes, Centaur stage, Skycrane:
    // Upper equipment platform / solar deck: y = 1.35m
    if (d <= 2.4) {
      return { isOverVehicle: true, deckY: 1.35, radius: 2.4, isWalkableDeck: true };
    }
    if (d <= 3.3) {
      return { isOverVehicle: true, deckY: 0.5, radius: 3.3, isWalkableDeck: true };
    }
    return { isOverVehicle: false, deckY: 0, radius: 2.4, isWalkableDeck: false };
  }

  // Exact Analytical Planetary Surface Height Function (O(1) Ultra-Fast, Zero Raycaster Lag Spikes!)
  getExactSurfaceHeight(x, z) {
    const d = Math.hypot(x, z);
    let y = this.getTerrainHeight(x, z);
    if (d > 130) {
      const edge = (d - 130) / 70;
      y += Math.sin(x * 0.08) * Math.cos(z * 0.08) * (edge * 22);
    }
    return y;
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
    this.initParticlePool();
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

    // =========================================================================
    // ULTRA-HIGH-RESOLUTION 220x220 PBR PLANETARY SURFACE (ALL CELESTIAL BODIES)
    // =========================================================================
    this.surfaceInteractables = [];
    this.walkState.collectedSamples = 0;
    this.walkState.lastActionMsg = '';

    const surfaceType = isMoon
      ? 'moon'
      : isVenus
        ? 'venus'
        : isOuter
          ? (artifact.id === 'cassini-huygens' ? 'titan' : 'comet')
          : 'mars';

    const terrainGeo = new THREE.PlaneGeometry(420, 420, 220, 220);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
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

      // Per-vertex ambient occlusion & geological shading (darkens crater bowls & rocket blast zone, brightens ridges)
      let shade = 0.88 + Math.sin(vx * 0.09 + vz * 0.07) * 0.06;
      if (y < -0.25) {
        shade *= Math.max(0.58, 1.0 + y * 0.18); // Crater bowl shadow
      } else if (y > 0.65) {
        shade *= Math.min(1.16, 1.0 + (y - 0.65) * 0.07); // Sunlit crater rim / ridge crest
      }
      if (d < 5.5) {
        // Subtle rocket plume scorch under the descent engine
        shade *= 0.68 + (d / 5.5) * 0.32;
      }
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const maxAniso = this.renderer && this.renderer.capabilities ? this.renderer.capabilities.getMaxAnisotropy() : 8;
    const texGen = window.CelestialTextures || window.ProceduralTextures;
    const groundPBR = texGen && texGen.generateSurfaceGroundPBR
      ? texGen.generateSurfaceGroundPBR(surfaceType, 1024)
      : null;

    if (groundPBR) {
      [groundPBR.map, groundPBR.bumpMap, groundPBR.roughnessMap].forEach((t) => {
        if (t) {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(24, 24);
          t.anisotropy = maxAniso;
        }
      });
    }

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: groundPBR ? groundPBR.map : null,
      bumpMap: groundPBR ? groundPBR.bumpMap : null,
      bumpScale: 0.62,
      roughnessMap: groundPBR ? groundPBR.roughnessMap : null,
      roughness: 0.94,
      metalness: 0.04
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // Radial Retro-Rocket Exhaust Blast Zone Decal directly beneath the lander
    if (texGen && texGen.generateBlastZoneTexture) {
      const blastTex = texGen.generateBlastZoneTexture(surfaceType);
      const blastMat = new THREE.MeshStandardMaterial({
        map: blastTex,
        transparent: true,
        opacity: 0.92,
        roughness: 0.98,
        metalness: 0.02,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2
      });
      const blastDecal = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 14.5), blastMat);
      blastDecal.rotation.x = -Math.PI / 2;
      blastDecal.position.set(0, 0.02, 0);
      blastDecal.receiveShadow = true;
      this.scene.add(blastDecal);
    }

    // 1:1 Scale Holographic Range Rings & VR Teleport Target Ring on Surface
    this.scaleRingsGroup = new THREE.Group();
    this.scaleRingsGroup.position.y = 0.05;
    this.scaleRingsGroup.visible = (this.cameraMode === 'walk');
    [5, 10, 15].forEach((radius, idx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : 0x00f0ff,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide
      });
      this.scaleRingsGroup.add(new THREE.Mesh(ringGeo, ringMat));
    });
    this.scene.add(this.scaleRingsGroup);

    // VR Ground Walk-To / Teleport Reticle Ring (Highlights where controller laser hits the ground)
    const tpRingGeo = new THREE.RingGeometry(0.38, 0.52, 32);
    tpRingGeo.rotateX(-Math.PI / 2);
    this.vrTeleportRing = new THREE.Mesh(
      tpRingGeo,
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    this.vrTeleportRing.visible = false;
    this.scene.add(this.vrTeleportRing);

    // Textured 3D Geological Boulders, Stratified Outcrops & Venus Basalt Slabs
    const rockPBR = texGen && texGen.generateRockPBR ? texGen.generateRockPBR(surfaceType) : null;
    const rockGeo = isVenus
      ? new THREE.CylinderGeometry(1.1, 1.35, 0.36, 8)
      : new THREE.DodecahedronGeometry(0.85, 2);
    // Perturb vertices of rockGeo so boulders look naturally fractured & organic
    if (!isVenus) {
      const rPos = rockGeo.attributes.position;
      for (let vi = 0; vi < rPos.count; vi++) {
        const vx = rPos.getX(vi);
        const vy = rPos.getY(vi);
        const vz = rPos.getZ(vi);
        const deform = 1.0 + 0.16 * Math.sin(vx * 4.5 + vy * 3.2) * Math.cos(vz * 4.1);
        rPos.setXYZ(vi, vx * deform, vy * deform * 0.82, vz * deform);
      }
      rockGeo.computeVertexNormals();
    }

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: rockPBR ? rockPBR.map : null,
      bumpMap: rockPBR ? rockPBR.bumpMap : null,
      bumpScale: 0.38,
      roughness: 0.92,
      metalness: 0.08
    });

    for (let i = 0; i < 75; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 210;
      const rz = (Math.random() - 0.5) * 210;
      if (Math.hypot(rx, rz) > 9.5) {
        const sc = 0.35 + Math.random() * 2.2;
        rock.scale.set(sc, isVenus ? 0.48 : sc * (0.48 + Math.random() * 0.52), sc);
        rock.position.set(rx, this.getTerrainHeight(rx, rz) + sc * 0.18, rz);
        if (!isVenus) rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      }
    }

    // Apollo Lunar Crewed Missions (Apollo 11, 12, 14, 15, 16, 17)
    const isApolloLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(artifact.id);

    // 8 Interactive Collectable Geological Sample Boulders: ONLY FOR APOLLO CREWED MOONWALKS!
    if (isApolloLM) {
      const sampleCoords = [
        { x: -6.8, z: 10.5, mineral_tr: 'İlmenit Bazalt Numunesi #1', mineral_en: 'Ilmenite Basalt Sample #1' },
        { x:  7.4, z: 11.2, mineral_tr: 'Anortozit Breş Numunesi #2', mineral_en: 'Anorthosite Breccia Sample #2' },
        { x: -14.2, z: -8.5, mineral_tr: 'Olivin Krater Numunesi #3', mineral_en: 'Olivine Crater Sample #3' },
        { x:  15.8, z:  4.2, mineral_tr: 'Piroksen Regolit Numunesi #4', mineral_en: 'Pyroxene Regolith Sample #4' },
        { x: -18.5, z: -15.2, mineral_tr: 'Krater Çukuru Cam Kürecikleri #5', mineral_en: 'Crater Glass Spherules #5' },
        { x:  21.0, z:  16.8, mineral_tr: 'Volkanik Cüruf & Bazalt #6', mineral_en: 'Vesicular Basalt Core #6' },
        { x:   1.5, z: -16.5, mineral_tr: 'Derin Manto Kayaç Parçası #7', mineral_en: 'Deep Mantle Clast #7' },
        { x: -11.5, z:  16.0, mineral_tr: 'Kutup Buzul / Mineral Numunesi #8', mineral_en: 'Crystalline Mineral Sample #8' }
      ];
      sampleCoords.forEach((scfg, sIdx) => {
        const sGroup = new THREE.Group();
        const sy = this.getTerrainHeight(scfg.x, scfg.z);
        sGroup.position.set(scfg.x, sy + 0.24, scfg.z);

        const sRockMat = rockMat.clone();
        const sRock = new THREE.Mesh(rockGeo, sRockMat);
        sRock.scale.set(0.62, 0.48, 0.62);
        sRock.castShadow = true;
        sRock.receiveShadow = true;
        sGroup.add(sRock);

        // Glowing Crystalline Mineral Vein & Holo Marker Ring on Sample Rock
        const crystalMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), crystalMat);
        crystal.position.set(0, 0.34, 0);
        sGroup.add(crystal);

        const ringMarker = new THREE.Mesh(
          new THREE.RingGeometry(0.55, 0.68, 24),
          new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
        );
        ringMarker.rotation.x = -Math.PI / 2;
        ringMarker.position.y = -0.20;
        sGroup.add(ringMarker);

        let collected = false;
        const sampleAction = {
          label_tr: `💎 [SOL TIK / E / VR DOKUN] JEOLOJİK NUMUNE TOPLA: ${scfg.mineral_tr}`,
          label_en: `💎 [CLICK / E / VR TOUCH] COLLECT GEOLOGICAL SAMPLE: ${scfg.mineral_en}`,
          onClick: () => {
            if (collected) return;
            collected = true;
            this.walkState.collectedSamples = Math.min(this.walkState.totalSamples, (this.walkState.collectedSamples || 0) + 1);
            this.playSwitchClickSound(880);
            if (window.SpaceAudio) window.SpaceAudio.playSampleScanChirp();
            this.pulseXRHaptics(0.85, 70);
            setTimeout(() => this.playSwitchClickSound(1180), 90);
            this.spawnBootDust(scfg.x, scfg.z, 12);
            crystal.visible = false;
            ringMarker.material.color.setHex(0x64748b);
            ringMarker.material.opacity = 0.2;
            sRock.scale.set(0.32, 0.22, 0.32);
            const isTr = window.app ? window.app.currentLang === 'tr' : false;
            sampleAction.label_tr = `✅ NUMUNE TOPLANDI (${this.walkState.collectedSamples}/${this.walkState.totalSamples}): ${scfg.mineral_tr}`;
            sampleAction.label_en = `✅ SAMPLE COLLECTED (${this.walkState.collectedSamples}/${this.walkState.totalSamples}): ${scfg.mineral_en}`;
            if (this.walkState.collectedSamples >= this.walkState.totalSamples) {
              this.updateVRGameMiniPill(isTr ? '🏆 8/8 TÜM JEOLOJİK NUMUNELER TOPLANDI!' : '🏆 8/8 ALL LUNAR SAMPLES COLLECTED!');
            } else {
              this.updateVRGameMiniPill(isTr ? `${scfg.mineral_tr} Toplandı! (${this.walkState.collectedSamples}/${this.walkState.totalSamples})` : `${scfg.mineral_en} Collected! (${this.walkState.collectedSamples}/${this.walkState.totalSamples})`);
            }
          }
        };
        sRock.userData.interactive = sampleAction;
        crystal.userData.interactive = sampleAction;
        this.surfaceInteractables.push(sRock, crystal);
        this.scene.add(sGroup);
      });
    }

    // Authentic Lunar Surface Equipment: ONLY ON CREWED APOLLO LUNAR MISSIONS!
    if (isApolloLM) {
      // Interactive Mission Flag on regolith
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

      const turkishFlagTex = window.ProceduralTextures
        ? window.ProceduralTextures.generateTurkishFlagTexture()
        : null;
      const flagMesh = new THREE.Mesh(
        fabricGeo,
        new THREE.MeshStandardMaterial({
          map: turkishFlagTex,
          color: turkishFlagTex ? 0xffffff : 0xe30a17,
          roughness: 0.65,
          metalness: 0.08,
          side: THREE.DoubleSide
        })
      );
      flagMesh.position.set(0.67, 2.12, 0);
      flagMesh.castShadow = true;
      flagMesh.userData.interactive = {
        label_tr: '🇹🇷 [SOL TIK / E / VR TETİK] ŞANLI TÜRK BAYRAĞINI SELAMLA & TELSİZİ DİNLE',
        label_en: '🇹🇷 [CLICK / E / VR TRIGGER] SALUTE TURKISH FLAG & PLAY RADIO',
        onClick: () => {
          this.playSwitchClickSound(720);
          const isTr = window.app ? window.app.currentLang === 'tr' : false;
          if (window.SpaceAudio && this.currentArtifact) {
            const speech = isTr
              ? (this.currentArtifact.quote_tr || this.currentArtifact.audioSnippet || 'İstikbal göklerdedir!')
              : (this.currentArtifact.quote_en || this.currentArtifact.audioSnippet || '');
            window.SpaceAudio.playRadioTransmission(speech);
          }
          this.updateVRGameMiniPill(isTr ? '🇹🇷 Şanlı Türk Bayrağı Selamlandı!' : '🇹🇷 Turkish Flag Saluted!');
        }
      };
      this.surfaceInteractables.push(flagMesh);
      flagGroup.add(flagMesh);
      this.scene.add(flagGroup);

      // ALSEP Scientific Instrument Station & 532nm Earth Laser: ONLY ON MOON CREWED MISSIONS!
      const alsepY = this.getExactSurfaceHeight(-10.5, 8.5);
      const alsepBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.8, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.2 })
      );
      alsepBox.position.set(-10.5, alsepY + 0.4, 8.5);
      alsepBox.castShadow = true;
      this.scene.add(alsepBox);

      // 372m Earth-Ranging Green Laser Beam (532nm) aimed directly from ALSEP to Earth in the sky!
      const pAlsep = new THREE.Vector3(-10.5, alsepY + 0.4, 8.5);
      const pEarth = new THREE.Vector3(-180, 95, -310);
      const beamDist = pAlsep.distanceTo(pEarth);
      const beamDir = new THREE.Vector3().subVectors(pEarth, pAlsep).normalize();
      const beamMid = new THREE.Vector3().addVectors(pAlsep, pEarth).multiplyScalar(0.5);

      const laserBeamGeo = new THREE.CylinderGeometry(0.09, 0.42, beamDist, 16);
      const laserBeamMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.88 });
      const alsepLaserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
      alsepLaserBeam.position.copy(beamMid);
      alsepLaserBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamDir);
      alsepLaserBeam.visible = false;
      this.scene.add(alsepLaserBeam);

      // Green target retroreflector pulse ring at Earth
      const earthTargetRing = new THREE.Mesh(
        new THREE.RingGeometry(2.5, 4.6, 28),
        new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      earthTargetRing.position.set(-180, 95, -310);
      earthTargetRing.lookAt(pAlsep);
      earthTargetRing.visible = false;
      this.scene.add(earthTargetRing);

      alsepBox.userData.interactive = {
        label_tr: '📡 [SOL TIK / E / VR TETİK] ALSEP DÜNYA LAZER YANSITICISINI ATEŞLE (LRRR 532nm)',
        label_en: '📡 [CLICK / E / VR TRIGGER] FIRE ALSEP LUNAR LASER RETROREFLECTOR (532nm LRRR)',
        onClick: () => {
          alsepLaserBeam.visible = !alsepLaserBeam.visible;
          earthTargetRing.visible = alsepLaserBeam.visible;
          this.playSwitchClickSound(alsepLaserBeam.visible ? 1120 : 540);
          if (alsepLaserBeam.visible && window.SpaceAudio) {
            window.SpaceAudio.playTelemetryPing(1480, 0.15);
          }
          const isTr = window.app ? window.app.currentLang === 'tr' : false;
          this.updateVRGameMiniPill(
            alsepLaserBeam.visible
              ? (isTr
                  ? '📡 ALSEP LRRR LAZERİ: 384,402 km (Işık Gidiş-Dönüş: 2.56s • Yılda +3.8cm)'
                  : '📡 ALSEP LRRR LASER: 384,402 km (Light RTT: 2.56s • Drift: +3.8cm/yr)')
              : (isTr ? 'ALSEP Lazer Beklemede' : 'ALSEP Laser Standby')
          );
        }
      };
      this.surfaceInteractables.push(alsepBox);

      const rtgCask = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.75, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 })
      );
      rtgCask.position.set(-12.2, alsepY + 0.38, 8.5);
      rtgCask.castShadow = true;
      this.scene.add(rtgCask);

      // =======================================================================
      // REALISTIC VEHICLE & SURFACE EQUIPMENT PER HISTORICAL LOCATION
      // =======================================================================
      // 1. Apollo LRV Moon Buggy: Spawns on all surface walk missions & historical EVA sites!
      const isSurfaceWalk = (artifact.vrAllowed !== false);
      if (isSurfaceWalk) {
        this.buildLunarRoverProp(12.5, -6.5);
      } else {
        this.lrvPropGroup = null;
        this.lrvWheels = [];
        this.lrvWheelNodes = [];
      }

      // 2. Apollo 14 MET Modular Equipment Transporter ("The Lunar Wheelbarrow"):
      if (artifact.id === 'apollo-14-fra-mauro') {
        this.buildModularEquipmentTransporter(10.5, -6.5);
      }

      // 3. Apollo 12 & Surveyor 3 Robotic Lunar Probe:
      if (artifact.id === 'apollo-12-surveyor') {
        this.buildSurveyorProbeProp(18.5, -12.5);
      }
    } else {
      const isSurfaceWalk = (artifact.vrAllowed !== false);
      if (isSurfaceWalk) {
        this.buildLunarRoverProp(12.5, -6.5);
      } else {
        this.lrvPropGroup = null;
        this.lrvWheels = [];
        this.lrvWheelNodes = [];
      }
    }

    // Build First-Person & Third-Person Astronaut Rigs
    this.buildAstronautRigs();

    // Pre-spawn an initial EVA footprint trail: ONLY ON CREWED APOLLO MISSIONS!
    if (isApolloLM) {
      for (let s = 0; s < 10; s++) {
        const trailZ = 7.6 + s * 0.62;
        this.spawnFootprint(0, trailZ, 0, s % 2 === 0);
      }
    }

    // Balanced Physically-Based Planetary Sunlight & Crisp Relief Shadows (Zero Overexposure!)
    const sunColor = isVenus ? 0xffb74d : isOuter ? 0xffe0b2 : 0xfffaed;
    const sunLight = new THREE.DirectionalLight(sunColor, isMoon ? 2.05 : isVenus ? 1.55 : 1.85);
    sunLight.position.set(130, 88, 65);
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

    const ambLight = new THREE.AmbientLight(isMoon ? 0x384454 : isVenus ? 0x6b3810 : 0x553222, 0.58);
    this.scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, isMoon ? 0x1e242d : 0x3d1c14, 0.44);
    this.scene.add(hemiLight);

    // =========================================================================
    // HIGH-PRECISION 3D SPACECRAFT CRAFTING (PURE THREE.JS PBR)
    // =========================================================================
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;
    const kaptonBump = window.ProceduralTextures ? window.ProceduralTextures.generateKaptonFoilBump() : null;

    if (artifact.category === 'impact') {
      if (artifact.id === 'lunar-prospector') {
        // High-Precision Lunar Prospector (Spin-Stabilized Drum & 3 Deployable Science Booms)
        const darkSolar = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.85, roughness: 0.15 });
        const goldFoil = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2, bumpMap: kaptonBump, bumpScale: 0.04 });
        const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
        const sensorMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.9, roughness: 0.2 });

        const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3.2, 24), darkSolar);
        drum.castShadow = true;
        this.spacecraft.add(drum);

        const topCap = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.42, 0.2, 24), goldFoil);
        topCap.position.y = 1.6;
        this.spacecraft.add(topCap);

        const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.42, 0.2, 24), goldFoil);
        bottomCap.position.y = -1.6;
        this.spacecraft.add(bottomCap);

        for (let bi = 0; bi < 3; bi++) {
          const bAngle = (bi * Math.PI * 2) / 3;
          const boomGroup = new THREE.Group();
          boomGroup.rotation.y = bAngle;

          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.2), boomMat);
          rod.rotation.z = Math.PI / 2;
          rod.position.x = 3.6 + 2.0;
          boomGroup.add(rod);

          const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16), sensorMat);
          canister.rotation.z = Math.PI / 2;
          canister.position.x = 7.2 + 2.0;
          boomGroup.add(canister);

          this.spacecraft.add(boomGroup);
        }

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2), boomMat);
        mast.position.y = 2.7;
        const antDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16), goldFoil);
        antDisc.position.y = 3.8;
        this.spacecraft.add(mast, antDisc);

        const shoeCapsule = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.1 }));
        shoeCapsule.position.set(0.8, 1.8, 0.8);
        this.spacecraft.add(shoeCapsule);

        this.spacecraft.rotation.set(0.3, 0.4, 0.8);
        this.spacecraft.position.set(-75, 100, 0);

      } else {
        // Saturn V S-IVB booster (apollo-13-s4b) and Atlas V Centaur (lcross-centaur)
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
      }

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

    } else if (artifact.id === 'pioneer-venus-day') {
      // NASA PIONEER VENUS DAY PROBE (SPHERICAL TITANIUM PRESSURE VESSEL)
      const tiMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.25 });
      const heatMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75, metalness: 0.3 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });

      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.65, 32, 32), tiMat);
      sphere.position.y = 1.65;
      sphere.castShadow = true;
      this.spacecraft.add(sphere);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 28, 1, true), heatMat);
      noseCone.position.y = 0.5;
      noseCone.rotation.x = Math.PI;
      this.spacecraft.add(noseCone);

      const antennaRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 12, 28), goldMat);
      antennaRing.position.y = 3.2;
      antennaRing.rotation.x = Math.PI / 2;
      this.spacecraft.add(antennaRing);

      this.spacecraft.position.set(0, 0, 0);

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

    } else if (artifact.id === 'spirit-rover' || artifact.id === 'opportunity-rover') {
      // MARS EXPLORATION ROVERS (MER: SPIRIT & OPPORTUNITY) — SINGLE PRIMARY VEHICLE
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.28 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.76, 3.0), goldMat);
      body.position.y = 0.55;
      body.castShadow = true;
      this.spacecraft.add(body);

      const solarDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 3.2), solarMat);
      solarDeck.position.y = 0.96;
      solarDeck.castShadow = true;
      this.spacecraft.add(solarDeck);

      for (let side = -1; side <= 1; side += 2) {
        for (let w = -1; w <= 1; w++) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.22, 16), metalMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(side * 1.64, 0.26, w * 1.16);
          wheel.castShadow = true;
          this.spacecraft.add(wheel);
        }
      }

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.5), metalMat);
      mast.position.set(0.7, 2.2, 0.9);
      const cameraHead = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.32, 0.36), darkMat);
      cameraHead.position.set(0.7, 3.45, 0.9);
      this.spacecraft.add(mast, cameraHead);

      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.04, 0.16, 20), metalMat);
      dish.position.set(-0.7, 1.35, -0.9);
      dish.rotation.x = -0.45;
      this.spacecraft.add(dish);

      this.spacecraft.position.set(0, 0, 0);

    } else if (artifact.id === 'insight-lander') {
      // NASA INSIGHT MARS SEISMOLOGY STATION — SINGLE PRIMARY VEHICLE
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.22 });
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
      const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

      const landerBody = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 0.9, 8), silverMat);
      landerBody.position.y = 1.15;
      landerBody.castShadow = true;
      this.spacecraft.add(landerBody);

      for (let side = -1; side <= 1; side += 2) {
        const arrayDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 0.04, 32), solarCellMat);
        arrayDisc.position.set(side * 3.4, 1.25, 0);
        arrayDisc.castShadow = true;
        this.spacecraft.add(arrayDisc);
      }

      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), silverMat);
        strut.position.set(Math.cos(ang) * 1.8, 0.65, Math.sin(ang) * 1.8);
        strut.rotation.z = Math.cos(ang) * 0.45;
        strut.rotation.x = -Math.sin(ang) * 0.45;
        this.spacecraft.add(strut);
      }

      const seisDome = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), copperMat);
      seisDome.position.set(1.85, 0.02, 1.6);
      seisDome.castShadow = true;
      this.spacecraft.add(seisDome);

      const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6), darkMat);
      arm1.position.set(1.0, 1.4, 0.9);
      arm1.rotation.z = -0.6;
      this.spacecraft.add(arm1);

      this.spacecraft.position.set(0, 0, 0);

    } else if (artifact.id === 'pathfinder-sojourner') {
      // MARS PATHFINDER LANDER & SOJOURNER ROVER — SINGLE INTEGRATED SYSTEM
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });

      const basePetal = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.22, 6), solarMat);
      basePetal.position.y = 0.12;
      basePetal.castShadow = true;
      this.spacecraft.add(basePetal);

      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const petal = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 2.4), solarMat);
        petal.position.set(Math.cos(ang) * 2.6, 0.08, Math.sin(ang) * 2.6);
        petal.rotation.y = -ang;
        petal.castShadow = true;
        this.spacecraft.add(petal);
      }

      const impMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), silverMat);
      impMast.position.set(0, 1.0, 0);
      const impHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.3), metalMat);
      impHead.position.set(0, 1.9, 0);
      this.spacecraft.add(impMast, impHead);

      const sojGroup = new THREE.Group();
      sojGroup.position.set(0.6, 0.16, 2.8);
      const sojBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.85), goldMat);
      sojBody.position.y = 0.14;
      sojGroup.add(sojBody);
      const sojSolar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.82), solarMat);
      sojSolar.position.y = 0.26;
      sojGroup.add(sojSolar);
      for (let s = -1; s <= 1; s += 2) {
        for (let w = -1; w <= 1; w++) {
          const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), metalMat);
          wh.rotation.z = Math.PI / 2;
          wh.position.set(s * 0.38, 0.08, w * 0.28);
          sojGroup.add(wh);
        }
      }
      this.spacecraft.add(sojGroup);

      this.spacecraft.position.set(0, 0, 0);

    } else if (artifact.id === 'viking-1-lander' || artifact.id === 'phoenix-lander') {
      // VIKING 1 / PHOENIX MARS ROBOTIC LANDER — SINGLE PRIMARY VEHICLE
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });

      const landerHex = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.95, 6), silverMat);
      landerHex.position.y = 1.35;
      landerHex.castShadow = true;
      this.spacecraft.add(landerHex);

      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6), silverMat);
        leg.position.set(Math.cos(ang) * 2.4, 0.8, Math.sin(ang) * 2.4);
        leg.rotation.z = Math.cos(ang) * 0.52;
        leg.rotation.x = -Math.sin(ang) * 0.52;
        leg.castShadow = true;
        this.spacecraft.add(leg);
      }

      for (let s = -1; s <= 1; s += 2) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.05, 24), solarMat);
        disc.position.set(s * 3.1, 1.5, 0);
        disc.castShadow = true;
        this.spacecraft.add(disc);
      }

      const metMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.1), darkMat);
      metMast.position.set(-0.8, 2.3, 0.5);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2), darkMat);
      arm.position.set(1.2, 1.0, 1.2);
      arm.rotation.x = 0.5;
      this.spacecraft.add(metMast, arm);

      this.spacecraft.position.set(0, 0, 0);

    } else if (artifact.id === 'perseverance-backshell-chute') {
      // PERSEVERANCE CONICAL BACKSHELL & SUPERSONIC PARACHUTE — SINGLE RELIC SITE
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.6 });
      const heatShieldMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75, metalness: 0.3 });
      const orangeChuteMat = new THREE.MeshStandardMaterial({ color: 0xe05626, roughness: 0.85, side: THREE.DoubleSide });
      const whiteChuteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, side: THREE.DoubleSide });

      const backshell = new THREE.Mesh(new THREE.ConeGeometry(2.35, 2.4, 28, 1, true), whiteMat);
      backshell.position.set(-2.5, 1.15, 0);
      backshell.rotation.z = Math.PI * 0.42;
      backshell.castShadow = true;
      this.spacecraft.add(backshell);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.12, 12, 28), heatShieldMat);
      ring.position.set(-2.5, 1.15, 0);
      ring.rotation.z = Math.PI * 0.42;
      this.spacecraft.add(ring);

      for (let ci = 0; ci < 8; ci++) {
        const cGeo = new THREE.PlaneGeometry(12.5, 1.4, 12, 4);
        const cPos = cGeo.attributes.position;
        for (let pi = 0; pi < cPos.count; pi++) {
          const px = cPos.getX(pi);
          cPos.setZ(pi, Math.sin(px * 1.8 + ci) * 0.18);
        }
        cGeo.computeVertexNormals();
        const mat = ci % 2 === 0 ? orangeChuteMat : whiteChuteMat;
        const stripe = new THREE.Mesh(cGeo, mat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(4.8, 0.04 + ci * 0.015, -4.5 + ci * 1.3);
        stripe.castShadow = true;
        this.spacecraft.add(stripe);
      }

      this.spacecraft.position.set(0, 0, 0);

    } else if (isOuter && artifact.id === 'rosetta-philae') {
      // PHILAE COMET LANDER ON COMET 67P — SINGLE PRIMARY VEHICLE
      const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });

      const philaeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), solarMat);
      philaeBody.position.y = 1.35;
      philaeBody.castShadow = true;
      this.spacecraft.add(philaeBody);

      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), legMat);
        leg.position.set(Math.cos(ang) * 1.6, 0.65, Math.sin(ang) * 1.6);
        leg.rotation.z = Math.cos(ang) * 0.55;
        leg.rotation.x = -Math.sin(ang) * 0.55;
        leg.castShadow = true;
        this.spacecraft.add(leg);
      }

      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), carbonMat);
      antenna.position.set(0.6, 2.4, 0);
      this.spacecraft.add(antenna);

      this.spacecraft.position.set(0, 0, 0);

    } else if (isOuter && artifact.id === 'near-shoemaker-eros') {
      // NEAR SHOEMAKER ASTEROID PROBE — SINGLE PRIMARY VEHICLE
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.92, roughness: 0.12 });
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });

      const nearBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.8), goldMat);
      nearBody.position.y = 1.15;
      nearBody.castShadow = true;
      this.spacecraft.add(nearBody);

      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.2), solarMat);
        wing.position.set(Math.cos(ang) * 2.2, 1.15, Math.sin(ang) * 2.2);
        wing.rotation.y = -ang;
        wing.castShadow = true;
        this.spacecraft.add(wing);
      }

      const dish = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), dishMat);
      dish.position.set(0, 2.5, 0);
      dish.rotation.x = -Math.PI / 2;
      this.spacecraft.add(dish);

      this.spacecraft.position.set(0, 0, 0);

    } else if (isOuter && artifact.id === 'galileo-probe') {
      // GALILEO JUPITER ATMOSPHERIC ENTRY PROBE — SINGLE PRIMARY VEHICLE
      const heatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });

      const heatShield = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 28, 1, true), heatMat);
      heatShield.rotation.x = Math.PI;
      heatShield.position.y = 0.9;
      heatShield.castShadow = true;
      this.spacecraft.add(heatShield);

      const aft = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.9, 0.95, 24), goldMat);
      aft.position.y = 1.6;
      aft.castShadow = true;
      this.spacecraft.add(aft);

      this.spacecraft.position.set(0, 0, 0);

    } else {
      // APOLLO CREWED LUNAR MODULE (LM) ONLY (Apollo 11, 12, 14, 15, 16, 17)
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

      // Octagonal Descent Stage sized & rotated (Math.PI / 8) so its flat +Z face sits cleanly beneath the Airlock & EVA Porch (z = 2.62m)
      // and NEVER intersects the Boarding Ladder or Astronaut!
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.95, 2.6, 8), goldKapton);
      base.rotation.y = Math.PI / 8;
      base.position.y = -0.15;
      base.castShadow = true;
      base.receiveShadow = true;
      this.spacecraft.add(base);

      const quadShield = new THREE.Mesh(new THREE.BoxGeometry(2.75, 2.62, 1.8), blackShield);
      quadShield.position.y = -0.15;
      this.spacecraft.add(quadShield);

      // MESA Equipment Stowage Bay mounted on the left (-X) quadrant clear of the +Z Boarding Ladder!
      const mesa = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.5, 1.6), silverAlum);
      mesa.position.set(-2.72, -0.15, 0);
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

      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 1.2), silverAlum);
      porch.position.set(0, 1.3, 2.8);
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

        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 6.2), silverAlum);
        strut.position.set(3.4, -1.2, 0);
        strut.rotation.z = Math.PI / 4.1;
        strut.castShadow = true;
        legGroup.add(strut);

        const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.2, 16), goldKapton);
        pad.position.set(5.4, -3.2, 0);
        pad.castShadow = true;
        legGroup.add(pad);

        const probe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.0),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
        );
        probe.position.set(5.4, -4.2, 0);
        legGroup.add(probe);

        this.spacecraft.add(legGroup);
      }

      this.spacecraft.position.set(0, 80, 0);
    }

    this.scene.add(this.spacecraft);

    // Build 1:1 Climbable Boarding Ladder & Detailed Walk-In Spacecraft Interior: ONLY FOR CREWED APOLLO LUNAR MODULES!
    if (isApolloLM) {
      this.buildWalkableLadderAndInterior(artifact);
    } else {
      if (this.walkableInteriorGroup) {
        this.scene.remove(this.walkableInteriorGroup);
      }
      this.walkableInteriorGroup = null;
      this.dummyAscentSolidGroup = null;
      this.cabinState = null;
      this.interactables = this.surfaceInteractables ? [...this.surfaceInteractables] : [];
    }

    // Build Artemis Accords Archaeological Heritage Boundary Perimeter (Walk Standoff)
    this.buildHeritageWalkBoundary(artifact);

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

  /**
   * Build 1:1 scale Artemis Accords Archaeological Heritage Boundary on planetary surface
   */
  buildHeritageWalkBoundary(artifact) {
    if (!artifact || !this.scene) return;

    if (this.heritageBoundaryGroup) {
      this.scene.remove(this.heritageBoundaryGroup);
      this.heritageBoundaryGroup = null;
    }

    const hData = (typeof getHeritageProtectionData === 'function')
      ? getHeritageProtectionData(artifact.id)
      : (typeof HERITAGE_RADAR_DATA !== 'undefined' ? (HERITAGE_RADAR_DATA[artifact.id] || {}) : {});

    const walkBufferMeters = hData.walkBufferMeters || 75;
    if (walkBufferMeters <= 0) return;

    this.heritageBoundaryGroup = new THREE.Group();
    const segments = 128;
    const ringRadius = walkBufferMeters;

    let bColor = 0x00f0ff;
    if (hData.tier === 1) bColor = 0xf59e0b;
    else if (hData.tier === 2) bColor = 0x10b981;
    else if (hData.tier === 3) bColor = 0xef4444;

    const positions = [];
    const colors = [];
    const colObj = new THREE.Color(bColor);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const rx = Math.sin(theta) * ringRadius;
      const rz = Math.cos(theta) * ringRadius;
      const ry = this.getTerrainHeight(rx, rz) + 0.14;
      positions.push(rx, ry, rz);
      colors.push(colObj.r, colObj.g, colObj.b);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: bColor,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const lineMesh = new THREE.Line(lineGeo, lineMat);
    this.heritageBoundaryGroup.add(lineMesh);

    // 8 Holographic Perimeter Beacon Pylons along the boundary circle (every 45 deg)
    for (let b = 0; b < 8; b++) {
      const bTheta = (b / 8) * Math.PI * 2;
      const bx = Math.sin(bTheta) * ringRadius;
      const bz = Math.cos(bTheta) * ringRadius;
      const by = this.getTerrainHeight(bx, bz);

      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(bx, by, bz);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
      );
      post.position.y = 0.7;
      pylonGroup.add(post);

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshBasicMaterial({ color: bColor, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
      );
      orb.position.y = 1.45;
      pylonGroup.add(orb);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.18, 12.0, 12),
        new THREE.MeshBasicMaterial({ color: bColor, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
      );
      beam.position.y = 7.45;
      pylonGroup.add(beam);

      this.heritageBoundaryGroup.add(pylonGroup);
    }

    this.scene.add(this.heritageBoundaryGroup);
  }

  // ===========================================================================
  // WEBXR META QUEST TOUCH CONTROLLERS, 3D EVA GLOVES, HAPTICS & WRIST HOLO-HUD
  // ===========================================================================
  pulseXRHaptics(intensity = 0.65, durationMs = 45, hand = null) {
    if (!this.xrSession || !this.xrSession.inputSources) return;
    for (const source of this.xrSession.inputSources) {
      if (hand && source.handedness !== hand) continue;
      if (source.gamepad && source.gamepad.hapticActuators && source.gamepad.hapticActuators.length > 0) {
        try {
          source.gamepad.hapticActuators[0].pulse(intensity, durationMs);
        } catch (_) {}
      }
    }
  }

  updateVRWristCanvas(promptText = '') {
    if (!this.vrWristCanvas) {
      this.vrWristCanvas = document.createElement('canvas');
      this.vrWristCanvas.width = 512;
      this.vrWristCanvas.height = 256;
      this.vrWristTexture = new THREE.CanvasTexture(this.vrWristCanvas);
    }
    const ctx = this.vrWristCanvas.getContext('2d');
    const ws = this.walkState;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    ctx.fillStyle = '#040b18';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 248);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(
      isTr
        ? `🥽 NASA EVA BİLEK BİLGİSAYARI | NUMUNE: ${ws.collectedSamples}/${ws.totalSamples}`
        : `🥽 NASA EVA WRIST COMPUTER | SAMPLES: ${ws.collectedSamples}/${ws.totalSamples}`,
      18,
      36
    );

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px monospace';
    const locLabel = ws.isDrivingRover
      ? (isTr ? 'KONUM: 🚙 LRV AY ARACI SÜRÜŞÜ' : 'STATE: 🚙 DRIVING LRV ROVER')
      : ws.isInsideCabin
        ? (isTr ? 'KONUM: 🚀 KOKPİT İÇİ' : 'STATE: 🚀 INSIDE COCKPIT')
        : ws.isOnLadder
          ? (isTr ? 'KONUM: 🪜 EVA MERDİVENİ' : 'STATE: 🪜 ON EVA LADDER')
          : (isTr ? 'KONUM: 🧑🏼‍🚀 YÜZEY YÜRÜYÜŞÜ' : 'STATE: 🧑🏼‍🚀 SURFACE WALK');
    ctx.fillText(locLabel, 18, 72);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(
      isTr
        ? 'Sol Çubuk: Yürü | Sağ Çubuk: 30° Dön | Grip+Salla: Yürü'
        : 'L-Stick: Walk | R-Stick: Snap Turn | Grip+Swing: Walk',
      18,
      106
    );
    ctx.fillText(
      isTr
        ? 'Tetik: Lazer Tara/Işınlan | A: Zıpla | B: LRV | X: Spektrometre | Y: YARDIM'
        : 'Trigger: Laser Scan/Teleport | A: Jump | B: LRV | X: Spectrometer | Y: HELP',
      18,
      134
    );

    // Highlight active target prompt on the wrist computer
    ctx.fillStyle = promptText ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(14, 152, 484, 86);
    ctx.strokeStyle = promptText ? '#10b981' : '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 152, 484, 86);

    ctx.fillStyle = promptText ? '#a7f3d0' : '#94a3b8';
    ctx.font = 'bold 17px monospace';
    const cleanPrompt = promptText
      ? promptText.slice(0, 44)
      : (ws.lastActionMsg || (isTr ? 'Hedefe Lazer Tutun veya Elinizle Dokunun' : 'Aim Laser or Touch Any 3D Control'));
    ctx.fillText(cleanPrompt, 26, 192);
    if (promptText && promptText.length > 44) {
      ctx.fillText(promptText.slice(44, 88), 26, 220);
    }

    if (this.vrWristTexture) this.vrWristTexture.needsUpdate = true;
  }

  setupXRControllers() {
    if (!this.renderer || !this.renderer.xr || this.xrControllersSetup) return;
    this.xrControllersSetup = true;
    this.xrControllers = [];
    this.xrLaserLines = [];
    this.xrLaserDots = [];

    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -6.5)
    ]);

    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.48, metalness: 0.22 });
    const cuffBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.85 });
    const cuffRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.85 });

    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      const laserMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.92 });
      const laserLine = new THREE.Line(laserGeo, laserMat);
      controller.add(laserLine);
      this.xrLaserLines.push(laserLine);

      // Dynamic High-Contrast VR Target Dot at tip of controller laser
      const dotGeo = new THREE.SphereGeometry(0.016, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const laserDot = new THREE.Mesh(dotGeo, dotMat);
      laserDot.position.set(0, 0, -6.5);
      controller.add(laserDot);
      this.xrLaserDots.push(laserDot);

      // Sculpted 3D NASA EVA Astronaut Glove on each VR Controller!
      const handGroup = new THREE.Group();
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.042, 0.115), gloveMat);
      palm.position.set(0, 0, 0.02);
      const wristRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.052, 0.011, 10, 20),
        i === 0 ? cuffBlue : cuffRed
      );
      wristRing.position.set(0, 0, 0.085);
      handGroup.add(palm, wristRing);

      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.012, 0.065, 8), gloveMat);
        finger.rotation.x = Math.PI / 2;
        finger.position.set(-0.027 + f * 0.018, 0, -0.055);
        handGroup.add(finger);
      }

      // Attach 3D Holographic EVA Wrist Computer Screen (moved onto the LEFT hand once handedness is known)
      if (i === 0) {
        this.updateVRWristCanvas('');
        const wristHudMat = new THREE.MeshBasicMaterial({
          map: this.vrWristTexture,
          side: THREE.DoubleSide
        });
        this.vrWristMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), wristHudMat);
        this.vrWristMesh.position.set(0, 0.065, 0.04);
        this.vrWristMesh.rotation.x = -Math.PI / 3;
        handGroup.add(this.vrWristMesh);
      }

      controller.add(handGroup);
      controller.userData.handGroup = handGroup;

      // Meta Quest 3S: identify which physical hand this target-ray space belongs to
      controller.addEventListener('connected', (event) => {
        const src = event.data;
        controller.userData.handedness = src ? src.handedness : null;
        controller.userData.inputSource = src || null;
        controller.visible = true;
        this.attachToolsToXRControllers();
      });
      controller.addEventListener('disconnected', () => {
        controller.userData.handedness = null;
        controller.userData.inputSource = null;
        controller.visible = false;
      });

      // Trigger ('selectstart'): interact with 3D object OR fire laser spectrometer OR teleport
      controller.addEventListener('selectstart', () => {
        if (this.cameraMode === 'walk') {
          this.handleXRControllerTrigger(controller);
        }
      });
      controller.addEventListener('selectend', () => {
        if (this.cameraMode === 'walk' && this.isSpectrometerActive) {
          this.stopSpectrometerScan();
        }
      });

      // NOTE: Grip ('squeeze') is reserved for arm-swing locomotion (hold grip + swing arms),
      // so it no longer toggles doors (that caused doors to flap while walking).

      this.cameraRig.add(controller);
      this.xrControllers.push(controller);
    }
  }

  handleXRControllerTrigger(controller) {
    // 1. If handheld laser spectrometer is active, TRIGGER MUST FIRE THE LASER SCAN, NOT TELEPORT!
    if (this.isSpectrometerActive) {
      this.startSpectrometerScan();
      const hand = controller.userData ? controller.userData.handedness : 'right';
      this.pulseXRHaptics(0.65, 45, hand);
      return;
    }

    // 2. Check if pointing at an interactive 3D button/switch/hatch/sample/rover/ALSEP
    const hitObj = this.getHoveredInteractive(null, controller, 16.0);
    if (hitObj && hitObj.userData && hitObj.userData.interactive && hitObj.userData.interactive.onClick) {
      this.pulseXRHaptics(0.75, 50, controller.userData.handedness || null);
      hitObj.userData.interactive.onClick();
      return;
    }

    // 2. If outside on the planetary surface, raycast against terrain for Point-and-Teleport!
    if (!this.walkState.isInsideCabin && !this.walkState.isOnLadder && !this.walkState.isDrivingRover && this.terrain) {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      this.interactRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.interactRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const groundHits = this.interactRaycaster.intersectObject(this.terrain, false);
      if (groundHits && groundHits.length > 0 && groundHits[0].distance <= 28.0) {
        const pt = groundHits[0].point;
        const distFromCenter = Math.hypot(pt.x, pt.z);
        const inLadderZone = Math.abs(pt.x) < 0.95 && pt.z > 2.6 && pt.z < 7.0;
        if (distFromCenter > 3.3 && distFromCenter < 115 && !inLadderZone) {
          this.pulseXRHaptics(0.5, 35, controller.userData.handedness || null);
          this.walkState.x = pt.x;
          this.walkState.z = pt.z;
          this.walkState.y = pt.y;
          this.spawnFootprint(pt.x, pt.z, this.walkState.smoothYaw, true);
          this.spawnFootprint(pt.x, pt.z, this.walkState.smoothYaw, false);
          this.spawnBootDust(pt.x, pt.z, 8);
        }
      }
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
    if (!this.dskyCanvas) {
      this.dskyCanvas = document.createElement('canvas');
      this.dskyCanvas.width = 512;
      this.dskyCanvas.height = 512;
    }
    const canvas = this.dskyCanvas;
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

    if (!this.dskyTexture) {
      this.dskyTexture = new THREE.CanvasTexture(canvas);
    } else {
      this.dskyTexture.needsUpdate = true;
    }
    return this.dskyTexture;
  }

  generateTelemetryScreenTexture(artifact) {
    if (!this.telemetryCanvas) {
      this.telemetryCanvas = document.createElement('canvas');
      this.telemetryCanvas.width = 1024;
      this.telemetryCanvas.height = 512;
    }
    const canvas = this.telemetryCanvas;
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

    const isTr = window.app ? window.app.currentLang === 'tr' : false;

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
    const craftName = artifact ? (isTr ? (artifact.name_tr || artifact.name_en || artifact.id) : (artifact.name_en || artifact.id)).toUpperCase() : (isTr ? 'NASA UZAY ARACI' : 'NASA SPACECRAFT');
    const statusBanner = cs.masterAlarm
      ? (isTr ? '⚠️ ANA ALARM / KADEME İPTALİ KURULDU' : '⚠️ MASTER ALARM / STAGE ABORT ARMED')
      : (isTr ? `NASA DAHİLİ AVİYONİK VE TELEMETRİ VERİ YOLU // ${craftName}` : `NASA INTERNAL AVIONICS & TELEMETRY BUS // ${craftName}`);
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
    ctx.fillText(isTr ? `AGC PROGRAMI: P${cs.prog} | DPS İTME: %${cs.throttlePct}` : `AGC PROGRAM: P${cs.prog} | DPS THROTTLE: ${cs.throttlePct}%`, 50, 348);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(isTr ? `RCS İTİCİ BLOKLARI: ${cs.rcsArmed ? 'AKTİF (4/4)' : 'YALITILDI'}` : `RCS THRUSTER QUADS: ${cs.rcsArmed ? 'ARMED (4/4)' : 'ISOLATED'}`, 50, 382);
    ctx.fillStyle = '#fde68a';
    ctx.fillText(isTr ? `GLİKOL SOĞUTMA DÖNGÜSÜ: ${cs.glycolPump ? 'POMPA A+B AKTİF' : 'BEKLEMEDE'}` : `GLYCOL COOLING LOOP: ${cs.glycolPump ? 'PUMP A+B ACTIVE' : 'STANDBY'}`, 50, 416);

    // Right Internal Subsystem Bars (ECS O2, He TANK, RTG/FUEL, BUS VOLT)
    const metrics = isTr ? [
      { label: 'KABİN / GÖVDE BASINCI', val: '4.8 PSI (33.1 kPa)', pct: 0.88, col: '#10b981' },
      { label: 'İNİŞ / KALKIŞ İTME GÜCÜ', val: `%${cs.throttlePct} (${Math.round(cs.throttlePct * 45.0)} N)`, pct: Math.max(0.08, cs.throttlePct / 100), col: '#f59e0b' },
      { label: 'ISI KALKANI / RTG ÇEKİRDEĞİ', val: cs.glycolPump ? '294.2 K (NOMİNAL)' : '318.6 K (ISINIYOR)', pct: cs.glycolPump ? 0.72 : 0.91, col: '#00f0ff' },
      { label: 'YÜKSEK KAZANÇLI S-BANT TELEMETRİ', val: cs.sBandLocked ? 'KİLİTLENDİ (DSN GOLDSTONE)' : 'OMNİ ANTEN YEDEĞİ', pct: cs.sBandLocked ? 0.96 : 0.45, col: '#10b981' }
    ] : [
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

    // Bottom Schematic Readout
    const coordsStr = artifact ? (artifact.technicalSpecs ? artifact.technicalSpecs.coordinatesReadable : (artifact.coords ? `${artifact.coords.lat}°, ${artifact.coords.lng}°` : '0.674N, 23.473E')) : '0.674N, 23.473E';
    const massStr = artifact ? (artifact.technicalSpecs ? artifact.technicalSpecs.massLeftKg : '15,103 kg') : '15,103 kg';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(isTr
      ? `KOORDİNAT: ${coordsStr} | KÜTLE: ${massStr} | HERHANGİ BİR 3D TUŞA VEYA VALFE TIKLAYIN`
      : `COORDS: ${coordsStr} | MASS: ${massStr} | CLICK ANY 3D BUTTON OR SWITCH`, 34, 468);

    if (!this.telemetryTexture) {
      this.telemetryTexture = new THREE.CanvasTexture(canvas);
    } else {
      this.telemetryTexture.needsUpdate = true;
    }
    return this.telemetryTexture;
  }

  generateAirlockPanelTexture() {
    if (!this.airlockCanvas) {
      this.airlockCanvas = document.createElement('canvas');
      this.airlockCanvas.width = 512;
      this.airlockCanvas.height = 512;
    }
    const canvas = this.airlockCanvas;
    const ctx = canvas.getContext('2d');

    const cs = this.cabinState || {
      innerHatchOpen: false,
      outerHatchOpen: false,
      airlockPressurePsi: 4.8
    };
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    ctx.fillStyle = '#071120';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 496);

    // Header
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.fillRect(20, 20, 472, 64);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(isTr ? '🔒 NASA ÇİFT KAPILI HAVA KİLİDİ' : '🔒 NASA DUAL-DOOR AIRLOCK SYSTEM', 34, 50);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(isTr ? 'KURAL: İKİ KAPI AYNI ANDA VAKUMA AÇILAMAZ' : 'RULE: INTERLOCK PREVENTS SIMULTANEOUS OPEN', 34, 74);

    // Door #1 Status Box (Inner Cabin Bulkhead Door)
    ctx.fillStyle = cs.innerHatchOpen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(24, 102, 464, 96);
    ctx.strokeStyle = cs.innerHatchOpen ? '#10b981' : '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 102, 464, 96);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(isTr ? '1. KAPI (İÇ BASINÇ KAPISI):' : '1. INNER CABIN DOOR:', 40, 140);
    ctx.fillStyle = cs.innerHatchOpen ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(
      cs.innerHatchOpen
        ? (isTr ? '🟢 AÇIK (KABİN BASINCI EŞİT)' : '🟢 OPEN (EQUALIZED 4.8 PSI)')
        : (isTr ? '🔒 KİLİTLİ & SIZDIRMAZ' : '🔒 SEALED & LOCKED'),
      40,
      178
    );

    // Airlock Chamber Pressure Box
    const psi = cs.airlockPressurePsi !== undefined ? cs.airlockPressurePsi : (cs.outerHatchOpen ? 0.0 : 4.8);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(24, 214, 464, 110);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 214, 464, 110);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 19px monospace';
    ctx.fillText(
      isTr
        ? `HAVA KİLİDİ BASINCI: ${psi.toFixed(1)} PSI (${(psi * 6.895).toFixed(1)} kPa)`
        : `AIRLOCK PRESSURE: ${psi.toFixed(1)} PSI (${(psi * 6.895).toFixed(1)} kPa)`,
      40,
      250
    );
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 268, 432, 32);
    ctx.fillStyle = psi > 2.0 ? '#00f0ff' : '#f59e0b';
    ctx.fillRect(40, 268, Math.max(18, (psi / 4.8) * 432), 32);

    // Door #2 Status Box (Outer EVA Vacuum Hatch)
    ctx.fillStyle = cs.outerHatchOpen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(24, 340, 464, 96);
    ctx.strokeStyle = cs.outerHatchOpen ? '#10b981' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 340, 464, 96);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(isTr ? '2. KAPI (DIŞ EVA VAKUM KAPISI):' : '2. OUTER EVA VACUUM DOOR:', 40, 378);
    ctx.fillStyle = cs.outerHatchOpen ? '#10b981' : '#ef4444';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(
      cs.outerHatchOpen
        ? (isTr ? '🟢 AÇIK (MERDİVEN ÇIKIŞI AKTİF)' : '🟢 OPEN (EVA PORCH & LADDER)')
        : (isTr ? '🔒 VAKUM KİLİDİ KAPALI' : '🔒 VACUUM SEAL LOCKED'),
      40,
      416
    );

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(
      isTr ? '[TIKLA / E / VR DOKUN]: KAPI 1 <-> KAPI 2 GEÇİŞİ' : '[CLICK / E / VR TOUCH]: CYCLE DOOR 1 <-> DOOR 2',
      32,
      474
    );

    if (!this.airlockTexture) {
      this.airlockTexture = new THREE.CanvasTexture(canvas);
    } else {
      this.airlockTexture.needsUpdate = true;
    }
    return this.airlockTexture;
  }

  refreshCabinDisplays() {
    const dskyTex = this.generateDSKYTexture(this.currentArtifact);
    if (this.dskyScreenMesh && this.dskyScreenMesh.material) {
      if (this.dskyScreenMesh.material.map !== dskyTex) {
        this.dskyScreenMesh.material.map = dskyTex;
      }
      this.dskyScreenMesh.material.needsUpdate = true;
    }
    const telemTex = this.generateTelemetryScreenTexture(this.currentArtifact);
    if (this.mainTelemetryMesh && this.mainTelemetryMesh.material) {
      if (this.mainTelemetryMesh.material.map !== telemTex) {
        this.mainTelemetryMesh.material.map = telemTex;
      }
      this.mainTelemetryMesh.material.needsUpdate = true;
    }
    const airlockTex = this.generateAirlockPanelTexture();
    if (this.airlockPanelMesh && this.airlockPanelMesh.material) {
      if (this.airlockPanelMesh.material.map !== airlockTex) {
        this.airlockPanelMesh.material.map = airlockTex;
      }
      this.airlockPanelMesh.material.needsUpdate = true;
    }
    if (this.cabinAirlockPanelMesh && this.cabinAirlockPanelMesh.material) {
      if (this.cabinAirlockPanelMesh.material.map !== airlockTex) {
        this.cabinAirlockPanelMesh.material.map = airlockTex;
      }
      this.cabinAirlockPanelMesh.material.needsUpdate = true;
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
    this.interactables = this.surfaceInteractables ? [...this.surfaceInteractables] : [];

    // Live Interactive Cabin & Dual-Door Airlock State
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
      innerHatchOpen: false,
      innerHatchProgress: 0.0,
      outerHatchOpen: false,
      outerHatchProgress: 0.0,
      airlockPressurePsi: 4.8,
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

    const ladderBottomZ = 6.85;
    const ladderTopZ = 3.45;
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

    // Interactive Green Footpad at the Base of the Ladder (opens Outer EVA Door #2 so you can walk up the ladder!)
    const entryPad = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
    );
    entryPad.rotation.x = -Math.PI / 2;
    entryPad.position.set(0, this.getExactSurfaceHeight(0, 6.95) + 0.04, 6.95);
    entryPad.userData.interactive = {
      label_tr: '🪜 [SOL TIK / E / VR TETİK] 2. DIŞ KAPIYI AÇ & MERDİVENDEN YÜRÜYEREK ÇIK',
      label_en: '🪜 [CLICK / E / VR TRIGGER] OPEN OUTER DOOR #2 & WALK UP EVA LADDER',
      onClick: () => {
        this.playSwitchClickSound(620);
        this.triggerOuterAirlockDoor();
      }
    };
    this.interactables.push(entryPad);
    ladderGroup.add(entryPad);

    // Exterior EVA Porch outside Airlock Outer Door #2 (z = 2.68 to 3.52)
    const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.12, 0.86), isogridWallMat);
    porchDeck.position.set(0, cabinFloorY - 0.06, 3.10);
    porchDeck.castShadow = true;
    ladderGroup.add(porchDeck);

    // Porch Safety Handrails
    for (let side = -1; side <= 1; side += 2) {
      const pRail = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.78, 0.82), isogridAlum);
      pRail.position.set(side * 0.84, cabinFloorY + 0.36, 3.10);
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
    // 2. WALK-IN PRESSURIZED NASA CABIN SHELL & DUAL-DOOR AIRLOCK MODULE
    // =========================================================================
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, cabinFloorY, 0);
    this.walkableInteriorGroup.add(cabinGroup);

    const floorDeck = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 4.05), isogridWallMat);
    floorDeck.position.set(0, -0.08, -0.22);
    floorDeck.receiveShadow = true;
    cabinGroup.add(floorDeck);

    for (let vx = -1; vx <= 1; vx += 2) {
      const velcroPad = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.016, 1.55), blueValve);
      velcroPad.position.set(vx * 1.05, 0.01, 0.15);
      cabinGroup.add(velcroPad);
    }

    const ceilingDeck = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 4.05), darkPanelMat);
    ceilingDeck.position.set(0, 3.1, -0.22);
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
    this.cabinLightMain.position.set(0, 2.75, -0.2);
    cabinGroup.add(this.cabinLightMain);

    this.cabinLightConsole = new THREE.PointLight(0x38bdf8, 1.5, 7);
    this.cabinLightConsole.position.set(0, 1.85, -1.55);
    cabinGroup.add(this.cabinLightConsole);

    // Structural Milled Isogrid Ring Frames (Ribs) around the Cabin Perimeter
    for (let rz = -1.8; rz <= 1.5; rz += 1.1) {
      const leftRib = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.1, 0.12), isogridAlum);
      leftRib.position.set(-2.15, 1.55, rz);
      const rightRib = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.1, 0.12), isogridAlum);
      rightRib.position.set(2.15, 1.55, rz);
      const topRib = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.12), isogridAlum);
      topRib.position.set(0, 2.98, rz);
      cabinGroup.add(leftRib, rightRib, topRib);
    }

    // =========================================================================
    // 2A. DUAL-DOOR PRESSURIZED SPACECRAFT AIRLOCK SYSTEM (z = +1.65 to +2.68)
    //     • DOOR #1 (z = +1.65): INNER PRESSURIZED CABIN BULKHEAD DUAL-LEAF DOOR
    //     • AIRLOCK DECOMPRESSION CHAMBER (z = +1.65 .. +2.68)
    //     • DOOR #2 (z = +2.68): OUTER EVA VACUUM DUAL-LEAF ARMORED HATCH
    // =========================================================================
    // Inner Airlock Bulkhead Wall at z = 1.65 separating Main Cockpit from Airlock Chamber
    const innerWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.48, 3.1, 0.14), isogridWallMat);
    innerWallLeft.position.set(-1.46, 1.55, 1.65);
    const innerWallRight = new THREE.Mesh(new THREE.BoxGeometry(1.48, 3.1, 0.14), isogridWallMat);
    innerWallRight.position.set(1.46, 1.55, 1.65);
    const innerWallHeader = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.88, 0.14), isogridWallMat);
    innerWallHeader.position.set(0, 2.66, 1.65);
    cabinGroup.add(innerWallLeft, innerWallRight, innerWallHeader);

    // Titanium Pressure Seal Frame around Door #1 (Inner Airlock Doorway)
    const innerFrameTop = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.08, 0.22), charcoalRack);
    innerFrameTop.position.set(0, 2.22, 1.65);
    const innerFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.24, 0.22), charcoalRack);
    innerFrameL.position.set(-0.72, 1.10, 1.65);
    const innerFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.24, 0.22), charcoalRack);
    innerFrameR.position.set(0.72, 1.10, 1.65);
    cabinGroup.add(innerFrameTop, innerFrameL, innerFrameR);

    // Illuminated Status Lamp above Door #1 (Inner Cabin Bulkhead Door)
    this.innerHatchStatusLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.08, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    this.innerHatchStatusLamp.position.set(0, 2.34, 1.62);
    cabinGroup.add(this.innerHatchStatusLamp);

    // DOOR #1: Twin Synchronized Inner Pressurized Bulkhead Doors (Left & Right Hinged Leaves at z = 1.65)
    this.innerDoorLeftPivot = new THREE.Group();
    this.innerDoorLeftPivot.position.set(-0.68, 1.10, 1.65);
    this.innerDoorRightPivot = new THREE.Group();
    this.innerDoorRightPivot.position.set(0.68, 1.10, 1.65);
    cabinGroup.add(this.innerDoorLeftPivot, this.innerDoorRightPivot);

    const innerLeafL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.16, 0.08), isogridAlum);
    innerLeafL.position.set(0.34, 0, 0);
    const innerLeafR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.16, 0.08), isogridAlum);
    innerLeafR.position.set(-0.34, 0, 0);
    this.innerDoorLeftPivot.add(innerLeafL);
    this.innerDoorRightPivot.add(innerLeafR);

    // Armored Inspection Windows & Silicone Pressure Seals on both Inner Door Leaves
    [innerLeafL, innerLeafR].forEach((leaf, lIdx) => {
      const sign = lIdx === 0 ? 1 : -1;
      const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.10), charcoalRack);
      wFrame.position.set(sign * -0.02, 0.48, 0);
      const wGlass = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 0.11), glassMat);
      wGlass.position.set(sign * -0.02, 0.48, 0);
      const sealEdge = new THREE.Mesh(new THREE.BoxGeometry(0.028, 2.16, 0.09), charcoalRack);
      sealEdge.position.set(sign * 0.33, 0, 0);
      leaf.add(wFrame, wGlass, sealEdge);
    });

    // Dual-Sided Blue Pressure-Equalization Valve Wheel on Inner Door #1
    const innerHatchWheel = new THREE.Group();
    innerHatchWheel.position.set(-0.20, -0.05, 0);
    for (let wzSide = -1; wzSide <= 1; wzSide += 2) {
      const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 12, 24), blueValve);
      wheelRim.position.z = wzSide * 0.06;
      innerHatchWheel.add(wheelRim);
      for (let sp = 0; sp < 2; sp++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.30, 8), chromeSwitchMat);
        spoke.rotation.z = (sp * Math.PI) / 2;
        spoke.position.z = wzSide * 0.06;
        innerHatchWheel.add(spoke);
      }
    }
    const innerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 12), brassNutMat);
    innerShaft.rotation.x = Math.PI / 2;
    innerHatchWheel.add(innerShaft);
    this.innerHatchWheel = innerHatchWheel;
    innerLeafR.add(innerHatchWheel);

    const innerDoorInteract = {
      label_tr: '🚪 [SOL TIK / E / VR DOKUN] 1. KAPI (İÇ BASINÇ KAPISI): SADECE KAPIYI AÇ / KAPAT',
      label_en: '🚪 [CLICK / E / VR TOUCH] DOOR #1 (INNER CABIN BULKHEAD): OPEN / CLOSE DOOR ONLY',
      onClick: () => {
        if (!this.cabinState.innerHatchOpen) {
          this.triggerInnerAirlockDoor(false);
        } else {
          this.playSwitchClickSound(520);
          this.cabinState.innerHatchOpen = false;
          this.refreshCabinDisplays();
          const isTr = window.app ? window.app.currentLang === 'tr' : false;
          this.updateVRGameMiniPill(isTr ? '1. İç Basınç Kapısı Kapatıldı' : 'Inner Bulkhead #1 Sealed');
        }
      }
    };
    innerLeafL.userData.interactive = innerDoorInteract;
    innerLeafR.userData.interactive = innerDoorInteract;
    innerHatchWheel.userData.interactive = innerDoorInteract;
    this.interactables.push(innerLeafL, innerLeafR, innerHatchWheel);

    // -------------------------------------------------------------------------
    // PRESSURIZED AIRLOCK DECOMPRESSION CHAMBER (z = +1.65 to +2.68)
    // -------------------------------------------------------------------------
    const airlockFloor = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.14, 1.08), charcoalRack);
    airlockFloor.position.set(0, -0.07, 2.16);
    const airlockCeiling = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.14, 1.08), darkPanelMat);
    airlockCeiling.position.set(0, 2.38, 2.16);
    const airlockWallL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.48, 1.08), isogridWallMat);
    airlockWallL.position.set(-0.84, 1.18, 2.16);
    const airlockWallR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.48, 1.08), isogridWallMat);
    airlockWallR.position.set(0.84, 1.18, 2.16);
    cabinGroup.add(airlockFloor, airlockCeiling, airlockWallL, airlockWallR);

    // Exterior Gold Kapton Thermal Shielding around the protruding Airlock Module
    const extAirlockTop = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.06, 1.08), goldKapton);
    extAirlockTop.position.set(0, 2.46, 2.16);
    const extAirlockL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.52, 1.08), goldKapton);
    extAirlockL.position.set(-0.92, 1.20, 2.16);
    const extAirlockR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.52, 1.08), goldKapton);
    extAirlockR.position.set(0.92, 1.20, 2.16);
    cabinGroup.add(extAirlockTop, extAirlockL, extAirlockR);

    // 3 Circumferential Structural Pressure Ribs inside the Airlock Tunnel
    [1.82, 2.16, 2.50].forEach((az) => {
      const aRibL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.36, 0.08), isogridAlum);
      aRibL.position.set(-0.76, 1.16, az);
      const aRibR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.36, 0.08), isogridAlum);
      aRibR.position.set(0.76, 1.16, az);
      const aRibTop = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.08, 0.08), isogridAlum);
      aRibTop.position.set(0, 2.28, az);
      cabinGroup.add(aRibL, aRibR, aRibTop);
    });

    // Overhead Airlock Status Beacon PointLight
    this.airlockLight = new THREE.PointLight(0xf59e0b, 1.6, 5);
    this.airlockLight.position.set(0, 2.18, 2.16);
    cabinGroup.add(this.airlockLight);

    // Interactive Airlock Interlock & Pressure Control Displays (One inside Cabin beside Door #1, One inside Airlock Chamber!)
    const airlockTex = this.generateAirlockPanelTexture();
    const airlockPanelMat = new THREE.MeshBasicMaterial({ map: airlockTex });

    this.cabinAirlockPanelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), airlockPanelMat);
    this.cabinAirlockPanelMesh.position.set(-1.05, 1.48, 1.56);
    this.cabinAirlockPanelMesh.rotation.y = Math.PI;
    cabinGroup.add(this.cabinAirlockPanelMesh);

    this.airlockPanelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.48), airlockPanelMat);
    this.airlockPanelMesh.position.set(-0.75, 1.42, 2.16);
    this.airlockPanelMesh.rotation.y = Math.PI / 2;
    cabinGroup.add(this.airlockPanelMesh);

    // O2/N2 Equalization Pipes & Pressure Dump Valve on Right Airlock Wall
    for (let ap = 0; ap < 2; ap++) {
      const aPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.2, 12),
        ap === 0 ? copperPipe : blueValve
      );
      aPipe.position.set(0.74, 1.15, 2.02 + ap * 0.28);
      cabinGroup.add(aPipe);
    }
    const dumpValve = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 10, 20), redValve);
    dumpValve.rotation.y = Math.PI / 2;
    dumpValve.position.set(0.71, 1.32, 2.16);
    cabinGroup.add(dumpValve);

    const airlockCycleAction = {
      label_tr: '🔒 [SOL TIK / E / VR DOKUN] HAVA KİLİDİ BASINÇ DENGELEME & KAPI 1 <-> KAPI 2 KONTROL PANELİ',
      label_en: '🔒 [CLICK / E / VR TOUCH] AIRLOCK PRESSURE EQUALIZATION & DOOR 1 <-> DOOR 2 INTERLOCK PANEL',
      onClick: () => {
        dumpValve.rotation.x += Math.PI / 2;
        if (!this.cabinState.innerHatchOpen && !this.cabinState.outerHatchOpen) {
          this.triggerInnerAirlockDoor(false);
        } else if (this.cabinState.innerHatchOpen) {
          this.triggerOuterAirlockDoor(false);
        } else {
          this.triggerInnerAirlockDoor(false);
        }
      }
    };
    this.cabinAirlockPanelMesh.userData.interactive = airlockCycleAction;
    this.airlockPanelMesh.userData.interactive = airlockCycleAction;
    dumpValve.userData.interactive = airlockCycleAction;
    this.interactables.push(this.cabinAirlockPanelMesh, this.airlockPanelMesh, dumpValve);

    // -------------------------------------------------------------------------
    // DOOR #2 (z = +2.68): OUTER EVA VACUUM DUAL-LEAF ARMORED HATCH + RED VALVE WHEEL
    // -------------------------------------------------------------------------
    const outerFrameTop = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.16, 0.18), charcoalRack);
    outerFrameTop.position.set(0, 2.30, 2.68);
    const outerFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.38, 0.18), charcoalRack);
    outerFrameL.position.set(-0.78, 1.15, 2.68);
    const outerFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.38, 0.18), charcoalRack);
    outerFrameR.position.set(0.78, 1.15, 2.68);
    cabinGroup.add(outerFrameTop, outerFrameL, outerFrameR);

    // Illuminated Outer EVA Hatch Status Beacon above Door #2
    this.hatchStatusLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.09, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    this.hatchStatusLamp.position.set(0, 2.40, 2.68);
    cabinGroup.add(this.hatchStatusLamp);

    // Twin Synchronized Outer EVA Armored Doors (Left & Right Leaves at z = +2.68 opening outward onto EVA Porch!)
    this.outerDoorLeftPivot = new THREE.Group();
    this.outerDoorLeftPivot.position.set(-0.68, 1.10, 2.68);
    this.outerDoorRightPivot = new THREE.Group();
    this.outerDoorRightPivot.position.set(0.68, 1.10, 2.68);
    this.hatchPivotGroup = this.outerDoorRightPivot;
    cabinGroup.add(this.outerDoorLeftPivot, this.outerDoorRightPivot);

    const outerLeafL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.16, 0.10), isogridAlum);
    outerLeafL.position.set(0.34, 0, 0);
    const outerLeafR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 2.16, 0.10), isogridAlum);
    outerLeafR.position.set(-0.34, 0, 0);
    this.outerDoorLeftPivot.add(outerLeafL);
    this.outerDoorRightPivot.add(outerLeafR);
    this.hatchDoor = outerLeafR;

    // Gold Kapton Exterior Thermal Armor & Upper Viewport Windows on both Outer Door Leaves
    [outerLeafL, outerLeafR].forEach((leaf, lIdx) => {
      const sign = lIdx === 0 ? 1 : -1;
      const extGold = new THREE.Mesh(new THREE.BoxGeometry(0.64, 2.08, 0.02), goldKapton);
      extGold.position.set(0, 0, 0.052);
      const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.13), charcoalRack);
      wFrame.position.set(sign * -0.02, 0.50, 0);
      const wGlass = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.30, 0.14), glassMat);
      wGlass.position.set(sign * -0.02, 0.50, 0);
      const centerSeal = new THREE.Mesh(new THREE.BoxGeometry(0.032, 2.16, 0.11), charcoalRack);
      centerSeal.position.set(sign * 0.33, 0, 0);
      leaf.add(extGold, wFrame, wGlass, centerSeal);
    });

    // Dual-Sided Red Pressure-Relief & Vacuum Lock Valve Wheel on Outer Door #2
    const hatchWheel = new THREE.Group();
    hatchWheel.position.set(-0.20, -0.06, 0);
    for (let wzSide = -1; wzSide <= 1; wzSide += 2) {
      const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 12, 24), redValve);
      wheelRim.position.z = wzSide * 0.07;
      hatchWheel.add(wheelRim);
      for (let sp = 0; sp < 2; sp++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 8), chromeSwitchMat);
        spoke.rotation.z = (sp * Math.PI) / 2;
        spoke.position.z = wzSide * 0.07;
        hatchWheel.add(spoke);
      }
    }
    const wheelShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.16, 12), brassNutMat);
    wheelShaft.rotation.x = Math.PI / 2;
    hatchWheel.add(wheelShaft);
    this.hatchWheel = hatchWheel;
    outerLeafR.add(hatchWheel);

    const outerHatchInteract = {
      label_tr: '🚪 [SOL TIK / E / VR DOKUN] 2. KAPI (ÇİFT KANATLI DIŞ EVA VAKUM KAPISI): SADECE KAPIYI AÇ / KAPAT',
      label_en: '🚪 [CLICK / E / VR TOUCH] DOOR #2 (DUAL-LEAF OUTER EVA HATCH): OPEN / CLOSE DOOR ONLY',
      onClick: () => {
        if (!this.cabinState.outerHatchOpen) {
          this.triggerOuterAirlockDoor(false);
        } else {
          this.playSwitchClickSound(520);
          this.cabinState.outerHatchOpen = false;
          this.cabinState.hatchOpen = false;
          this.refreshCabinDisplays();
          const isTr = window.app ? window.app.currentLang === 'tr' : false;
          this.updateVRGameMiniPill(isTr ? '2. Dış EVA Vakum Kapısı Kapatıldı' : 'Outer EVA Hatch #2 Sealed');
        }
      }
    };
    outerLeafL.userData.interactive = outerHatchInteract;
    outerLeafR.userData.interactive = outerHatchInteract;
    hatchWheel.userData.interactive = outerHatchInteract;
    this.interactables.push(outerLeafL, outerLeafR, hatchWheel);

    // Stowed EVA PLSS Backpacks & Apollo Lunar Sample Return Containers (ALSRC Rock Boxes) on Rear Bulkhead
    for (let side = -1; side <= 1; side += 2) {
      const stowedPlss = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.22), isogridAlum);
      stowedPlss.position.set(side * 1.56, 1.55, 1.44);
      const plssBand = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.05, 0.23), redValve);
      plssBand.position.y = 0.22;
      stowedPlss.add(plssBand);
      cabinGroup.add(stowedPlss);

      // ALSRC Metallic Lunar Rock Sample Box with Latches on Floor
      const rockBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.34), chromeSwitchMat);
      rockBox.position.set(side * 1.56, 0.15, 1.38);
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
    const extLowerBandLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 4.05), goldKapton);
    extLowerBandLeft.position.set(-2.28, 0.26, -0.22);
    const extLowerBandRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 4.05), goldKapton);
    extLowerBandRight.position.set(2.28, 0.26, -0.22);
    cabinGroup.add(extLowerBandFront, extLowerBandLeft, extLowerBandRight);

    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const rcsPod = new THREE.Group();
        rcsPod.position.set(cx * 2.34, 2.25, cz * 1.65);
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

    // Sloped Main Flight Instrument Console Desk (y = 1.04, z = -1.84) + Solid Floor-to-Desk Avionics Cabinet Base!
    const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(4.15, 0.18, 0.72), charcoalRack);
    consoleDesk.position.set(0, 1.04, -1.84);
    consoleDesk.rotation.x = 0.22;
    cabinGroup.add(consoleDesk);

    // Solid Structural Avionics Cabinet Base & Toe-Kick Bumper beneath the Console Desk (Prevents visual or physical pass-through!)
    const consoleBaseCabinet = new THREE.Mesh(new THREE.BoxGeometry(4.12, 0.96, 0.64), darkPanelMat);
    consoleBaseCabinet.position.set(0, 0.48, -1.84);
    const consoleFrontBumper = new THREE.Mesh(new THREE.BoxGeometry(4.16, 0.06, 0.06), isogridAlum);
    consoleFrontBumper.position.set(0, 0.96, -1.48);
    const consoleFloorGuardLine = new THREE.Mesh(new THREE.BoxGeometry(4.10, 0.015, 0.05), cyanGlow);
    consoleFloorGuardLine.position.set(0, 0.01, -1.46);
    cabinGroup.add(consoleBaseCabinet, consoleFrontBumper, consoleFloorGuardLine);

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
            this.playSwitchClickSound(isActionKey ? 1240 : 960);
            this.pulseXRHaptics(0.7, 40);
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
        if (this.cabinState.masterAlarm && window.SpaceAudio) {
          window.SpaceAudio.playMasterAlarmKlaxon(2);
        }
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
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.1, 3.92), isogridWallMat);
    leftWall.position.set(-2.18, 1.55, -0.24);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.1, 3.92), isogridWallMat);
    rightWall.position.set(2.18, 1.55, -0.24);
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

    // Mission-Specific Center Pedestal / Internal Core Module at (x = 0, z = +0.25) with compact radius 0.38m
    // (Leaves a wide unobstructed walkway in front of the Flight Console Desk so astronaut never clips into the desk!)
    if (category === 'impact') {
      const gyroPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.82, 24), charcoalRack);
      gyroPedestal.position.set(0, 0.41, 0.25);
      const gyroSphere = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 28), goldKapton);
      gyroSphere.position.set(0, 0.98, 0.25);
      const gyroRing = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.022, 12, 28), cyanGlow);
      gyroRing.position.set(0, 0.98, 0.25);
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
      const rtgPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.85, 24), charcoalRack);
      rtgPedestal.position.set(0, 0.42, 0.25);
      cabinGroup.add(rtgPedestal);

      const rtgCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.20, 0.60, 20),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xea580c, emissiveIntensity: 0.9, roughness: 0.3 })
      );
      rtgCore.position.set(0, 1.08, 0.25);
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
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.22, 12), chromeSwitchMat);
        tube.position.set(Math.cos(ang) * 0.31, 0.92, 0.25 + Math.sin(ang) * 0.31);
        cabinGroup.add(tube);
      }
    } else {
      const engineCover = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.82, 28), isogridWallMat);
      engineCover.position.set(0, 0.41, 0.25);
      const engineTopCap = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 28), goldKapton);
      engineTopCap.position.set(0, 0.83, 0.25);
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

  // Raycast against interactive 3D cabin buttons, switches, hatch, samples, LRV & ALSEP from cursor, reticle, or VR controllers
  getHoveredInteractive(ndcVec = null, xrController = null, maxDist = 7.5) {
    if (!this.interactRaycaster || !this.interactables || this.interactables.length === 0) return null;

    if (xrController) {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(xrController.matrixWorld);
      this.interactRaycaster.ray.origin.setFromMatrixPosition(xrController.matrixWorld);
      this.interactRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const hits = this.interactRaycaster.intersectObjects(this.interactables, false);
      if (hits && hits.length > 0 && hits[0].distance <= maxDist) {
        return hits[0].object;
      }
      return null;
    }

    // If inside WebXR VR session without a specific controller passed, check both VR controllers first!
    if (this.renderer && this.renderer.xr && this.renderer.xr.isPresenting && this.xrControllers) {
      for (let i = 0; i < this.xrControllers.length; i++) {
        const ctrl = this.xrControllers[i];
        if (!ctrl) continue;
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(ctrl.matrixWorld);
        this.interactRaycaster.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);
        this.interactRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        const vrHits = this.interactRaycaster.intersectObjects(this.interactables, false);
        if (vrHits && vrHits.length > 0 && vrHits[0].distance <= 14.0) {
          return vrHits[0].object;
        }
      }
    }

    const coords = ndcVec || this.mouseNDC || new THREE.Vector2(0, 0);
    this.interactRaycaster.setFromCamera(coords, this.camera);

    const hits = this.interactRaycaster.intersectObjects(this.interactables, false);
    if (hits && hits.length > 0 && hits[0].distance <= maxDist) {
      return hits[0].object;
    }

    // Fallback to center visor reticle (0, 0) if cursor isn't directly over a button
    if (ndcVec) {
      this.interactRaycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const centerHits = this.interactRaycaster.intersectObjects(this.interactables, false);
      if (centerHits && centerHits.length > 0 && centerHits[0].distance <= maxDist) {
        return centerHits[0].object;
      }
    }
    return null;
  }

  checkVRHandProximityTouch(dt) {
    if (this.vrTouchCooldown > 0) {
      this.vrTouchCooldown = Math.max(0, this.vrTouchCooldown - dt);
    }
    if (!this.renderer || !this.renderer.xr || !this.renderer.xr.isPresenting || !this.xrControllers) return;

    const handWorldPos = new THREE.Vector3();
    const objWorldPos = new THREE.Vector3();
    if (!this.vrTouchLast) this.vrTouchLast = [null, null];

    // 1. Edge-triggered physical glove touch: fires ONCE when a glove enters a control (< 0.13 m),
    //    and must leave (> 0.24 m) before the same control can fire again. Prevents dense breaker
    //    panels / doors from rapid-firing just because a hand is resting nearby.
    if (this.interactables && this.interactables.length > 0) {
      for (let c = 0; c < this.xrControllers.length; c++) {
        const ctrl = this.xrControllers[c];
        if (!ctrl || !ctrl.visible) continue;
        ctrl.getWorldPosition(handWorldPos);

        let nearest = null;
        let nearestDist = Infinity;
        for (let j = 0; j < this.interactables.length; j++) {
          const obj = this.interactables[j];
          if (!obj || !obj.visible || !obj.userData || !obj.userData.interactive) continue;
          obj.getWorldPosition(objWorldPos);
          const d = handWorldPos.distanceTo(objWorldPos);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = obj;
          }
        }

        const last = this.vrTouchLast[c];
        if (last && (nearest !== last || nearestDist > 0.24)) {
          this.vrTouchLast[c] = null;
        }
        if (nearest && nearestDist < 0.13 && this.vrTouchLast[c] !== nearest && this.vrTouchCooldown <= 0) {
          this.vrTouchLast[c] = nearest;
          this.vrTouchCooldown = 0.35;
          this.pulseXRHaptics(0.85, 55, ctrl.userData.handedness || null);
          nearest.userData.interactive.onClick();
          return;
        }
      }
    }

    // 2. Update VR Ground Teleport Reticle Ring (right hand laser) when outside on the planetary surface
    if (this.vrTeleportRing) {
      const rightCtrl = this.getXRController('right');
      if (!this.walkState.isInsideCabin && !this.walkState.isOnLadder && !this.walkState.isDrivingRover && this.terrain && rightCtrl) {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(rightCtrl.matrixWorld);
        this.interactRaycaster.ray.origin.setFromMatrixPosition(rightCtrl.matrixWorld);
        this.interactRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        const groundHits = this.interactRaycaster.intersectObject(this.terrain, false);
        if (groundHits && groundHits.length > 0 && groundHits[0].distance <= 28.0) {
          const pt = groundHits[0].point;
          this.vrTeleportRing.position.set(pt.x, pt.y + 0.04, pt.z);
          this.vrTeleportRing.visible = true;
        } else {
          this.vrTeleportRing.visible = false;
        }
      } else {
        this.vrTeleportRing.visible = false;
      }
    }
  }

  updateInteractiveReticle() {
    if (this.cameraMode !== 'walk') return;
    const hitObj = this.getHoveredInteractive(this.mouseNDC);
    const dotEl = document.getElementById('walk-reticle-dot');
    const promptEl = document.getElementById('walk-interact-prompt');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    let promptStr = '';
    if (hitObj && hitObj.userData && hitObj.userData.interactive) {
      promptStr = isTr
        ? hitObj.userData.interactive.label_tr
        : hitObj.userData.interactive.label_en;
      if (dotEl) dotEl.classList.add('active-target');
      if (promptEl) {
        promptEl.classList.remove('hidden');
        promptEl.innerText = promptStr;
      }
      if (this.xrLaserLines) {
        this.xrLaserLines.forEach((l) => l.material.color.setHex(0x10b981));
      }
      if (this.xrLaserDots) {
        this.xrLaserDots.forEach((d) => {
          d.material.color.setHex(0x10b981);
          d.scale.set(1.4, 1.4, 1.4);
        });
      }
    } else {
      if (dotEl) dotEl.classList.remove('active-target');
      if (promptEl) promptEl.classList.add('hidden');
      if (this.xrLaserLines) {
        this.xrLaserLines.forEach((l) => l.material.color.setHex(0x00f0ff));
      }
      if (this.xrLaserDots) {
        this.xrLaserDots.forEach((d) => {
          d.material.color.setHex(0x00f0ff);
          d.scale.set(1.0, 1.0, 1.0);
        });
      }
    }

    if (this.renderer && this.renderer.xr && this.renderer.xr.isPresenting) {
      // Throttle wrist-computer canvas uploads (expensive on Quest 3S mobile GPU)
      const nowMs = performance.now();
      if (promptStr !== this._lastWristPrompt || nowMs - (this._lastWristUpdate || 0) > 450) {
        this._lastWristPrompt = promptStr;
        this._lastWristUpdate = nowMs;
        this.updateVRWristCanvas(promptStr);
      }
    }
  }

  triggerCabinInteraction(ndcVec = null, xrController = null) {
    const hitObj = this.getHoveredInteractive(ndcVec, xrController, 9.5);
    if (hitObj && hitObj.userData && hitObj.userData.interactive && hitObj.userData.interactive.onClick) {
      hitObj.userData.interactive.onClick();
    }
  }

  // ===========================================================================
  // HANDHELD XRF / RAMAN ARCHAEOLOGICAL SURFACE SPECTROMETER
  // ===========================================================================
  buildSpectrometerDevice() {
    if (this.spectrometerGroup) return;

    this.spectrometerGroup = new THREE.Group();

    // High-precision aerospace PBR materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.28
    });
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.2
    });
    const goldAccMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.18
    });
    const ledCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x064e3b }); // emerald display glow

    // Angular Scanner Chassis Body
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.055, 0.17), bodyMat);
    chassis.position.set(0, 0, -0.06);
    this.spectrometerGroup.add(chassis);

    // Front XRF Emitter Snout
    const emitterSnout = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.06, 16), titaniumMat);
    emitterSnout.rotation.x = Math.PI / 2;
    emitterSnout.position.set(0, 0.005, -0.17);
    this.spectrometerGroup.add(emitterSnout);

    // Emitter Laser Lens Aperture
    this.spectrometerLens = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), ledCyanMat);
    this.spectrometerLens.rotation.y = Math.PI;
    this.spectrometerLens.position.set(0, 0.005, -0.201);
    this.spectrometerGroup.add(this.spectrometerLens);

    // Top Angled OLED Telemetry Micro-Screen
    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.002, 0.065), screenMat);
    screenMesh.position.set(0, 0.03, -0.045);
    screenMesh.rotation.x = -0.25;
    this.spectrometerGroup.add(screenMesh);

    // Gold Thermal Dissipation Fins
    [-0.034, 0.034].forEach(x => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.035, 0.12), goldAccMat);
      fin.position.set(x, 0.005, -0.06);
      this.spectrometerGroup.add(fin);
    });

    // Holographic Laser Beam Line from emitter to hit point
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5)
    ]);
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.0
    });
    this.spectrometerBeam = new THREE.Line(beamGeo, beamMat);
    this.spectrometerBeam.frustumCulled = false;
    this.spectrometerGroup.add(this.spectrometerBeam);

    // Holographic Contact Reticle on surface
    const ringGeo = new THREE.RingGeometry(0.14, 0.18, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      depthTest: true
    });
    this.spectrometerContactRing = new THREE.Mesh(ringGeo, ringMat);
    this.spectrometerContactRing.visible = false;
    this.scene.add(this.spectrometerContactRing);

    // 4 Corner Tick Lines around reticle
    const ticksGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2 + Math.PI / 4;
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.016), ringMat);
      tick.position.set(Math.cos(ang) * 0.24, Math.sin(ang) * 0.24, 0);
      tick.rotation.z = ang;
      ticksGroup.add(tick);
    }
    this.spectrometerContactRing.add(ticksGroup);

    // Attach spectrometer to fpRightArm if available
    if (this.fpRightArm) {
      this.spectrometerGroup.position.set(0, 0.04, -0.16);
      this.spectrometerGroup.rotation.set(-0.12, 0.05, 0);
      this.spectrometerGroup.visible = false;
      this.fpRightArm.add(this.spectrometerGroup);
    }
  }

  buildScienceTabletDevice() {
    if (this.scienceTabletGroup) return;

    this.scienceTabletGroup = new THREE.Group();

    // High-precision ruggedized aerospace materials
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1
    });
    const goldBezelMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.92,
      roughness: 0.22
    });
    const titaniumBracketMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.3
    });

    // 1. Rugged Magnesium / Carbon Frame Chassis (28cm x 20cm x 1.4cm)
    const padW = 0.28, padH = 0.20, padD = 0.014;
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(padW, padH, padD), frameMat);
    this.scienceTabletGroup.add(chassis);

    // 2. Beveled Gold Thermal Trim around screen opening
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(padW - 0.012, padH - 0.012, 0.002), goldBezelMat);
    goldTrim.position.set(0, 0, 0.007);
    this.scienceTabletGroup.add(goldTrim);

    // 3. 4 Protective EVA Corner Rubber Bumpers
    const bx = padW / 2 - 0.012;
    const by = padH / 2 - 0.012;
    const bumperGeo = new THREE.BoxGeometry(0.028, 0.028, 0.022);
    [[-bx, -by], [bx, -by], [-bx, by], [bx, by]].forEach(([cx, cy]) => {
      const bumper = new THREE.Mesh(bumperGeo, bumperMat);
      bumper.position.set(cx, cy, 0);
      this.scienceTabletGroup.add(bumper);
    });

    // 4. Top Telemetry Antenna & Sensor Bar
    const antGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.065, 8);
    const antenna = new THREE.Mesh(antGeo, goldBezelMat);
    antenna.position.set(padW / 2 - 0.035, padH / 2 + 0.028, 0);
    this.scienceTabletGroup.add(antenna);

    const sensorBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.012), titaniumBracketMat);
    sensorBar.position.set(0, padH / 2 + 0.005, 0);
    this.scienceTabletGroup.add(sensorBar);

    // 5. Back EVA Gauntlet Handle Strap
    const strapBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.018), bumperMat);
    strapBase.position.set(0, 0, -0.015);
    this.scienceTabletGroup.add(strapBase);

    // 6. Dynamic High-Resolution Tablet Screen Canvas & Texture (1024 x 768)
    this.tabletCanvas = document.createElement('canvas');
    this.tabletCanvas.width = 1024;
    this.tabletCanvas.height = 768;
    this.tabletTexture = new THREE.CanvasTexture(this.tabletCanvas);
    this.tabletTexture.minFilter = THREE.LinearFilter;
    this.tabletTexture.magFilter = THREE.LinearFilter;

    const screenGeo = new THREE.PlaneGeometry(padW - 0.025, padH - 0.025);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.tabletTexture,
      side: THREE.DoubleSide
    });
    this.tabletScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.tabletScreenMesh.position.set(0, 0, 0.0085);
    this.scienceTabletGroup.add(this.tabletScreenMesh);

    // Initial render of tablet canvas content
    this.updateScienceTabletCanvas();

    // Attach to fpLeftArm by default if available
    if (this.fpLeftArm) {
      this.scienceTabletGroup.position.set(0.08, 0.12, -0.18);
      this.scienceTabletGroup.rotation.set(-0.45, 0.35, -0.18);
      this.scienceTabletGroup.scale.set(0.85, 0.85, 0.85);
      this.scienceTabletGroup.visible = false;
      this.fpLeftArm.add(this.scienceTabletGroup);
    }
  }

  updateScienceTabletCanvas() {
    if (!this.tabletCanvas) return;
    const ctx = this.tabletCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.tabletCanvas.width;
    const h = this.tabletCanvas.height;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const artifact = this.currentArtifact;
    const data = this.lastSpectrometerTargetData;
    const dist = this.lastSpectrometerDist || 0;
    const isScanning = this.isActivelyScanning;
    const progress = this.spectrometerScanProgress || 0.2;

    // 1. Dark Space Slate Background
    ctx.fillStyle = '#060b17';
    ctx.fillRect(0, 0, w, h);

    // Subtle Hexagonal / Grid Blueprint Lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer Rugged Frame Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Corner Alignment Marks (High-Tech Space Instrumentation)
    const corners = [
      [18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]
    ];
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    corners.forEach(([cx, cy]) => {
      const sx = cx < 100 ? 1 : -1;
      const sy = cy < 100 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * 18);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * 18, cy);
      ctx.stroke();
    });

    // 2. Top Header Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(16, 16, w - 32, 68);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, 68);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Consolas", "Courier New", monospace';
    ctx.fillText(
      isTr ? '🔬 NASA / LPI EVA SAHA BİLİM TABLETİ' : '🔬 NASA / LPI EVA FIELD SCIENCE DATA PAD',
      32,
      48
    );

    // Mission / Artifact Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Consolas", monospace';
    const siteTitle = artifact
      ? (artifact.name || artifact.id).toUpperCase()
      : (isTr ? 'AY YÜZEYİ KEŞİF ALANI' : 'LUNAR SURFACE EVA SITE');
    ctx.fillText(
      `SİTE: ${siteTitle} • XRF/RAMAN 532nm`,
      32,
      70
    );

    // Header Right Pill (Status)
    const statusText = isScanning
      ? (isTr ? '● AKTİF LAZER' : '● ACTIVE LASER')
      : (data ? (isTr ? '● KİLİTLİ' : '● LOCKED') : (isTr ? '○ BEKLEMEDE' : '○ STANDBY'));
    const statusBg = isScanning ? '#ef4444' : (data ? '#10b981' : '#64748b');

    ctx.fillStyle = statusBg;
    ctx.beginPath();
    ctx.roundRect(w - 200, 30, 170, 38, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, w - 115, 55);
    ctx.textAlign = 'left';

    // 3. Telemetry & Scanner Status Banner (Y: 92 to 165)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 92, w - 32, 68);
    ctx.strokeStyle = isScanning ? '#00f0ff' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = isScanning ? 2.5 : 1;
    ctx.strokeRect(16, 92, w - 32, 68);

    // Range & Laser Power info
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Consolas", monospace';
    ctx.fillText(
      isTr
        ? `MENZİL: ${dist > 0 ? dist.toFixed(2) + ' m' : '--'}   IŞIN GÜCÜ: 120 keV   FREKANS: 532 nm   HASSASİYET: 0.05%`
        : `RANGE: ${dist > 0 ? dist.toFixed(2) + ' m' : '--'}   LASER BEAM: 120 keV   FREQ: 532 nm   PRECISION: 0.05%`,
      32,
      116
    );

    // Animated Scan Progress Bar
    const barX = 32, barY = 128, barW = w - 64, barH = 20;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(barX, barY, barW, barH);

    const fillW = Math.max(10, Math.min(barW, barW * progress));
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#0284c7');
    barGrad.addColorStop(0.5, '#00f0ff');
    barGrad.addColorStop(1, '#10b981');
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, fillW, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      isScanning
        ? (isTr ? `SPEKTRUM ALINIYOR... %${Math.round(progress * 100)}` : `ACQUIRING SPECTRUM... ${Math.round(progress * 100)}%`)
        : (data ? (isTr ? 'SPEKTRAL İMZA TAMAMLANDI' : 'SPECTRAL SIGNATURE VERIFIED') : (isTr ? 'HEDEF BEKLENİYOR' : 'AWAITING TARGET')),
      barX + barW / 2,
      barY + 15
    );
    ctx.textAlign = 'left';

    // 4. Target Identity Panel (Y: 168 to 238)
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(16, 168, w - 32, 66);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 168, w - 32, 66);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px "Consolas", monospace';
    ctx.fillText(
      isTr ? '▸ TESPİT EDİLEN TARİHİ BİLEŞEN & KATMAN:' : '▸ DETECTED HISTORIC COMPONENT & SUBSTRATE:',
      32,
      188
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Consolas", monospace';
    const targetTitle = data && data.name
      ? data.name
      : (isTr ? 'Lazer Spektrometreyi Yüzeye Doğrultun...' : 'Point Laser Spectrometer at Surface...');
    ctx.fillText(targetTitle, 32, 218);

    // 5. Elemental Breakdown Table (Y: 242 to 470)
    ctx.fillStyle = '#090e1a';
    ctx.fillRect(16, 242, w - 32, 224);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(16, 242, w - 32, 224);

    // Table Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(18, 244, w - 36, 32);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Consolas", monospace';
    ctx.fillText(isTr ? 'ELEMENTEL İMZA VE KİMYASAL BİLEŞEN' : 'ELEMENTAL SIGNATURE & COMPOSITION', 32, 265);
    ctx.fillText(isTr ? 'ORAN' : 'CONC.', 460, 265);
    ctx.fillText(isTr ? 'SPEKTRAL DAĞILIM' : 'SPECTRAL DISTRIBUTION', 560, 265);

    // 4 Rows
    const elems = (data && data.elems && data.elems.length > 0)
      ? data.elems
      : [
          { name: isTr ? 'Silika / Regolit (SiO₂)' : 'Silica / Regolith (SiO₂)', pct: '45.4%', barPct: 45 },
          { name: isTr ? 'Alüminyum Buhar Katmanı (Al)' : 'Vapor-Deposited Al', pct: '28.5%', barPct: 29 },
          { name: isTr ? 'Titanyum Alaşımı (Ti-6Al-4V)' : 'Titanium Alloy (Ti-6Al-4V)', pct: '14.8%', barPct: 15 },
          { name: isTr ? 'Güneş Rüzgarı Helyum-3 (He-3)' : 'Solar Wind Implant He-3', pct: '4.2 ppb', barPct: 22 }
        ];

    const rowColors = ['#00f0ff', '#10b981', '#f59e0b', '#c084fc'];

    for (let r = 0; r < 4; r++) {
      const item = elems[r] || { name: '--', pct: '--', barPct: 5 };
      const ry = 286 + r * 44;

      // Alternating row background
      if (r % 2 === 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(18, ry - 8, w - 36, 40);
      }

      // Element Index
      ctx.fillStyle = rowColors[r];
      ctx.font = 'bold 15px "Consolas", monospace';
      ctx.fillText(`0${r + 1}`, 32, ry + 16);

      // Element Name
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 16px "Consolas", monospace';
      ctx.fillText(item.name, 68, ry + 16);

      // Percentage text
      ctx.fillStyle = rowColors[r];
      ctx.font = 'bold 16px "Consolas", monospace';
      ctx.fillText(item.pct, 460, ry + 16);

      // Distribution Bar
      const dBarX = 560, dBarY = ry + 4, dBarH = 14, dBarW = w - 560 - 32;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(dBarX, dBarY, dBarW, dBarH);

      const dFillW = Math.max(6, Math.min(dBarW, (dBarW * item.barPct) / 100));
      ctx.fillStyle = rowColors[r];
      ctx.fillRect(dBarX, dBarY, dFillW, dBarH);
    }

    // 6. Cosmic Weathering & Degradation Diagnostics Box (Y: 474 to 675)
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(16, 474, w - 32, 198);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(16, 474, w - 32, 198);

    // Diagnostics title with icon
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "Consolas", monospace';
    ctx.fillText(
      isTr
        ? '☀️ KOZMİK AŞINMA VE UZAY BOZULMASI TESPİT RAPORU:'
        : '☀️ COSMIC WEATHERING & SPACE DEGRADATION REPORT:',
      32,
      498
    );

    // Multi-line word-wrapped degradation diagnostic text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px "Consolas", monospace';
    const diagText = data && data.diag
      ? data.diag
      : (isTr
          ? 'Güneş rüzgarı partikülleri, mikrometeorit akısı ve doğrudan UV fotolizi yüzeyde mikron düzeyinde aşınma kraterleri oluşturmuştur. Lazer spektrometreyi hedef donanıma doğrultarak tetik çekiniz.'
          : 'Solar wind bombardment, micrometeorite flux, and direct UV photolysis have created micro-impact craters. Aim the laser spectrometer and pull trigger for real-time elemental diagnostics.');

    this.wrapTabletText(ctx, diagText, 32, 524, w - 64, 22);

    // Heritage Protection Banner inside diagnostics box
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(28, 620, w - 56, 42);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 620, w - 56, 42);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "Consolas", monospace';
    ctx.fillText(
      isTr
        ? '🏛️ ARTEMIS ACCORDS SEC. 9 • NASA LROC TEYİTLİ TARİHİ KORUMA ALANI (DOKUNULMAZ)'
        : '🏛️ ARTEMIS ACCORDS SEC. 9 • NASA LROC VERIFIED HISTORIC PROTECTED ZONE (HERITAGE)',
      42,
      646
    );

    // 7. Footer Bar (Y: 680 to 754)
    ctx.fillStyle = '#030712';
    ctx.fillRect(16, 680, w - 32, 74);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(16, 680, w - 32, 74);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "Consolas", monospace';
    ctx.fillText('🔋 RTG: 98.4%', 32, 706);
    ctx.fillText('📶 TELEMETRY: DUAL-LINK HOUSTON', 170, 706);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px "Consolas", monospace';
    ctx.fillText(
      isTr
        ? '🥽 VR KONTROL: [Tetik] Lazer Tara • [X] Tableti Aç/Kapat'
        : '🥽 VR CONTROLS: [Trigger] Laser Scan • [X] Toggle Tablet',
      470,
      706
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Consolas", monospace';
    ctx.fillText(
      isTr
        ? '💻 PC: [Sol Tık / Basılı Tut] Spektrometre Lazerini Ateşle • [G] Spektrometre & Tableti Göster/Gizle'
        : '💻 PC: [Hold Left Click] Fire Spectrometer Laser • [G] Toggle Spectrometer & Data Pad',
      32,
      736
    );

    // Upload to WebGL GPU
    if (this.tabletTexture) {
      this.tabletTexture.needsUpdate = true;
    }
  }

  wrapTabletText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currY);
        line = words[n] + ' ';
        currY += lineHeight;
        if (currY > y + lineHeight * 3.5) break;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currY);
    }
  }

  attachToolsToXRControllers() {
    if (!this.spectrometerGroup) this.buildSpectrometerDevice();
    if (!this.scienceTabletGroup) this.buildScienceTabletDevice();

    const rightCtrl = this.findXRController('right') || (this.xrControllers && this.xrControllers[1]);
    const leftCtrl = this.findXRController('left') || (this.xrControllers && this.xrControllers[0]);

    if (rightCtrl && this.spectrometerGroup) {
      if (this.spectrometerGroup.parent !== rightCtrl) {
        if (this.spectrometerGroup.parent) this.spectrometerGroup.parent.remove(this.spectrometerGroup);
        rightCtrl.add(this.spectrometerGroup);
      }
      this.spectrometerGroup.position.set(0, -0.015, -0.08);
      this.spectrometerGroup.rotation.set(-0.15, 0, 0);
      this.spectrometerGroup.scale.set(1, 1, 1);
      this.spectrometerGroup.visible = !!this.isSpectrometerActive;
    }

    if (leftCtrl && this.scienceTabletGroup) {
      if (this.scienceTabletGroup.parent !== leftCtrl) {
        if (this.scienceTabletGroup.parent) this.scienceTabletGroup.parent.remove(this.scienceTabletGroup);
        leftCtrl.add(this.scienceTabletGroup);
      }
      this.scienceTabletGroup.position.set(0.02, 0.07, -0.08);
      this.scienceTabletGroup.rotation.set(-Math.PI / 3.2, 0, 0);
      this.scienceTabletGroup.scale.set(1, 1, 1);
      this.scienceTabletGroup.visible = !!this.isSpectrometerActive;
    }
  }

  reattachToolsToFPArms() {
    if (this.spectrometerGroup && this.spectrometerGroup.parent !== this.fpRightArm) {
      if (this.spectrometerGroup.parent) this.spectrometerGroup.parent.remove(this.spectrometerGroup);
      if (this.fpRightArm) {
        this.spectrometerGroup.position.set(0, 0.04, -0.16);
        this.spectrometerGroup.rotation.set(-0.12, 0.05, 0);
        this.spectrometerGroup.scale.set(1, 1, 1);
        this.fpRightArm.add(this.spectrometerGroup);
      }
      this.spectrometerGroup.visible = !!this.isSpectrometerActive;
    }

    if (this.scienceTabletGroup && this.scienceTabletGroup.parent !== this.fpLeftArm) {
      if (this.scienceTabletGroup.parent) this.scienceTabletGroup.parent.remove(this.scienceTabletGroup);
      if (this.fpLeftArm) {
        this.scienceTabletGroup.position.set(0.08, 0.12, -0.18);
        this.scienceTabletGroup.rotation.set(-0.45, 0.35, -0.18);
        this.scienceTabletGroup.scale.set(0.85, 0.85, 0.85);
        this.fpLeftArm.add(this.scienceTabletGroup);
      }
      this.scienceTabletGroup.visible = !!this.isSpectrometerActive;
    }
  }

  toggleSpectrometer() {
    this.isSpectrometerActive = !this.isSpectrometerActive;
    this.playSwitchClickSound(this.isSpectrometerActive ? 750 : 450);

    const card = document.getElementById('spectrometer-card');
    const btn = document.getElementById('btn-walk-scanner');
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    if (card) {
      card.classList.toggle('hidden', !this.isSpectrometerActive);
    }
    if (btn) {
      btn.classList.toggle('active', this.isSpectrometerActive);
      btn.innerText = this.isSpectrometerActive
        ? (isTr ? '🔬 Spektrometre & Tablet: AÇIK [X/G]' : '🔬 Spectrometer & Tablet: ON [X/G]')
        : (isTr ? '🔬 Spektrometre & Tablet: KAPALI [X/G]' : '🔬 Spectrometer & Tablet: OFF [X/G]');
    }

    if (!this.spectrometerGroup) this.buildSpectrometerDevice();
    if (!this.scienceTabletGroup) this.buildScienceTabletDevice();

    if (this.renderer && this.renderer.xr && this.renderer.xr.isPresenting) {
      this.attachToolsToXRControllers();
    } else {
      this.reattachToolsToFPArms();
    }

    if (this.spectrometerGroup) {
      this.spectrometerGroup.visible = this.isSpectrometerActive;
    }
    if (this.scienceTabletGroup) {
      this.scienceTabletGroup.visible = this.isSpectrometerActive;
    }

    if (!this.isSpectrometerActive) {
      this.stopSpectrometerScan();
      if (this.spectrometerContactRing) this.spectrometerContactRing.visible = false;
      if (this.spectrometerBeam) this.spectrometerBeam.material.opacity = 0.0;
    } else {
      this.updateScienceTabletCanvas();
      this.startSpectrometerScan();
      setTimeout(() => {
        if (!this.isMouseDownScanning) this.stopSpectrometerScan();
      }, 700);
    }

    this.updateVRGameMiniPill(
      this.isSpectrometerActive
        ? (isTr ? '🔬 XRF Yüzey Spektrometresi & Bilim Tableti Aktif [X/G]' : '🔬 XRF Surface Spectrometer & Science Tablet Active [X/G]')
        : (isTr ? '🔬 Spektrometre ve Tablet Kapatıldı' : '🔬 Spectrometer & Tablet Stowed')
    );
  }

  startSpectrometerScan() {
    this.isActivelyScanning = true;
    this.isMouseDownScanning = true;
    if (window.SpaceAudio) {
      window.SpaceAudio.setSpectrometerBeamHum(true);
      window.SpaceAudio.playSpectrometerAnalyzeChirp();
    }
    const triggerBtn = document.getElementById('btn-spec-trigger');
    if (triggerBtn) triggerBtn.classList.add('active');
  }

  stopSpectrometerScan() {
    this.isActivelyScanning = false;
    this.isMouseDownScanning = false;
    if (window.SpaceAudio) {
      window.SpaceAudio.setSpectrometerBeamHum(false);
    }
    const triggerBtn = document.getElementById('btn-spec-trigger');
    if (triggerBtn) triggerBtn.classList.remove('active');
  }

  updateSpectrometer(dt) {
    if (!this.isSpectrometerActive || this.cameraMode !== 'walk') {
      if (this.spectrometerContactRing) this.spectrometerContactRing.visible = false;
      if (this.spectrometerBeam) this.spectrometerBeam.material.opacity = 0.0;
      if (this.scienceTabletGroup) this.scienceTabletGroup.visible = false;
      if (window.SpaceAudio && this.isScanningAudioActive) {
        window.SpaceAudio.setSpectrometerBeamHum(false);
        this.isScanningAudioActive = false;
      }
      return;
    }

    if (!this.spectrometerGroup) this.buildSpectrometerDevice();
    if (!this.scienceTabletGroup) this.buildScienceTabletDevice();
    if (this.spectrometerGroup) this.spectrometerGroup.visible = true;
    if (this.scienceTabletGroup) this.scienceTabletGroup.visible = true;

    // Scan progress animation
    if (this.isActivelyScanning) {
      this.spectrometerScanProgress = Math.min(1.0, (this.spectrometerScanProgress || 0) + dt * 0.85);
    } else {
      this.spectrometerScanProgress = Math.max(0.15, (this.spectrometerScanProgress || 0) - dt * 0.35);
    }

    // Raycast from camera center or XR controller into the scene
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3(0, 0, -1);

    if (this.renderer && this.renderer.xr && this.renderer.xr.isPresenting && this.xrControllers && this.xrControllers.length > 0) {
      const rightCtrl = this.findXRController('right') || this.xrControllers[1] || this.xrControllers[0];
      if (rightCtrl) {
        const tempMatrix = new THREE.Matrix4().identity().extractRotation(rightCtrl.matrixWorld);
        rayOrigin.setFromMatrixPosition(rightCtrl.matrixWorld);
        rayDir.set(0, 0, -1).applyMatrix4(tempMatrix);
      }
    } else {
      this.camera.getWorldPosition(rayOrigin);
      this.camera.getWorldDirection(rayDir);
    }

    this.spectrometerRaycaster = this.spectrometerRaycaster || new THREE.Raycaster();
    this.spectrometerRaycaster.ray.origin.copy(rayOrigin);
    this.spectrometerRaycaster.ray.direction.copy(rayDir);
    this.spectrometerRaycaster.far = 38.0;

    const targetsToTest = [];
    if (this.spacecraft) targetsToTest.push(this.spacecraft);
    if (this.terrain) targetsToTest.push(this.terrain);
    if (this.interactables && this.interactables.length > 0) targetsToTest.push(...this.interactables);

    const hits = this.spectrometerRaycaster.intersectObjects(targetsToTest, true);

    if (hits && hits.length > 0) {
      const hit = hits[0];
      const dist = hit.distance;
      this.lastSpectrometerDist = dist;

      // Position the contact ring on the hit point aligned with surface normal
      if (this.spectrometerContactRing) {
        this.spectrometerContactRing.visible = true;
        const norm = (hit.face && hit.face.normal) ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        norm.transformDirection(hit.object.matrixWorld);
        this.spectrometerContactRing.position.copy(hit.point).addScaledVector(norm, 0.03);
        this.spectrometerContactRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);
        this.spectrometerContactRing.rotation.z += dt * 2.8;
        this.spectrometerContactRing.material.opacity = this.isActivelyScanning ? 0.95 : 0.45;
        this.spectrometerContactRing.scale.setScalar(this.isActivelyScanning ? 1.15 : 1.0);
      }

      // Update laser beam
      if (this.spectrometerBeam && this.spectrometerGroup) {
        const lensWorld = new THREE.Vector3();
        if (this.spectrometerLens) {
          this.spectrometerLens.getWorldPosition(lensWorld);
        } else {
          this.spectrometerGroup.getWorldPosition(lensWorld);
        }
        const localLens = this.spectrometerGroup.worldToLocal(lensWorld);
        const localHit = this.spectrometerGroup.worldToLocal(hit.point.clone());

        const positions = this.spectrometerBeam.geometry.attributes.position;
        positions.setXYZ(0, localLens.x, localLens.y, localLens.z);
        positions.setXYZ(1, localHit.x, localHit.y, localHit.z);
        positions.needsUpdate = true;
        this.spectrometerBeam.material.opacity = this.isActivelyScanning ? 0.88 : 0.24;
      }

      // Analyze target and update HUD card & in-hand Science Tablet
      this.analyzeSpectrometerTarget(hit.object, dist);

    } else {
      this.lastSpectrometerDist = 0;
      if (this.spectrometerContactRing) this.spectrometerContactRing.visible = false;
      if (this.spectrometerBeam) this.spectrometerBeam.material.opacity = 0.0;
    }

    // Smooth periodic update of Science Tablet canvas (~20 fps)
    const now = performance.now();
    if (!this.lastTabletCanvasUpdate || now - this.lastTabletCanvasUpdate > 48) {
      this.lastTabletCanvasUpdate = now;
      this.updateScienceTabletCanvas();
    }
  }

  analyzeSpectrometerTarget(hitObj, dist) {
    if (!hitObj) return;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const artifact = this.currentArtifact;
    const body = (artifact && artifact.body) ? artifact.body.toLowerCase() : (this.currentBody || 'moon');

    let targetType = 'chassis'; // 'terrain', 'kapton', 'inconel', 'solar', 'engine', 'ladder', 'sample', 'chassis'

    // Check terrain first
    if (hitObj === this.terrain || (hitObj.parent && hitObj.parent === this.terrain)) {
      targetType = 'terrain';
    } else {
      let curr = hitObj;
      let depth = 0;
      while (curr && depth < 6) {
        if (curr.userData && curr.userData.interactive && curr.userData.interactive.isSample) {
          targetType = 'sample';
          break;
        }
        if (curr.geometry && (curr.geometry.type === 'ConeGeometry' || curr.geometry.type === 'CylinderGeometry') && curr.position.y < -1.0) {
          targetType = 'engine';
          break;
        }
        curr = curr.parent;
        depth++;
      }

      if (targetType === 'chassis') {
        const mat = Array.isArray(hitObj.material) ? hitObj.material[0] : hitObj.material;
        if (mat) {
          if (mat.bumpMap || (mat.color && mat.color.r > 0.8 && mat.color.g > 0.4 && mat.color.b < 0.3)) {
            targetType = 'kapton';
          } else if (mat.color && mat.color.b > 0.22 && mat.color.r < 0.25) {
            targetType = 'solar';
          } else if (mat.color && mat.color.r < 0.25 && mat.color.g < 0.25 && mat.color.b < 0.25) {
            targetType = 'inconel';
          } else if (hitObj.position && (hitObj.position.y < -0.8 || (hitObj.geometry && hitObj.geometry.type === 'TorusGeometry'))) {
            targetType = 'ladder';
          }
        }
      }
    }

    // Audio chirp when discovering a new surface type
    if (this.lastSpectrometerTarget !== targetType) {
      this.lastSpectrometerTarget = targetType;
      if (window.SpaceAudio) window.SpaceAudio.playSpectrometerAnalyzeChirp();
    }

    let data = {
      name: '',
      elems: [],
      diag: ''
    };

    if (targetType === 'terrain') {
      if (body === 'mars') {
        data = {
          name: isTr ? 'MARS MERİDİANİ BAZALTİK PAS KUMU' : 'MARTIAN BASALTIC FERRIC SOIL',
          elems: [
            { name: isTr ? 'Silika (SiO₂)' : 'Silicon Dioxide (SiO₂)', pct: '46.8%', barPct: 47 },
            { name: isTr ? 'Demir Oksit (Fe₂O₃ / Pas)' : 'Ferric Iron Oxide (Rust)', pct: '19.4%', barPct: 19 },
            { name: isTr ? 'Sülfat Tuzları (SO₃)' : 'Sulfates & Salts (SO₃)', pct: '13.5%', barPct: 14 },
            { name: isTr ? 'Kil & Alüminosilikat' : 'Clay Minerals', pct: '11.2%', barPct: 11 }
          ],
          diag: isTr
            ? 'Mevsimsel küresel fırtınalarla sürüklenen mikron altı demiroksit (pas) tozu. Opportunity ve Curiosity tekerlek izleri eoliyen kum rüzgarıyla yavaşça silinmektedir.'
            : 'Sub-micron ferric oxide dust transported by seasonal planet-wide storms. Opportunity and Curiosity tracks undergo gradual aeolian sand abrasion.'
        };
      } else if (body === 'venus') {
        data = {
          name: isTr ? 'VENÜS SÜPERKRİTİK BAZALT LAV PLATOSU' : 'VENUSIAN SUPERCRITICAL BASALT',
          elems: [
            { name: isTr ? 'Silikat Lav (SiO₂)' : 'Silicate Basalt (SiO₂)', pct: '48.6%', barPct: 49 },
            { name: isTr ? 'Kükürt Bileşikleri (S / FeS)' : 'Sulfur & Pyrite (FeS)', pct: '18.5%', barPct: 19 },
            { name: isTr ? 'Magnezyum Oksit (MgO)' : 'Magnesium Oxide (MgO)', pct: '14.2%', barPct: 14 },
            { name: isTr ? 'Titanyum Manyetit' : 'Titanomagnetite', pct: '9.4%', barPct: 9 }
          ],
          diag: isTr
            ? '467°C sıcaklık ve 93 atmosferlik süperkritik basınç altında pirolize uğramış lav kabuğu. Venera gövdesi bazalt kayasıyla kimyasal füzyona uğramıştır.'
            : 'Severe thermal sulfurization under 467°C heat and 93 bar supercritical CO2. Lander hulls have chemically fused into the basaltic bedrock.'
        };
      } else if (body === 'outer') {
        data = {
          name: isTr ? 'TİTAN ORGANİK THOLİN & SU BUZU' : 'TITAN CRYOGENIC WATER ICE & THOLIN',
          elems: [
            { name: isTr ? 'Katı Su Buzu (H₂O)' : 'Solid Water Ice (H₂O)', pct: '58.4%', barPct: 58 },
            { name: isTr ? 'Organik Tholin Pus (C-H-N)' : 'Photochemical Tholins', pct: '26.2%', barPct: 26 },
            { name: isTr ? 'Sıvı Hidrokarbon (CH₄)' : 'Liquid Hydrocarbons', pct: '12.1%', barPct: 12 },
            { name: isTr ? 'Amonyak Kristalleri' : 'Ammonia Hydrate', pct: '3.3%', barPct: 5 }
          ],
          diag: isTr
            ? '-179°C sıcaklıkta derin kriyojenik sabitleme. Metan gölleri kıyısında atmosferik fotokimyasal tholin aerosolleri enkaz üzerinde ince organik film tabakası oluşturmuştur.'
            : 'Deep cryogenic stasis at -179°C. Photochemical tholin haze settles as an organic patina across Huygens and cometary terrain.'
        };
      } else {
        // Moon Mare Tranquillitatis
        data = {
          name: isTr ? 'MARE TRANQUILLITATIS BAZALTİK AY REGOLİTİ' : 'BASALTIC LUNAR REGOLITH (MARE BASALT)',
          elems: [
            { name: isTr ? 'Silika (SiO₂)' : 'Silicon Dioxide (SiO₂)', pct: '45.4%', barPct: 45 },
            { name: isTr ? 'Alümina (Al₂O₃)' : 'Aluminum Oxide (Al₂O₃)', pct: '14.8%', barPct: 15 },
            { name: isTr ? 'Demir Oksit (FeO)' : 'Iron Oxide (FeO)', pct: '14.2%', barPct: 14 },
            { name: isTr ? 'Helyum-3 (He-3)' : 'Helium-3 Solar Implant', pct: '4.2 ppb', barPct: 28 }
          ],
          diag: isTr
            ? 'NASA LROC teyitli: Güneş rüzgarı partikülleri ve mikrometeorit akısı regoliti camsı aglütinatlara dönüştürmüştür. Armstrong ve Aldrin\'in tarihi bot izleri 55+ yıldır rüzgarsız ay ortamında bozulmadan korunmaktadır.'
            : 'NASA LROC verified: Solar wind particle bombardment and micrometeorite impacts have forged agglutinate glasses. Armstrong and Aldrin\'s bootprints remain pristinely preserved across 55+ years.'
        };
      }
    } else if (targetType === 'kapton') {
      data = {
        name: isTr ? 'APOLLO KAPTON MLI YALITIM FOLYOSU' : 'APOLLO KAPTON MLI THERMAL BLANKET',
        elems: [
          { name: isTr ? 'Poliimid Matris (C₂₂H₁₀N₂O₅)' : 'Polyimide Matrix (Kapton HN)', pct: '62.4%', barPct: 62 },
          { name: isTr ? 'Alüminyum Buhar Katmanı (Al)' : 'Vapor-Deposited Aluminum (Al)', pct: '28.5%', barPct: 29 },
          { name: isTr ? 'Silisyum Monoksit Kaplama' : 'Silicon Monoxide Passivation', pct: '6.8%', barPct: 10 },
          { name: isTr ? 'Fotoliz Bozulması / Karbon' : 'UV Photolysis Carbonization', pct: '2.3%', barPct: 6 }
        ],
        diag: isTr
          ? 'Güneşin filtresiz UV fotolizi altın poliimid tabakayı beyazlatarak alüminize gümüş alt tabakayı açığa çıkarmıştır. Yüzeyde mikrometeorit çarpma çukurları ve termal yorgunluk kırışıklıkları tespit edildi.'
          : 'NASA LROC verified: Unfiltered solar UV photolysis bleached the outer golden polyimide film, exposing silvery aluminized substrate. Heavy micro-cratering and thermal crinkling verified.'
      };
    } else if (targetType === 'inconel') {
      data = {
        name: isTr ? 'INCONEL 718 NİKEL-KROM ISI KALKANI' : 'INCONEL 718 SUPERALLOY HEAT SHIELD',
        elems: [
          { name: isTr ? 'Nikel (Ni)' : 'Nickel (Ni)', pct: '52.8%', barPct: 53 },
          { name: isTr ? 'Krom (Cr)' : 'Chromium (Cr)', pct: '19.1%', barPct: 19 },
          { name: isTr ? 'Demir (Fe)' : 'Iron (Fe)', pct: '18.2%', barPct: 18 },
          { name: isTr ? 'Niyobyum & Molibden' : 'Niobium & Molybdenum', pct: '8.4%', barPct: 12 }
        ],
        diag: isTr
          ? 'Descent Propulsion System (DPS) roket alevinin 1400°C ısısına dayanmış nikel süperalaşımı. Korozyon ve oksidasyon sıfıra yakın; uzay boşluğunda yapısal sertliğini milyonlarca yıl koruyacaktır.'
          : 'Superalloy engineered to withstand 1400°C rocket plumes. Zero oxidation in space vacuum; structural tensile integrity will endure for millennia.'
      };
    } else if (targetType === 'solar') {
      data = {
        name: isTr ? 'FOTOVOLTAJİK GÜNEŞ PANELİ HÜCRELERİ' : 'PHOTOVOLTAIC SOLAR ARRAY CELLS',
        elems: [
          { name: isTr ? 'Tek Kristal Silikon (Si)' : 'Monocrystalline Silicon (Si)', pct: '72.6%', barPct: 73 },
          { name: isTr ? 'Galyum Arsenit (GaAs)' : 'Gallium Arsenide (GaAs)', pct: '18.2%', barPct: 18 },
          { name: isTr ? 'Bor & Fosfor İletkenler' : 'Boron/Phosphorus Dopants', pct: '3.4%', barPct: 8 },
          { name: isTr ? 'Yüzey Toz Tutunumu' : 'Regolith Dust Obstruction', pct: '5.8%', barPct: 12 }
        ],
        diag: isTr
          ? 'Mikrometeorit mikro-pitting kratercikleri ve elektrostatik toz örtüsü foton geçirgenliğini azaltmıştır. Mars roverlarında (Opportunity/Spirit) rüzgarla taşınan pas tozu yüzeyi tamamen kaplamıştır.'
          : 'Micrometeorite pitting and electrostatic dust deposition have choked photon transmission. On Mars rovers, ferric oxide dust blankets have fully extinguished photovoltaic conversion.'
      };
    } else if (targetType === 'engine') {
      data = {
        name: isTr ? 'AEROJET TRW DPS İNİŞ MOTORU ÇANI' : 'AEROJET TRW DESCENT ROCKET NOZZLE',
        elems: [
          { name: isTr ? 'Niyobyum-Titanyum Alaşımı' : 'Niobium-Titanium Alloy', pct: '58.4%', barPct: 58 },
          { name: isTr ? 'Bakır Isı Radyatörü (Cu)' : 'Copper Heat Radiator (Cu)', pct: '28.6%', barPct: 29 },
          { name: isTr ? 'Karbon-Grafit Boğaz Astarı' : 'Carbon-Graphite Throat Liner', pct: '9.8%', barPct: 12 },
          { name: isTr ? 'Aerozin-50 Yanma Kalıntısı' : 'Aerozine-50 Plume Residue', pct: '3.2%', barPct: 8 }
        ],
        diag: isTr
          ? 'Ay yüzeyine yumuşak iniş sağlayan kısılabilir roket nozulu. Yanma egzozunun radyal püskürme izleri iniş bölgesindeki regolitin üst katmanında hala belirgindir.'
          : 'Throttleable lunar descent engine bell. Thruster plume radial blast scars are visibly etched into the upper regolith bedding surrounding the landing pad.'
      };
    } else if (targetType === 'ladder') {
      data = {
        name: isTr ? 'TİTANYUM İNİŞ AYAĞI VE APOLLO MERDİVENİ' : 'TITANIUM STRUT & HISTORIC APOLLO LADDER',
        elems: [
          { name: isTr ? 'Ti-6Al-4V Havacılık Titanyumu' : 'Ti-6Al-4V Grade 5 Titanium', pct: '64.2%', barPct: 64 },
          { name: isTr ? '7075-T6 Uçak Alüminyumu' : '7075-T6 Aerospace Aluminum', pct: '24.8%', barPct: 25 },
          { name: isTr ? '304L Paslanmaz Çelik' : '304L Stainless Steel Plaque', pct: '8.5%', barPct: 11 },
          { name: isTr ? 'Ezilme Petek Sönümleyicisi' : 'Crushable Honeycomb Core', pct: '2.5%', barPct: 6 }
        ],
        diag: isTr
          ? 'Neil Armstrong\'un Ay yüzeyine ilk adımı attığı tarihi EVA merdiveni. Basamaklar arasındaki paslanmaz çelik Apollo 11 plaketi ("Here men from the planet Earth first set foot upon the Moon...") lekesiz korunmaktadır.'
          : 'Historic ladder used by Neil Armstrong during the first human lunar EVA. The stainless steel Apollo 11 commemorative plaque mounted between rungs remains perfectly preserved.'
      };
    } else if (targetType === 'sample') {
      data = {
        name: isTr ? 'ALSEP / JEOLOJİK NUMUNE KAPSÜLÜ' : 'ALSEP / GEOLOGICAL SAMPLE CAPSULE',
        elems: [
          { name: isTr ? 'Titanyum Numune Kabı (Grade 5)' : 'Grade 5 Titanium Canister', pct: '78.4%', barPct: 78 },
          { name: isTr ? 'Hermetik İndiyum Contası' : 'Hermetic Indium Seal', pct: '12.5%', barPct: 13 },
          { name: isTr ? 'Anortozit "Genesis" Kristalleri' : 'Anorthosite "Genesis" Crystals', pct: '6.1%', barPct: 9 },
          { name: isTr ? 'Güneş Rüzgarı Gaz Kapanı' : 'Trapped Solar Wind Volatiles', pct: '3.0%', barPct: 6 }
        ],
        diag: isTr
          ? 'Astronotlar tarafından yüzeyden toplanan ilksel ay kabuğu parçaları; güneş sisteminin 4.5 milyar yıllık jeolojik geçmişini ve erken çarpma kraterleşme tarihini barındırır.'
          : 'Pristine lunar crustal samples collected by astronauts; encapsulating 4.5 billion years of early solar system bombardment history.'
      };
    } else {
      // Default: Aerospace chassis
      data = {
        name: isTr ? 'HAVACILIK GÖVDE PANELİ VE BİLEŞENLERİ' : 'AEROSPACE CHASSIS & STRUCTURAL PANELS',
        elems: [
          { name: isTr ? 'Al-Li 2195 Alüminyum-Lityum' : 'Al-Li 2195 Aluminum-Lithium', pct: '68.4%', barPct: 68 },
          { name: isTr ? 'Magnezyum-Toryum Alaşımı' : 'Magnesium-Thorium Alloy', pct: '18.2%', barPct: 18 },
          { name: isTr ? 'Altın Kaplama İletkenler (Au)' : 'Gold-Plated Telemetry Connectors', pct: '8.1%', barPct: 10 },
          { name: isTr ? 'Floropolimer Yalıtım' : 'Fluoropolymer Wire Insulation', pct: '5.3%', barPct: 8 }
        ],
        diag: isTr
          ? 'Düşük kütleli alaşımlardan imal edilmiş havacılık strüktürü. Termal battaniyeler altında vakum ortamında mükemmel korunmuştur.'
          : 'Low-mass aerospace structural alloys. Sealed beneath thermal blankets, preserved in pristine condition within the deep space vacuum.'
      };
    }

    // Update DOM
    const targetNameEl = document.getElementById('spec-target-name');
    const targetMetaEl = document.getElementById('spec-target-meta');
    const diagDescEl = document.getElementById('spec-diag-desc');

    if (targetNameEl) targetNameEl.innerText = data.name;
    if (targetMetaEl) {
      targetMetaEl.innerText = isTr
        ? `Mesafe: ${dist.toFixed(2)} m • Tarama Açısı: 12°`
        : `Range: ${dist.toFixed(2)} m • Scan Angle: 12°`;
    }
    if (diagDescEl) diagDescEl.innerText = data.diag;

    for (let i = 1; i <= 4; i++) {
      const eNameEl = document.getElementById(`elem-name-${i}`);
      const eFillEl = document.getElementById(`elem-fill-${i}`);
      const ePctEl = document.getElementById(`elem-pct-${i}`);
      const item = data.elems[i - 1];
      if (item) {
        if (eNameEl) eNameEl.innerText = item.name;
        if (eFillEl) eFillEl.style.width = `${item.barPct}%`;
        if (ePctEl) ePctEl.innerText = item.pct;
      }
    }

    this.lastSpectrometerTargetData = data;
    this.lastSpectrometerDist = dist;
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

    if (this.cameraMode === 'walk') {
      this.updateSpectrometer(dt);
    }

    if (this.controls && this.cameraMode === 'free' && !this.renderer.xr.isPresenting) {
      this.controls.update();
    }

    if (this.heritageBoundaryGroup) {
      const bOsc = Math.sin(this.simTime * 2.5);
      this.heritageBoundaryGroup.traverse(child => {
        if (child.isMesh && child.geometry && child.geometry.type === 'SphereGeometry') {
          child.scale.setScalar(1.0 + bOsc * 0.16);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateSimulationPhysics(t, dt) {
    const artifact = this.currentArtifact;
    if (!artifact || !this.spacecraft) return;

    const isApolloLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(artifact.id);
    const descentOffset = this.getDescentOffset(t);
    const showWalkCabin = isApolloLM && (this.cameraMode === 'walk' || t >= 5.8);
    if (this.walkableInteriorGroup) {
      this.walkableInteriorGroup.visible = showWalkCabin;
      this.walkableInteriorGroup.position.y = descentOffset;
    }
    if (this.dummyAscentSolidGroup) {
      this.dummyAscentSolidGroup.visible = isApolloLM && !showWalkCabin;
    }

    // Live Cockpit Avionics & Window Dust Plumes while descending in Walk Mode (t < 5.8)
    if (this.cameraMode === 'walk' && isApolloLM) {
      if (t < 5.8) {
        if (!this.lastCockpitTick || t - this.lastCockpitTick > 0.45) {
          this.lastCockpitTick = t;
          if (this.cabinState) {
            this.cabinState.prog = t < 3.0 ? '64' : '66';
            this.cabinState.throttlePct = Math.max(18, Math.round(85 - (t / 5.8) * 65));
            this.cabinState.r1 = '+' + String(Math.round(descentOffset * 10)).padStart(5, '0');
            this.cabinState.r2 = '-' + String(Math.round((descentOffset / 5.8) * 16 + 2)).padStart(5, '0');
            this.generateDSKYTexture(this.currentArtifact);
          }
        }
        // Throttled thruster plume & regolith dust flying past front cockpit windows (-Z)
        if (Math.random() < 0.20) {
          const winDustPos = new THREE.Vector3(
            (Math.random() - 0.5) * 4.5,
            descentOffset + 2.2,
            -2.8 - Math.random() * 2.5
          );
          const winDustVel = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            10 + Math.random() * 8,
            -6 - Math.random() * 8
          );
          const col = descentOffset < 22
            ? (artifact.body === 'venus' ? 0xd97706 : artifact.body === 'mars' ? 0xc45c2c : 0xcbd5e1)
            : 0x93c5fd;
          this.createParticle(winDustPos, winDustVel, col, 0.45, 0.22);
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
        this.spacecraft.position.set(0, 1.8 + descentOffset, 0);
        this.spacecraft.rotation.set(0.1, 0.4, Math.PI * 0.46);
      } else if (t < 3.2) {
        const progress = t / 3.2;
        this.spacecraft.position.x = -75 + progress * 75;
        this.spacecraft.position.y = 100 - progress * 98.2;
        this.spacecraft.position.z = 0;

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
        this.spacecraft.position.set(0, 1.8, 0);
        this.spacecraft.rotation.set(0.1, 0.4, Math.PI * 0.46);
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
      const isApolloCrewedLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(artifact.id);
      let targetRestY = 0.0;
      if (isApolloCrewedLM) {
        targetRestY = 3.2;
      } else if (artifact.id === 'pioneer-venus-day') {
        targetRestY = 0.0;
      } else if (artifact.body === 'venus') {
        targetRestY = 2.85;
      } else if (artifact.id === 'cassini-huygens') {
        targetRestY = 2.1;
      } else {
        targetRestY = 0.0;
      }

      if (t < 5.8) {
        const currentY = targetRestY + descentOffset;
        this.spacecraft.position.y = currentY;

        if (this.engineLight) {
          this.engineLight.intensity = 4.5 + Math.random() * 2.5;
        }
        if (this.exhaustPlume) {
          this.exhaustPlume.visible = true;
          this.exhaustPlume.scale.set(1.0 + Math.random() * 0.2, 1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.2);
          this.exhaustPlume.material.opacity = 0.5 + Math.random() * 0.3;

          if (Math.random() < 0.35) {
            const exhaustPos = this.spacecraft.position.clone().add(new THREE.Vector3(0, -2.6, 0));
            this.createParticle(
              exhaustPos,
              new THREE.Vector3((Math.random() - 0.5) * 2.5, -28 - Math.random() * 14, (Math.random() - 0.5) * 2.5),
              0xd0e8ff,
              0.4
            );
          }
        }

        if (currentY < 24 && Math.random() < 0.35) {
          const intensity = (24 - currentY) / 24;
          const dustOrigin = new THREE.Vector3((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8);
          const dustVel = new THREE.Vector3(
            (Math.random() - 0.5) * 20 * intensity,
            Math.random() * 6 * intensity,
            (Math.random() - 0.5) * 20 * intensity
          );
          this.createParticle(dustOrigin, dustVel, artifact.body === 'venus' ? 0xd97706 : 0x9ca3af, 1.4);
        }
      } else {
        this.spacecraft.position.y = targetRestY;
        if (this.engineLight) this.engineLight.intensity = 0;
        if (this.exhaustPlume) this.exhaustPlume.visible = false;
        if (t < 6.1 && !this.touchdownConfirmed) {
          this.shakeIntensity = 0.8;
        }
      }
    }

    // Zero-GC Pooled Particle Updates
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.mesh.visible = false;
        this.particles.splice(i, 1);
        if (this.particlePool) this.particlePool.push(p);
      } else {
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 9.8 * 0.22 * dt;
        p.mesh.material.opacity = Math.max(0, (p.life / p.maxLife) * 0.88);
      }
    }
  }

  // Pre-allocated Particle Pool (Zero Garbage Collection, Zero Frame Drops on Mobile/WebXR!)
  initParticlePool() {
    if (this.particles && this.particles.length > 0) {
      this.particles.forEach(p => {
        if (p.mesh) {
          this.scene.remove(p.mesh);
          if (p.mesh.geometry) p.mesh.geometry.dispose();
          if (p.mesh.material) p.mesh.material.dispose();
        }
      });
    }
    this.particles = [];
    this.particlePool = [];
    if (!this.sharedParticleGeo) {
      this.sharedParticleGeo = new THREE.SphereGeometry(0.25, 4, 4);
    }
    for (let i = 0; i < 55; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(this.sharedParticleGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particlePool.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1
      });
    }
  }

  createParticle(position, velocity, color, maxLife, radius = 0.38) {
    if (!this.particlePool || this.particlePool.length === 0) {
      if (this.particles && this.particles.length > 0) {
        const oldest = this.particles.shift();
        this.particlePool.push(oldest);
      } else {
        return;
      }
    }
    const p = this.particlePool.pop();
    p.mesh.position.copy(position);
    p.velocity.copy(velocity);
    p.life = maxLife;
    p.maxLife = maxLife;
    const s = Math.max(0.2, (radius / 0.38) * (0.8 + Math.random() * 0.4));
    p.mesh.scale.set(s, s, s);
    p.mesh.material.color.set(color);
    p.mesh.material.opacity = 0.88;
    p.mesh.visible = true;
    this.particles.push(p);
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
  // REALISTIC ASTRONAUT WALKING, META QUEST CONTROLLERS, ARM-SWING & ROVER DRIVE
  // ===========================================================================
  updateAstronautWalk(dt) {
    const ws = this.walkState;
    ws.breathPhase += dt * 1.65;
    const speed = ws.isDrivingRover ? 10.5 : (ws.isInsideCabin ? 2.6 : 4.8);
    let moveForward = 0;
    let moveRight = 0;

    if (ws.keys.w) moveForward += 1;
    if (ws.keys.s) moveForward -= 1;
    if (ws.keys.d) moveRight += 1;
    if (ws.keys.a) moveRight -= 1;

    // =========================================================================
    // META QUEST 3S TOUCH PLUS CONTROLLER MAPPING (WebXR "xr-standard" gamepad)
    //  buttons[0] Trigger | [1] Grip | [3] Thumbstick click | [4] A / X | [5] B / Y
    //  axes[2], axes[3] = Thumbstick X / Y
    // =========================================================================
    const isXR = !!(this.renderer && this.renderer.xr && this.renderer.xr.isPresenting);
    let gripHeldL = false;
    let gripHeldR = false;
    let sprintHeld = false;
    if (isXR && this.xrSession && this.xrSession.inputSources) {
      if (!this.xrSnap) this.xrSnap = { armed: true };
      for (const source of this.xrSession.inputSources) {
        const gp = source.gamepad;
        if (!gp) continue; // hand-tracking sources use pinch -> 'selectstart' only
        const hand = source.handedness === 'left' ? 'left' : 'right';
        const prevBtns = this.xrButtonPrev[hand] || [];
        const axes = gp.axes || [];
        const axX = axes.length >= 4 ? (axes[2] || 0) : (axes[0] || 0);
        const axY = axes.length >= 4 ? (axes[3] || 0) : (axes[1] || 0);
        const btns = gp.buttons || [];
        const isPressed = (i) => !!(btns[i] && (btns[i].pressed || btns[i].value > 0.6));
        const justPressed = (i) => isPressed(i) && !prevBtns[i];
        const deadzone = 0.15;

        if (hand === 'left') {
          // LEFT STICK: analog walk toward headset gaze direction
          const mag = Math.hypot(axX, axY);
          if (mag > deadzone) {
            const scaled = (Math.min(1, mag) - deadzone) / (1 - deadzone);
            moveForward += (-axY / mag) * scaled;
            moveRight += (axX / mag) * scaled;
          }
          if (isPressed(1)) gripHeldL = true;
          if (isPressed(3)) sprintHeld = true;          // Left stick click (hold): sprint
          if (justPressed(4)) this.handleQuestFaceButton('X');
          if (justPressed(5)) this.handleQuestFaceButton('Y');
        } else {
          // RIGHT STICK: 30° comfort snap turn (re-arms when stick returns to center)
          if (this.xrSnap.armed && Math.abs(axX) > 0.68) {
            ws.yaw -= Math.sign(axX) * (Math.PI / 6);
            ws.smoothYaw = ws.yaw;
            this.xrSnap.armed = false;
            this.pulseXRHaptics(0.25, 18, 'right');
          } else if (Math.abs(axX) < 0.3) {
            this.xrSnap.armed = true;
          }
          if (isPressed(1)) gripHeldR = true;
          if (justPressed(3)) {                         // Right stick click: torch
            this.pulseXRHaptics(0.4, 30, 'right');
            this.toggleFlashlight();
          }
          if (justPressed(4)) this.handleQuestFaceButton('A');
          if (justPressed(5)) this.handleQuestFaceButton('B');
        }
        this.xrButtonPrev[hand] = btns.map((_, i) => isPressed(i));
      }
    }

    // If driving the LRV Moon Buggy, run dedicated vehicle physics and skip foot walking
    if (ws.isDrivingRover) {
      this.updateRoverDrivingPhysics(dt, isXR);
      const dist = Math.hypot(ws.x, ws.z).toFixed(1);
      const distEl = document.getElementById('walk-hud-dist');
      if (distEl) distEl.innerText = `${dist} m`;
      return;
    }

    // ARM-SWING LOCOMOTION: hold Grip on a hand and swing that arm to walk forward
    if (isXR && this.xrControllers) {
      let swingVel = 0;
      for (let i = 0; i < this.xrControllers.length; i++) {
        const ctrl = this.xrControllers[i];
        if (!ctrl) continue;
        const h = ctrl.userData ? ctrl.userData.handedness : null;
        const held = h === 'left' ? gripHeldL : (h === 'right' ? gripHeldR : false);
        if (!this.xrControllerPosInit[i]) {
          this.xrControllerPrevPos[i].copy(ctrl.position);
          this.xrControllerPosInit[i] = true;
          continue;
        }
        const vy = Math.abs(ctrl.position.y - this.xrControllerPrevPos[i].y) / Math.max(0.008, dt);
        const vz = Math.abs(ctrl.position.z - this.xrControllerPrevPos[i].z) / Math.max(0.008, dt);
        this.xrControllerPrevPos[i].copy(ctrl.position);
        if (held) swingVel += vy + vz * 0.5;
      }
      if (swingVel > 0.35) {
        moveForward += Math.min(1.0, (swingVel - 0.35) * 0.9);
      }
    }

    // ROOM-SCALE REAL WALKING: physical headset movement in the play area moves the astronaut
    // through the same collision system (cannot walk through walls, tables or closed doors).
    let physDX = 0;
    let physDZ = 0;
    if (isXR) {
      const hp = this.camera.position; // local head pose relative to cameraRig (updated by WebXR)
      if (!this.xrHeadPrev) {
        this.xrHeadPrev = new THREE.Vector3(hp.x, hp.y, hp.z);
      } else {
        const ldx = hp.x - this.xrHeadPrev.x;
        const ldz = hp.z - this.xrHeadPrev.z;
        this.xrHeadPrev.copy(hp);
        if (Math.hypot(ldx, ldz) < 0.5 && !ws.isDrivingRover) {
          const cy = Math.cos(ws.smoothYaw);
          const sy = Math.sin(ws.smoothYaw);
          physDX = ldx * cy + ldz * sy;
          physDZ = -ldx * sy + ldz * cy;
        }
      }
      if (this.vrHelpNeedsPlace && this.vrHelpPanel) {
        this.placeVRHelpPanel();
        this.vrHelpNeedsPlace = false;
      }
    }

    // Check physical 3D VR hand proximity touch against all cabin buttons, hatch wheel & rock samples
    this.checkVRHandProximityTouch(dt);

    // Smoothly damp mouse-look rotation without any angle wrapping or gimbal lock
    if (ws.smoothYaw === undefined) ws.smoothYaw = ws.yaw;
    if (ws.smoothPitch === undefined) ws.smoothPitch = ws.pitch;
    const lookLerp = Math.min(1, dt * 18.0);
    ws.smoothYaw += (ws.yaw - ws.smoothYaw) * lookLerp;
    ws.smoothPitch += (ws.pitch - ws.smoothPitch) * lookLerp;
    // Guarantee pitch stays within safe human neck range (±58 deg)
    ws.smoothPitch = Math.max(-1.01, Math.min(1.01, ws.smoothPitch));

    // In WebXR VR Headset, align movement with the real headset gaze direction (WORLD space,
    // so it stays correct after snap-turning the cameraRig).
    let effectiveMoveYaw = ws.smoothYaw;
    if (isXR) {
      if (!this._xrGazeDir) this._xrGazeDir = new THREE.Vector3();
      this.camera.getWorldDirection(this._xrGazeDir);
      if (Math.hypot(this._xrGazeDir.x, this._xrGazeDir.z) > 0.05) {
        effectiveMoveYaw = Math.atan2(-this._xrGazeDir.x, -this._xrGazeDir.z);
      }
    }

    const forwardX = -Math.sin(effectiveMoveYaw);
    const forwardZ = -Math.cos(effectiveMoveYaw);
    const rightX = Math.cos(effectiveMoveYaw);
    const rightZ = -Math.sin(effectiveMoveYaw);

    const stickLen = Math.hypot(moveForward, moveRight);
    const physLen = Math.hypot(physDX, physDZ);
    const isMoving = stickLen > 0.01 || physLen > 0.0008;

    // Smooth acceleration / deceleration blend factor
    if (ws.moveBlend === undefined) ws.moveBlend = 0;
    const targetBlend = stickLen > 0.01 ? 1.0 : 0.0;
    ws.moveBlend += (targetBlend - ws.moveBlend) * Math.min(1, dt * 7.5);

    const cabinFloorY = 4.5;
    const descentOffset = this.getDescentOffset(this.simTime);
    const isDescending = this.simTime < 5.8;
    const groundY0 = this.getExactSurfaceHeight(0, 6.85);
    const isTr = window.app ? window.app.currentLang === 'tr' : false;
    const cabinBtn = document.getElementById('btn-walk-cabin');
    const isApolloLM = ['apollo-11', 'apollo-12-surveyor', 'apollo-14-fra-mauro', 'apollo-15-hadley', 'apollo-16-descartes', 'apollo-17-taurus'].includes(this.currentArtifact ? this.currentArtifact.id : '');

    // Smoothly animate BOTH Doors of the Dual-Door Pressurized Airlock System:
    // • Door #1 (Inner Cabin Bulkhead Dual-Leaf Door at z = 1.65) + Inner Blue Valve Wheel
    // • Door #2 (Outer EVA Vacuum Dual-Leaf Armored Hatch at z = 2.68) + Outer Red Valve Wheel
    if (this.cabinState) {
      // 1. Inner Airlock Door (#1)
      const targetInner = this.cabinState.innerHatchOpen ? 1.0 : 0.0;
      const diffInner = targetInner - (this.cabinState.innerHatchProgress || 0);
      if (Math.abs(diffInner) > 0.001) {
        this.cabinState.innerHatchProgress = (this.cabinState.innerHatchProgress || 0) + Math.sign(diffInner) * Math.min(Math.abs(diffInner), dt * 1.85);
      } else {
        this.cabinState.innerHatchProgress = targetInner;
      }
      const ip = this.cabinState.innerHatchProgress || 0;
      if (this.innerHatchWheel) {
        this.innerHatchWheel.rotation.z = ip * Math.PI * 3.5;
      }
      const innerSwing = Math.max(0, (ip - 0.12) / 0.88) * (Math.PI * 0.66);
      if (this.innerDoorLeftPivot) this.innerDoorLeftPivot.rotation.y = innerSwing;
      if (this.innerDoorRightPivot) this.innerDoorRightPivot.rotation.y = -innerSwing;
      if (this.innerHatchStatusLamp && this.innerHatchStatusLamp.material) {
        this.innerHatchStatusLamp.material.color.setHex(
          isDescending ? 0xef4444 : (this.cabinState.innerHatchOpen ? 0x10b981 : 0xf59e0b)
        );
      }

      // 2. Outer EVA Airlock Door (#2)
      const targetOuter = this.cabinState.outerHatchOpen ? 1.0 : 0.0;
      const diffOuter = targetOuter - (this.cabinState.outerHatchProgress || 0);
      if (Math.abs(diffOuter) > 0.001) {
        this.cabinState.outerHatchProgress = (this.cabinState.outerHatchProgress || 0) + Math.sign(diffOuter) * Math.min(Math.abs(diffOuter), dt * 1.85);
      } else {
        this.cabinState.outerHatchProgress = targetOuter;
      }
      const op = this.cabinState.outerHatchProgress || 0;
      this.cabinState.hatchProgress = op;
      if (this.hatchWheel) {
        this.hatchWheel.rotation.z = op * Math.PI * 3.5;
      }
      const outerSwing = Math.max(0, (op - 0.12) / 0.88) * (Math.PI * 0.68);
      if (this.outerDoorLeftPivot) this.outerDoorLeftPivot.rotation.y = outerSwing;
      if (this.outerDoorRightPivot) this.outerDoorRightPivot.rotation.y = -outerSwing;
      if (this.hatchStatusLamp && this.hatchStatusLamp.material) {
        this.hatchStatusLamp.material.color.setHex(
          isDescending ? 0xef4444 : (this.cabinState.outerHatchOpen ? 0x10b981 : 0xf59e0b)
        );
      }
      if (this.airlockLight) {
        this.airlockLight.color.setHex(
          isDescending ? 0xef4444 : (this.cabinState.outerHatchOpen || this.cabinState.innerHatchOpen ? 0x10b981 : 0xf59e0b)
        );
      }
    }

    if (ws.handReachTimer && ws.handReachTimer > 0) {
      ws.handReachTimer = Math.max(0, ws.handReachTimer - dt);
    }

    // Always enforce cabin table & wall collision when inside the cabin, even when stationary!
    if (ws.isInsideCabin) {
      const safeNow = this.resolveCabinCollision(ws.x, ws.z);
      ws.x = safeNow.x;
      ws.z = safeNow.z;
    }

    if (isMoving) {
      // Analog stick magnitude (Quest thumbstick) + optional sprint; physical room-scale delta added on top
      const stickMag = Math.min(1, stickLen);
      let nx;
      let nz;
      if (stickLen > 0.01) {
        nx = (forwardX * moveForward + rightX * moveRight) / stickLen;
        nz = (forwardZ * moveForward + rightZ * moveRight) / stickLen;
      } else {
        nx = physDX / (physLen || 1);
        nz = physDZ / (physLen || 1);
      }
      const moveSpeed = speed * (sprintHeld && !ws.isInsideCabin && !ws.isOnLadder ? 1.7 : 1.0);
      const stickStep = stickLen > 0.01 ? moveSpeed * stickMag * dt : 0;

      const candidateX = ws.x + nx * stickStep + physDX;
      const candidateZ = ws.z + nz * stickStep + physDZ;
      const candidateDist = Math.hypot(candidateX, candidateZ);

      // 1. Check if astronaut is inside the Pressurized Spacecraft Cabin or Dual-Door Airlock Chamber
      if (ws.isInsideCabin) {
        // STEP A: Approaching Inner Airlock Door #1 (z = 1.65) from inside the Main Cabin
        if (ws.z < 1.65 && candidateZ > 1.25 && Math.abs(candidateX) < 0.62 && !this.cabinState.innerHatchOpen) {
          this.triggerInnerAirlockDoor(false);
        }

        // STEP B: Fully inside the Airlock Chamber (z >= 1.76) approaching Outer EVA Door #2 (z = 2.68):
        // Obeys the NASA Airlock Interlock Rule: Only seals Inner Door #1 once the astronaut has cleared the z = 1.65 doorway!
        if (ws.z >= 1.76 && candidateZ > 2.05 && Math.abs(candidateX) < 0.56 && !this.cabinState.outerHatchOpen) {
          this.triggerOuterAirlockDoor(false);
        }

        // STEP C: Returning from Airlock Chamber (z >= 1.76) toward Main Cabin (-Z) when Inner Door #1 is closed:
        if (ws.z >= 1.76 && candidateZ < 2.05 && nz < -0.1 && !this.cabinState.innerHatchOpen) {
          this.triggerInnerAirlockDoor(false);
        }

        const outerReadyToStepOut = !isDescending && this.cabinState && (this.cabinState.outerHatchProgress || 0) >= 0.72;

        // If Outer Door #2 has physically swung open (>= 72%) and astronaut walks naturally past z > 2.72,
        // step continuously onto the flat EVA Porch (zero position snap/teleport!)
        if (outerReadyToStepOut && candidateZ > 2.72 && Math.abs(candidateX) < 0.52) {
          ws.isInsideCabin = false;
          ws.isOnLadder = true;
          ws.x = Math.max(-0.46, Math.min(0.46, candidateX));
          ws.z = candidateZ;
          if (cabinBtn) {
            cabinBtn.classList.remove('active');
            cabinBtn.innerText = isTr ? '🚪 Hava Kilidi Kapısını Aç / Kapat (E)' : '🚪 Open / Close Airlock Door (E)';
          }
          this.updateVRGameMiniPill(isTr ? '2. Dış Kapıdan EVA Balkonuna Çıkıldı — Merdivenden İnin!' : 'Stepped Onto EVA Porch — Walk Down Ladder!');
        } else {
          // Resolve strict collision against Console Desk (z >= -0.98), Center Pedestal, Cabin Walls & Airlock Doors!
          const resolved = this.resolveCabinCollision(candidateX, candidateZ);
          ws.x = resolved.x;
          ws.z = resolved.z;
        }
      } else if (ws.isDrivingRover) {
        // Driving the LRV Moon Buggy across the planetary surface!
        if (candidateDist > 5.8 && candidateDist < 125) {
          ws.x = candidateX;
          ws.z = candidateZ;
          if (this.lrvPropGroup) {
            const ry = this.getExactSurfaceHeight(ws.x, ws.z);
            this.lrvPropGroup.position.set(ws.x, ry + 0.38, ws.z);
            this.lrvPropGroup.rotation.y = Math.atan2(nx, nz);
          }
          if (this.lrvWheels) {
            this.lrvWheels.forEach((w) => { w.rotation.x += speed * dt * 2.2; });
          }
          if (Math.random() < 0.55) {
            this.spawnBootDust(ws.x - nx * 1.4, ws.z - nz * 1.4, 3);
          }
          if (window.SpaceAudio) window.SpaceAudio.setRoverMotorHum(true, 1.0);
        }
      } else {
        // 2. Check if astronaut is in the Exterior Boarding Ladder & Flat EVA Porch Corridor (|x| < 0.90, z between 2.65 and 6.95)
        const inLadderCorridor = isApolloLM && Math.abs(candidateX) < 0.90 && candidateZ >= 2.65 && candidateZ <= 6.95;
        if (inLadderCorridor) {
          ws.isOnLadder = true;
          ws.x = Math.max(-0.48, Math.min(0.48, candidateX));

          const outerOpenEnough = !isDescending && this.cabinState && (this.cabinState.outerHatchProgress || 0) >= 0.72;

          // Approaching Outer Door #2 (z = 2.68) on the EVA Porch while moving toward -Z:
          if (candidateZ < 3.35 && nz < -0.1 && !this.cabinState.outerHatchOpen) {
            this.triggerOuterAirlockDoor(false);
          }

          if (!outerOpenEnough && candidateZ < 2.82) {
            // Solidly block the astronaut outside Outer Door #2 until the door leaves physically swing open!
            ws.z = Math.max(2.82, ws.z);
          } else if (outerOpenEnough && candidateZ <= 2.72) {
            // Smoothly walk across the threshold of open Outer Door #2 into the Airlock Chamber (zero teleport/snap!)
            ws.isInsideCabin = true;
            ws.isOnLadder = false;
            ws.z = candidateZ;
            ws.y = cabinFloorY + descentOffset;
            if (cabinBtn) {
              cabinBtn.classList.add('active');
              cabinBtn.innerText = isTr ? '🚪 Hava Kilidi Kapısını Aç / Kapat (E)' : '🚪 Open / Close Airlock Door (E)';
            }
            this.updateVRGameMiniPill(isTr ? '2. Dış Kapıdan Hava Kilidi Odasına Girildi' : 'Stepped Inside Airlock Decompression Chamber');
          } else {
            ws.z = candidateZ;
          }
        } else {
          if (ws.isOnLadder) {
            this.updateVRGameMiniPill(isTr ? 'Gezegen Yüzeyine İnildi — Numuneleri Toplayın!' : 'On Planetary Surface — Collect Samples!');
          }
          ws.isOnLadder = false;

          const curProfile = this.getVehicleSurfaceProfile(ws.x, ws.z);
          const candProfile = this.getVehicleSurfaceProfile(candidateX, candidateZ);

          // Is the astronaut jumping, climbing, or walking on top of the spacecraft / rover deck?
          const isAtDeckElevation = ws.y >= (curProfile.deckY - 0.35) || ws.y >= (candProfile.deckY - 0.35);
          const isWalkingOnVehicleDeck = isAtDeckElevation && (curProfile.isWalkableDeck || candProfile.isWalkableDeck);

          if (isWalkingOnVehicleDeck) {
            // Free, smooth 360-degree walking across spacecraft tops, solar decks and chassis without any freezing!
            const dCand = Math.hypot(candidateX, candidateZ);
            if (dCand < 120) {
              ws.x = candidateX;
              ws.z = candidateZ;
            }
          } else {
            // Ground-level obstacle collision: smoothly slide around hull perimeter rather than freezing!
            const hullRadius = candProfile.radius || 2.5;
            let finalX = candidateX;
            let finalZ = candidateZ;
            const curDist = Math.hypot(candidateX, candidateZ);

            if (curDist < hullRadius) {
              if (curDist > 0.001) {
                // Smooth tangent sliding projection (never gets stuck inside or locked)
                finalX = (candidateX / curDist) * hullRadius;
                finalZ = (candidateZ / curDist) * hullRadius;
              } else {
                finalZ = hullRadius;
              }
            }

            const finalDist = Math.hypot(finalX, finalZ);
            if (finalDist < 120) {
              ws.x = finalX;
              ws.z = finalZ;
            }
          }
        }
      }

      ws.stepPhase += dt * (ws.isInsideCabin ? 5.2 : 6.4);

      // Dynamic Procedural Footsteps across Cabin Deck, EVA Ladder, Vehicle Deck & Lunar Regolith:
      const stepInterval = Math.PI * 0.72;
      const stepIndex = Math.floor(ws.stepPhase / stepInterval);
      if (stepIndex > ws.lastStepCount && ws.isGrounded && !ws.isDrivingRover) {
        ws.lastStepCount = stepIndex;
        const isLeftFoot = (stepIndex % 2 === 0);
        if (ws.isInsideCabin) {
          if (window.SpaceAudio) window.SpaceAudio.playDeckStep();
          this.pulseXRHaptics(0.18, 14, isLeftFoot ? 'left' : 'right');
        } else if (ws.isOnLadder || ws.isOnVehicleDeck) {
          if (window.SpaceAudio) window.SpaceAudio.playLadderClank();
          this.pulseXRHaptics(0.25, 18, isLeftFoot ? 'left' : 'right');
        } else {
          // Walking on planetary regolith
          if (window.SpaceAudio) window.SpaceAudio.playRegolithStep();
          this.pulseXRHaptics(0.22, 16, isLeftFoot ? 'left' : 'right');
          const strideBack = -0.10;
          const footX = ws.x + forwardX * strideBack;
          const footZ = ws.z + forwardZ * strideBack;
          this.spawnFootprint(footX, footZ, effectiveMoveYaw, isLeftFoot);
          this.spawnBootDust(footX, footZ, 4);
        }
      }
    } else if (ws.isDrivingRover && window.SpaceAudio) {
      window.SpaceAudio.setRoverMotorHum(false);
    }

    // Vertical Elevation: Inside Descending/Landed Cabin vs. Climbing Ladder vs. Rover vs. Planetary Surface Gravity vs. On Spacecraft Deck
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const gravity = body === 'moon' ? 3.2 : body === 'outer' ? 2.8 : body === 'mars' ? 5.5 : 9.8;
    const terrainGroundY = this.getExactSurfaceHeight(ws.x, ws.z);

    const vehicleProfile = this.getVehicleSurfaceProfile(ws.x, ws.z);
    let effectiveFloorY = terrainGroundY;
    let standingOnDeck = false;

    // If astronaut is elevated at or above the vehicle deck, the vehicle deck acts as a solid walkable surface!
    if (vehicleProfile.isWalkableDeck && ws.y >= (vehicleProfile.deckY - 0.35)) {
      effectiveFloorY = Math.max(terrainGroundY, vehicleProfile.deckY);
      standingOnDeck = true;
    }
    ws.isOnVehicleDeck = standingOnDeck;

    if (ws.isInsideCabin) {
      // Ride smoothly inside the descending rocket cabin from 68m altitude down to 4.5m deck height!
      const engineVib = isDescending
        ? (Math.sin(this.simTime * 46) * 0.011 + Math.cos(this.simTime * 31) * 0.008)
        : 0;
      ws.y = cabinFloorY + descentOffset + engineVib;
      ws.vy = 0;
      ws.isGrounded = true;
    } else if (ws.isDrivingRover) {
      ws.y = terrainGroundY + 0.38 + (isMoving ? Math.sin(this.simTime * 18) * 0.025 : 0);
      ws.vy = 0;
      ws.isGrounded = true;
    } else if (ws.isOnLadder) {
      // Flat EVA Porch from z = 2.68 to 3.45 (at full cabinFloorY = 4.5m),
      // then smoothly climb up/down the 12 ladder rungs along z = 3.45 -> 6.85!
      if (ws.z <= 3.45) {
        ws.y = cabinFloorY + descentOffset;
      } else {
        const climbFrac = Math.max(0, Math.min(1, (6.85 - ws.z) / (6.85 - 3.45)));
        ws.y = groundY0 + climbFrac * (cabinFloorY + descentOffset - groundY0);
      }
      ws.vy = 0;
      ws.isGrounded = true;
    } else if (!ws.isGrounded || ws.y > effectiveFloorY + 0.04) {
      ws.vy -= gravity * dt;
      ws.y += ws.vy * dt;
      if (ws.y <= effectiveFloorY) {
        ws.y = effectiveFloorY;
        ws.vy = 0;
        ws.isGrounded = true;
        if (standingOnDeck) {
          if (window.SpaceAudio) window.SpaceAudio.playLadderClank();
        } else {
          this.spawnFootprint(ws.x, ws.z, effectiveMoveYaw, true);
          this.spawnFootprint(ws.x, ws.z, effectiveMoveYaw, false);
          this.spawnBootDust(ws.x, ws.z, 10);
        }
      }
    } else {
      ws.y = effectiveFloorY;
      ws.isGrounded = true;
    }

    if (standingOnDeck && !ws.isInsideCabin && !ws.isOnLadder && !ws.isDrivingRover) {
      this.updateVRGameMiniPill(isTr ? '🚀 Uzay Aracı Üzerinde Yürüyüş Modu' : '🚀 Walking on Spacecraft Deck');
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
      // Meta Quest 3S: offset the cameraRig so the user's real HEAD sits exactly at the astronaut
      // position (ws.x, ws.z). Room-scale steps were already fed through collision above, so the
      // rig cancels the physical offset and the head can never end up inside walls/tables.
      const hp = this.camera.position;
      const cyR = Math.cos(ws.smoothYaw);
      const syR = Math.sin(ws.smoothYaw);
      const offX = hp.x * cyR + hp.z * syR;
      const offZ = -hp.x * syR + hp.z * cyR;
      this.cameraRig.position.set(ws.x - offX, ws.y + (this.xrLocalRefFallback ? 1.6 : 0), ws.z - offZ);
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
        const hData = (typeof getHeritageProtectionData === 'function' && this.currentArtifact)
          ? getHeritageProtectionData(this.currentArtifact.id)
          : null;
        const walkBuf = (hData && hData.walkBufferMeters) ? hData.walkBufferMeters : 75;
        const diff = Math.abs(dist - walkBuf);

        if (diff <= 8) {
          statusEl.innerText = isTr
            ? `⚠️ ARTEMIS ACCORDS BÖLÜM 9 KORUMA HATTI (${walkBuf}m): Tarihi uzay mirası ve ayak izleri dokunulmazlık sınırındasınız!`
            : `⚠️ ARTEMIS ACCORDS SEC. 9 PERIMETER (${walkBuf}m): You are at the historic extraterrestrial sanctuary standoff boundary!`;
        } else {
          statusEl.innerText = isTr
            ? '🥽 1:1 ASTRONOT YÜZEY YÜRÜYÜŞÜ AKTİF (WASD: Yürü • SPACE: Sıçra • Merdivene Yürü / E: Kabine Gir • V: 1./3. Şahıs • F: Fener)'
            : '🥽 1:1 ASTRONAUT SURFACE WALK ACTIVE (WASD: Walk • SPACE: Jump • Walk to Ladder / E: Enter Cabin • V: View • F: Torch)';
        }
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
        const hData = (typeof getHeritageProtectionData === 'function' && this.currentArtifact)
          ? getHeritageProtectionData(this.currentArtifact.id)
          : null;
        const walkBuf = (hData && hData.walkBufferMeters) ? hData.walkBufferMeters : 75;
        const diff = Math.abs(dist - walkBuf);

        if (diff <= 8) {
          distEl.innerText = isTr
            ? `⚠️ TAMPON SINIRI: ${dist} m / ${walkBuf} m (Artemis Accords Md. 9)`
            : `⚠️ STANDOFF BOUNDARY: ${dist} m / ${walkBuf} m (Artemis Accords Sec. 9)`;
        } else {
          distEl.innerText = isTr
            ? `ARACA MESAFE: ${dist} m (1:1 Ölçek | Tampon: ${walkBuf}m)`
            : `DISTANCE TO CRAFT: ${dist} m (1:1 Scale | Buffer: ${walkBuf}m)`;
        }
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
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    const artifact = this.currentArtifact;
    if (!artifact) return;

    if (this.cameraMode === 'walk') {
      const descentOffset = this.getDescentOffset(t);
      if (t < 5.8) {
        if (altEl) altEl.innerText = isTr ? `${descentOffset.toFixed(1)} m (Kokpit İnişi)` : `${descentOffset.toFixed(1)} m (Cockpit Descent)`;
        if (speedEl) speedEl.innerText = `-${Math.max(1.2, descentOffset * 0.22).toFixed(1)} m/s`;
        if (thrustEl) thrustEl.innerText = isTr ? `${this.cabinState ? this.cabinState.throttlePct : 75}% (İniş Roketi Aktif)` : `${this.cabinState ? this.cabinState.throttlePct : 75}% (Descent Thrusters Active)`;
        if (phaseEl) {
          phaseEl.innerText = isTr
            ? "🚀 KOKPİT İÇİNDEN YÜZEYE İNİŞ SÜRÜYOR — Pencerelerden ve DSKY ekranından alçalmayı takip edin!"
            : "🚀 FIRST-PERSON COCKPIT DESCENT IN PROGRESS — Monitor altitude via windows and DSKY!";
        }
      } else {
        const dist = Math.hypot(this.walkState.x, this.walkState.z).toFixed(1);
        if (altEl) altEl.innerText = this.walkState.isInsideCabin ? (isTr ? "+4.5 m (Kabin İçi)" : "+4.5 m (Inside Cabin)") : (isTr ? "1.75 m (Astronot Göz Hizası)" : "1.75 m (Astronaut Eye Level)");
        if (speedEl) speedEl.innerText = this.walkState.isInsideCabin ? (this.cabinState.hatchOpen ? (isTr ? "KAPAK AÇIK (Çıkış Hazır)" : "HATCH OPEN (Ready to Exit)") : (isTr ? "KAPAK KAPALI (Açmak için E / Tıkla)" : "HATCH CLOSED (Press E / Click)")) : (isTr ? `${dist} m (Araca Mesafe)` : `${dist} m (Distance to Craft)`);
        if (thrustEl) thrustEl.innerText = this.walkViewMode === 'fp' ? (isTr ? "1. ŞAHIS (ELLER & VİZÖR)" : "1ST PERSON (HANDS & VISOR)") : (isTr ? "3. ŞAHIS (TAM ASTRONOT)" : "3RD PERSON (FULL ASTRONAUT)");
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
      if (thrustEl) thrustEl.innerText = isTr ? "0% (Balistik Serbest Düşüş)" : "0% (Ballistic Free-Fall)";
      if (phaseEl) {
        phaseEl.innerText = t < 3.2
          ? (isTr ? "KİNETİK YÖRÜNGEDEN ALÇALMA" : "ORBITAL KINETIC PLUNGE")
          : (isTr ? "💥 ÇARPIŞMA: SİSMİK ÇAN DALGASI AKTİF (ALSEP)" : "💥 IMPACT: SEISMIC RINGING ACTIVE (ALSEP)");
      }
    } else if (artifact.category === 'helicopter') {
      const alt = this.spacecraft ? this.spacecraft.position.y : 0;
      if (altEl) altEl.innerText = `${alt.toFixed(1)} m`;
      if (speedEl) speedEl.innerText = `${(t < 5 ? 3.5 : 0.8).toFixed(1)} m/s`;
      if (thrustEl) thrustEl.innerText = isTr ? "2,400 RPM (Çift Ters Rotor)" : "2,400 RPM (Coaxial Counter-Rotating Rotors)";
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
      if (speedEl) speedEl.innerText = currentY > 0.1 ? (isTr ? "-7.8 m/s (Aerodinamik Disk Freni)" : "-7.8 m/s (Aerodynamic Drag Shield)") : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = isTr ? "92 ATM CO₂ Atmosferik Frenleme (465°C)" : "92 ATM CO₂ Atmospheric Braking (465°C)";
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5
          ? (isTr ? "YOĞUN VENÜS ATMOSFERİNDE ALÇALMA" : "VENUS SUPERCRITICAL ATMOSPHERE DESCENT")
          : (isTr ? "✅ VENÜS BAZALT YÜZEYİNE İNİŞ TAMAMLANDI!" : "✅ VENUS BASALT SURFACE TOUCHDOWN CONFIRMED!");
      }
    } else {
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 3.2) : 0;
      if (altEl) altEl.innerText = `${(currentY * 1.5).toFixed(1)} m`;
      if (speedEl) speedEl.innerText = currentY > 0.1 ? `-${Math.max(1.2, currentY * 0.15).toFixed(1)} m/s` : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = currentY > 0.1 ? (isTr ? "78% (DPS İniş Roketi)" : "78% (DPS Descent Engine)") : (isTr ? "0% (MOTOR SUSTURULDU)" : "0% (ENGINE CUTOFF)");
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5
          ? (isTr ? "FRENLEME & YUMUŞAK ALÇALMA" : "BRAKING & TERMINAL DESCENT")
          : (isTr ? "✅ TEMAS IŞIĞI YANDI: THE EAGLE HAS LANDED!" : "✅ TOUCHDOWN CONFIRMED: EAGLE HAS LANDED!");
      }
    }
  }

  updateSimulationLanguage() {
    const artifact = this.currentArtifact;
    if (!artifact) return;
    const isTr = window.app ? window.app.currentLang === 'tr' : false;

    const titleEl = document.getElementById('sim-title');
    const badgeEl = document.getElementById('sim-badge');
    if (titleEl) titleEl.innerText = isTr ? artifact.name_tr : artifact.name_en;
    if (badgeEl) {
      if (artifact.category === 'impact') {
        badgeEl.innerText = isTr ? "💥 KİNETİK ÇARPIŞMA CANLANDIRMASI" : "💥 KINETIC IMPACT REENACTMENT";
      } else if (artifact.category === 'helicopter') {
        badgeEl.innerText = isTr ? "🚁 AERODİNAMİK UÇUŞ CANLANDIRMASI" : "🚁 AERODYNAMIC FLIGHT REENACTMENT";
      } else if (artifact.id === 'curiosity-skycrane') {
        badgeEl.innerText = isTr ? "🚀 GÖKYÜZÜ VİNCİ İNİŞ & KAZA CANLANDIRMASI" : "🚀 SKY CRANE DESCENT & FLYAWAY";
      } else if (artifact.body === 'venus') {
        badgeEl.innerText = isTr ? "🔥 VENÜS 92 ATM BASINÇLI İNİŞ CANLANDIRMASI" : "🔥 VENUS 92 ATM PRESSURE DESCENT";
      } else if (artifact.body === 'outer') {
        badgeEl.innerText = isTr ? "🪐 DIŞ GÜNEŞ SİSTEMİ İNİŞ CANLANDIRMASI" : "🪐 OUTER SYSTEM TOUCHDOWN REENACTMENT";
      } else {
        badgeEl.innerText = isTr ? "🛰️ YÜZEYE İNİŞ & 1:1 WEBXR SAHNESİ" : "🛰️ TOUCHDOWN & 1:1 WEBXR SCENE";
      }
    }

    const btnWalkCabin = document.getElementById('btn-walk-cabin');
    if (btnWalkCabin && this.walkState) {
      btnWalkCabin.innerText = this.walkState.isInsideCabin
        ? (isTr ? '🚪 1. İç Kapıyı Aç / Kapat (E)' : '🚪 Toggle Airlock Doors (E)')
        : (isTr ? '🚪 Kabine Gir (E)' : '🚪 Enter Cabin (E)');
    }
    const btnWalkView = document.getElementById('btn-walk-view-toggle') || document.getElementById('btn-walk-view');
    if (btnWalkView) {
      btnWalkView.innerText = this.walkViewMode === 'fp'
        ? (isTr ? '👁️ Görünüm: 1. Şahıs (Astronot Elleri)' : '👁️ View: 1st Person (EVA Hands)')
        : (isTr ? '🧑🏼‍🚀 Görünüm: 3. Şahıs (Tam Astronot)' : '🧑🏼‍🚀 View: 3rd Person (Full Astronaut)');
    }
    const btnWalkTorch = document.getElementById('btn-walk-torch');
    if (btnWalkTorch) {
      btnWalkTorch.innerText = this.walkTorchOn
        ? (isTr ? '💡 EVA Feneri: AÇIK' : '💡 EVA Torch: ON')
        : (isTr ? '💡 EVA Feneri: KAPALI' : '💡 EVA Torch: OFF');
    }
    const btnCleanUi = document.getElementById('btn-walk-clean-ui');
    if (btnCleanUi) {
      btnCleanUi.innerText = this.vrCleanUI
        ? (isTr ? '🎮 Arayüzü Göster / Normal Mod (H)' : '🎮 Show UI / Normal Mode (H)')
        : (isTr ? '🎮 Arayüzü Gizle / Oyun Modu (H)' : '🎮 Hide UI / Game Mode (H)');
    }

    // Update initial Walk HUD Status if not yet updated by loop
    const statusEl = document.getElementById('walk-xr-status');
    if (statusEl && (!this.walkState || !this.walkState.isLooking)) {
      if (this.walkState && this.walkState.isInsideCabin) {
        statusEl.innerText = isTr
          ? '🚀 HAVADA ALÇALMA AKTİF (KOKPİT İÇİ) • Yüzeye inişten sonra arkadaki kapağa yürüyün, mandalı tıklayın veya [E] tuşuna basın'
          : '🚀 AIRBORNE DESCENT ACTIVE (IN CABIN) • After touchdown walk to door, click latch or press E to exit';
      } else {
        statusEl.innerText = isTr
          ? '🥽 1:1 ASTRONOT YÜZEY YÜRÜYÜŞÜ AKTİF (WASD: Yürü • SPACE: Sıçra • E: Etkileşim • V: 1./3. Şahıs • F: Fener)'
          : '🥽 1:1 ASTRONAUT SURFACE WALK ACTIVE (WASD: Walk • SPACE: Jump • E: Interact • V: View • F: Torch)';
      }
    }
    const distEl = document.getElementById('walk-hud-dist');
    if (distEl && this.walkState && this.walkState.isInsideCabin) {
      distEl.innerText = isTr ? 'KONUM: KOKPİT İÇİ (HAVADA ALÇALMA)' : 'LOCATION: INSIDE COCKPIT (AIRBORNE DESCENT)';
    }

    // Refresh all 3D VR displays and panels
    this.refreshCabinDisplays();
    this.updateVRWristCanvas();
    this.updateVRHelpPanelContent();
    this.updateVRGameMiniPill();
    this.updateQuestVRButton();
  }
}

window.SpaceSimulation = new MissionSimulationTheater();
