/**
 * Cinematic 3D Mission Simulation Theater & True WebXR 1:1 Astronaut Surface Walk (v4.2)
 * Features:
 * - Articulated 3D Astronaut with First-Person EVA Arms/Gloves/Wrist-Computer/Flashlight & Third-Person Full EMU Suit
 * - Realistic low-gravity walking kinematics, ribbed lunar bootprint trail, and boot-dust particle physics
 * - True WebXR VR/AR session support via renderer.setAnimationLoop, cameraRig dolly, and XR controller thumbstick locomotion
 * - High-resolution procedural PBR terrain & multi-part spacecraft (Apollo LM + LRV Moon Buggy + ALSEP, Sky Crane, Ingenuity, Venera 13, Huygens)
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

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.08, 2500);
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
          if (this.cameraMode === 'walk') this.cameraMode = 'cinematic';
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
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.walkState.keys.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.walkState.keys.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.walkState.keys.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.walkState.keys.d = false;
    });

    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.cameraMode !== 'walk') return;
        this.walkState.isLooking = true;
        this.walkState.lastMouseX = e.clientX;
        this.walkState.lastMouseY = e.clientY;
      });

      window.addEventListener('pointermove', (e) => {
        if (!this.walkState.isLooking || this.cameraMode !== 'walk') return;
        const dx = e.clientX - this.walkState.lastMouseX;
        const dy = e.clientY - this.walkState.lastMouseY;
        this.walkState.lastMouseX = e.clientX;
        this.walkState.lastMouseY = e.clientY;

        this.walkState.yaw -= dx * 0.0045;
        this.walkState.pitch = Math.max(-1.05, Math.min(1.05, this.walkState.pitch - dy * 0.0045));
      });

      window.addEventListener('pointerup', () => {
        this.walkState.isLooking = false;
      });
    }

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
    if (this.walkState.isGrounded) {
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

    if (mode === 'walk') {
      if (this.simTime < 6.8) {
        this.simTime = 7.0;
      }
      if (this.spacecraft && this.currentArtifact && this.currentArtifact.category === 'impact') {
        this.spacecraft.visible = true;
        this.spacecraft.position.set(0, 2.2, 0);
        this.spacecraft.rotation.set(0.2, 0.4, Math.PI * 0.42);
      }
      this.walkState.x = 0;
      this.walkState.z = 13.5;
      this.walkState.y = this.getTerrainHeight(0, 13.5);
      this.walkState.vy = 0;
      this.walkState.yaw = 0;
      this.walkState.pitch = 0.05;

      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = true;
      if (walkHud) walkHud.classList.remove('hidden');
      if (walkBtn) walkBtn.classList.add('active');
      if (this.controls) this.controls.enabled = false;
    } else {
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
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
    this.simTime = this.cameraMode === 'walk' ? 7.0 : 0;
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
    const suitWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65, metalness: 0.1 });
    const visorGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.12, metalness: 0.96 });
    const bootGrey = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, metalness: 0.25 });
    const redPatch = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const blueValve = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 });

    // Torso (A7L EMU Suit)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.34), suitWhite);
    torso.position.y = 1.15;
    torso.castShadow = true;
    root.add(torso);

    // PLSS Life Support Backpack
    const plss = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.66, 0.26), suitWhite);
    plss.position.set(0, 1.18, 0.28);
    plss.castShadow = true;
    root.add(plss);

    // Chest RCU Control Box + Commander Red Stripes
    const rcu = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.10), suitWhite);
    rcu.position.set(0, 1.22, -0.20);
    root.add(rcu);

    const valveL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 10), blueValve);
    valveL.rotation.x = Math.PI / 2;
    valveL.position.set(-0.14, 1.05, -0.18);
    const valveR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 10), redPatch);
    valveR.rotation.x = Math.PI / 2;
    valveR.position.set(0.14, 1.05, -0.18);
    root.add(valveL, valveR);

    // Helmet & Reflective 24K Gold LEVA Visor
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), suitWhite);
    helmet.position.set(0, 1.68, 0);
    helmet.castShadow = true;
    root.add(helmet);

    const goldVisor = new THREE.Mesh(
      new THREE.SphereGeometry(0.225, 24, 24, -Math.PI * 0.85, Math.PI * 0.7, Math.PI * 0.2, Math.PI * 0.55),
      visorGold
    );
    goldVisor.position.set(0, 1.68, -0.02);
    root.add(goldVisor);

    // Articulated Left & Right Arms
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.34, 1.42, 0);
    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.58, 12), suitWhite);
    lArmMesh.position.y = -0.26;
    lArmMesh.castShadow = true;
    const lGlove = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bootGrey);
    lGlove.position.y = -0.56;
    leftArm.add(lArmMesh, lGlove);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.34, 1.42, 0);
    const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.58, 12), suitWhite);
    rArmMesh.position.y = -0.26;
    rArmMesh.castShadow = true;
    const rGlove = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bootGrey);
    rGlove.position.y = -0.56;
    rightArm.add(rArmMesh, rGlove);
    root.add(rightArm);

    // Articulated Left & Right Legs + Lunar Overshoe Boots
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.80, 0);
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.68, 12), suitWhite);
    lLegMesh.position.y = -0.34;
    lLegMesh.castShadow = true;
    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.28), bootGrey);
    lBoot.position.set(0, -0.72, -0.04);
    leftLeg.add(lLegMesh, lBoot);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.80, 0);
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.68, 12), suitWhite);
    rLegMesh.position.y = -0.34;
    rLegMesh.castShadow = true;
    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.28), bootGrey);
    rBoot.position.set(0, -0.72, -0.04);
    rightLeg.add(rLegMesh, rBoot);
    root.add(rightLeg);

    this.tpLimbs = { leftArm, rightArm, leftLeg, rightLeg, torso };
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

  spawnFootprint(x, z, yaw, isLeft) {
    const groundY = this.getTerrainHeight(x, z);
    const offsetSide = isLeft ? -0.16 : 0.16;
    const fx = x + Math.cos(yaw) * offsetSide;
    const fz = z - Math.sin(yaw) * offsetSide;

    const printGroup = new THREE.Group();
    printGroup.position.set(fx, groundY + 0.015, fz);
    printGroup.rotation.y = yaw;

    const printMat = new THREE.MeshStandardMaterial({
      color: 0x333842,
      roughness: 0.98,
      transparent: true,
      opacity: 0.78
    });

    // Ribbed Apollo Lunar Bootprint treads
    for (let r = -3; r <= 3; r++) {
      const tread = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.022), printMat);
      tread.rotation.x = -Math.PI / 2;
      tread.position.z = r * 0.036;
      printGroup.add(tread);
    }

    this.scene.add(printGroup);
    this.footprints.push(printGroup);
    if (this.footprints.length > 60) {
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

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 3.8), silverAlum);
      cabin.position.y = 2.6;
      cabin.castShadow = true;
      this.spacecraft.add(cabin);

      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 1.6), silverAlum);
      porch.position.set(0, 1.4, 2.5);
      this.spacecraft.add(porch);

      const winMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), winMat);
      winL.position.set(-1.0, 3.0, 1.95);
      winL.rotation.y = 0.2;
      const winR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), winMat);
      winR.position.set(1.0, 3.0, 1.95);
      winR.rotation.y = -0.2;
      this.spacecraft.add(winL, winR);

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

    this.camera.position.set(30, 32, 65);
    this.camera.lookAt(0, 16, 0);

    if (this.controls && this.spacecraft) {
      this.controls.target.copy(this.spacecraft.position);
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

    if (artifact.category === 'impact') {
      if (t < 3.2) {
        const progress = t / 3.2;
        this.spacecraft.position.x = -75 + progress * 75;
        this.spacecraft.position.y = 100 - progress * 100;

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
        if (this.cameraMode !== 'walk') {
          this.spacecraft.visible = false;
        }
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

      if (t > 1.5 && t < 6.4) {
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
      if (t < 4.5) {
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
      if (t < 6.5) {
        const progress = t / 6.5;
        const ease = 1 - Math.pow(1 - progress, 2);
        const currentY = 80 - ease * 76.8;
        this.spacecraft.position.y = currentY;

        if (this.engineLight) {
          this.engineLight.intensity = 4.5 + Math.random() * 2.5;
        }
        if (this.exhaustPlume) {
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
        if (t < 6.8) {
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
  // REALISTIC ASTRONAUT WALKING KINEMATICS, HANDS SWING & WEBXR LOCOMOTION
  // ===========================================================================
  updateAstronautWalk(dt) {
    const ws = this.walkState;
    ws.breathPhase += dt * 1.9;
    const speed = 5.0; // EVA surface speed
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

    const forwardX = -Math.sin(ws.yaw);
    const forwardZ = -Math.cos(ws.yaw);
    const rightX = Math.cos(ws.yaw);
    const rightZ = -Math.sin(ws.yaw);

    const isMoving = (Math.abs(moveForward) > 0.01 || Math.abs(moveRight) > 0.01);

    if (isMoving) {
      const len = Math.hypot(moveForward, moveRight) || 1;
      const nx = (forwardX * moveForward + rightX * moveRight) / len;
      const nz = (forwardZ * moveForward + rightZ * moveRight) / len;

      const candidateX = ws.x + nx * speed * dt;
      const candidateZ = ws.z + nz * speed * dt;
      // Collision boundary with central lander hull (radius 4.4m)
      if (Math.hypot(candidateX, candidateZ) > 4.4 && Math.hypot(candidateX, candidateZ) < 120) {
        ws.x = candidateX;
        ws.z = candidateZ;
      }
      ws.stepPhase += dt * 7.2;

      // Spawn ribbed lunar footprint & dust puff on each footfall!
      const stepIndex = Math.floor(ws.stepPhase / Math.PI);
      if (stepIndex > ws.lastStepCount && ws.isGrounded) {
        ws.lastStepCount = stepIndex;
        const isLeftFoot = (stepIndex % 2 === 0);
        this.spawnFootprint(ws.x, ws.z, ws.yaw, isLeftFoot);
        this.spawnBootDust(ws.x, ws.z, 3);
      }
    }

    // Planetary gravity physics for jumping / walking over craters
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const gravity = body === 'moon' ? 3.2 : body === 'outer' ? 2.8 : body === 'mars' ? 5.5 : 9.8;
    const groundY = this.getTerrainHeight(ws.x, ws.z);

    if (!ws.isGrounded || ws.y > groundY + 0.04) {
      ws.vy -= gravity * dt;
      ws.y += ws.vy * dt;
      if (ws.y <= groundY) {
        ws.y = groundY;
        ws.vy = 0;
        ws.isGrounded = true;
        this.spawnBootDust(ws.x, ws.z, 8);
      }
    } else {
      ws.y = groundY;
    }

    // Low-gravity EVA bounce & lateral sway
    const verticalBounce = (isMoving && ws.isGrounded) ? Math.abs(Math.sin(ws.stepPhase)) * 0.14 : Math.sin(ws.breathPhase) * 0.012;
    const lateralSway = (isMoving && ws.isGrounded) ? Math.cos(ws.stepPhase) * 0.045 : 0;

    // Animate First-Person Astronaut Arms & Gloved Hands
    if (this.fpLeftArm && this.fpRightArm) {
      const swing = isMoving ? Math.sin(ws.stepPhase) * 0.16 : Math.sin(ws.breathPhase) * 0.025;
      const jumpLift = ws.isGrounded ? 0 : Math.min(0.18, Math.abs(ws.vy) * 0.04);

      this.fpLeftArm.position.set(-0.27 + lateralSway * 0.3, -0.26 + Math.abs(swing) * 0.18 + jumpLift * 0.4, -0.44 - swing * 0.35);
      this.fpLeftArm.rotation.set(0.42 + swing * 0.55 + jumpLift, 0.22, -0.18);

      this.fpRightArm.position.set(0.28 + lateralSway * 0.3, -0.26 + Math.abs(swing) * 0.18 + jumpLift * 0.4, -0.44 + swing * 0.35);
      this.fpRightArm.rotation.set(0.38 - swing * 0.55 + jumpLift, -0.20, 0.15);
    }

    // Animate 3rd-Person Full Astronaut Suit
    if (this.tpAstronaut) {
      this.tpAstronaut.position.set(ws.x, ws.y + verticalBounce * 0.6, ws.z);
      this.tpAstronaut.rotation.y = ws.yaw;
      if (this.tpLimbs.leftArm) {
        const limbSwing = isMoving ? Math.sin(ws.stepPhase) * 0.52 : 0;
        this.tpLimbs.leftArm.rotation.x = limbSwing;
        this.tpLimbs.rightArm.rotation.x = -limbSwing;
        this.tpLimbs.leftLeg.rotation.x = -limbSwing * 0.85;
        this.tpLimbs.rightLeg.rotation.x = limbSwing * 0.85;
      }
    }

    // Position Camera / WebXR Rig
    if (this.renderer.xr && this.renderer.xr.isPresenting) {
      // In real WebXR VR headset: move the cameraRig dolly on the surface; headset controls head look!
      this.cameraRig.position.set(ws.x, ws.y, ws.z);
      this.cameraRig.rotation.y = ws.yaw;
    } else if (this.walkViewMode === 'tp') {
      // 3rd-Person Over-the-Shoulder Astronaut Camera
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      const camDist = 3.8;
      const camX = ws.x - forwardX * camDist + rightX * 0.55;
      const camZ = ws.z - forwardZ * camDist + rightZ * 0.55;
      const camY = Math.max(this.getTerrainHeight(camX, camZ) + 0.6, ws.y + 2.35 - Math.sin(ws.pitch) * 1.4);
      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(ws.x + forwardX * 4, ws.y + 1.55 + Math.sin(ws.pitch) * 2, ws.z + forwardZ * 4);
    } else {
      // 1st-Person Astronaut Visor & Hands Camera
      this.cameraRig.position.set(0, 0, 0);
      this.cameraRig.rotation.set(0, 0, 0);
      const eyeY = ws.y + ws.eyeHeight + verticalBounce;
      this.camera.position.set(ws.x + rightX * lateralSway, eyeY, ws.z + rightZ * lateralSway);
      const lookTarget = new THREE.Vector3(
        ws.x + forwardX * Math.cos(ws.pitch),
        eyeY + Math.sin(ws.pitch),
        ws.z + forwardZ * Math.cos(ws.pitch)
      );
      this.camera.lookAt(lookTarget);
    }

    // Update 1:1 Walk HUD telemetry
    const dist = Math.hypot(ws.x, ws.z).toFixed(1);
    const distEl = document.getElementById('walk-hud-dist');
    const gravEl = document.getElementById('walk-hud-grav');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    if (distEl) {
      distEl.innerText = isTr ? `ARACA MESAFE: ${dist} m (1:1 Ölçek)` : `DISTANCE TO CRAFT: ${dist} m (1:1 Scale)`;
    }
    if (gravEl) {
      const gravLabel = body === 'moon' ? '1.62 m/s² (0.16g)' : body === 'mars' ? '3.72 m/s² (0.38g)' : body === 'venus' ? '8.87 m/s² (92 bar)' : '1.35 m/s² (0.14g)';
      gravEl.innerText = isTr ? `YERÇEKİMİ: ${gravLabel} | GÖZ HİZASI: 1.75 m | ADIM: ${ws.lastStepCount}` : `GRAVITY: ${gravLabel} | EYE LEVEL: 1.75 m | STEPS: ${ws.lastStepCount}`;
    }
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
      const dist = Math.hypot(this.walkState.x, this.walkState.z).toFixed(1);
      if (altEl) altEl.innerText = "1.75 m (Astronot Göz Hizası)";
      if (speedEl) speedEl.innerText = `${dist} m (Araca Mesafe)`;
      if (thrustEl) thrustEl.innerText = this.walkViewMode === 'fp' ? "1. ŞAHIS (ELLER & VİZÖR)" : "3. ŞAHIS (TAM ASTRONOT)";
      if (phaseEl) {
        phaseEl.innerText = isTr
          ? "🥽 1:1 ASTRONOT YÜRÜYÜŞÜ AKTİF (WASD: Yürü • SPACE: Sıçra • V: Kamera Değiştir • F: Fener)"
          : "🥽 1:1 ASTRONAUT WALK ACTIVE (WASD: Walk • SPACE: Jump • V: Switch View • F: Torch)";
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
