/**
 * Cinematic 3D Mission Simulation Theater & 1:1 WebXR Surface Walk
 * Authentic multi-part procedural 3D models of Apollo Lunar Modules, Saturn V S-IVB boosters,
 * Curiosity Sky Crane, Ingenuity, Soviet Venera 13, ESA Huygens & Philae with dynamic shadows,
 * planetary environments (Moon, Mars, Venus, Titan/Comet 67P), and 1:1 True-Scale Astronaut Surface Walk + WebXR API.
 */

class MissionSimulationTheater {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.animationId = null;

    this.currentArtifact = null;
    this.simTime = 0;
    this.isPlaying = false;
    this.cameraMode = 'cinematic'; // 'cinematic', 'follow', 'ground', 'free', 'walk'

    this.currentW = 0;
    this.currentH = 0;

    // Scene elements
    this.spacecraft = null;
    this.secondaryCraft = null;
    this.terrain = null;
    this.engineLight = null;
    this.exhaustPlume = null;
    this.particles = [];
    this.shockwave = null;
    this.shakeIntensity = 0;
    this.craneCrashed = false;
    this.impactTriggered = false;
    this.scaleRingsGroup = null;

    // 1:1 Astronaut Surface Walk & WebXR state
    this.walkState = {
      x: 0,
      y: 1.75,
      z: 14,
      vy: 0,
      yaw: 0,
      pitch: 0.08,
      eyeHeight: 1.75,
      isGrounded: true,
      keys: { w: false, a: false, s: false, d: false, space: false },
      isLooking: false,
      lastMouseX: 0,
      lastMouseY: 0,
      stepPhase: 0
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
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 2500);
    this.camera.position.set(32, 28, 60);

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
        this.walkState.pitch = Math.max(-1.1, Math.min(1.1, this.walkState.pitch - dy * 0.0045));
      });

      window.addEventListener('pointerup', () => {
        this.walkState.isLooking = false;
      });
    }

    // Bind on-screen mobile/desktop D-pad buttons for 1:1 walk
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

  triggerAstronautJump() {
    if (this.walkState.isGrounded) {
      const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
      const jumpVel = body === 'moon' ? 4.2 : body === 'outer' ? 4.5 : body === 'mars' ? 3.5 : 2.6;
      this.walkState.vy = jumpVel;
      this.walkState.isGrounded = false;
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect && camSelect.value !== mode) camSelect.value = mode;

    const walkHud = document.getElementById('walk-hud-overlay');
    const walkBtn = document.getElementById('btn-sim-walk');

    if (mode === 'walk') {
      // Snap spacecraft to landed state so astronaut walks beside it at 1:1 scale
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
      this.walkState.y = this.getTerrainHeight(0, 13.5) + this.walkState.eyeHeight;
      this.walkState.vy = 0;
      this.walkState.yaw = 0;
      this.walkState.pitch = 0.08;

      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = true;
      if (walkHud) walkHud.classList.remove('hidden');
      if (walkBtn) walkBtn.classList.add('active');
      if (this.controls) this.controls.enabled = false;
    } else {
      if (this.scaleRingsGroup) this.scaleRingsGroup.visible = false;
      if (walkHud) walkHud.classList.add('hidden');
      if (walkBtn) walkBtn.classList.remove('active');
      if (this.controls) {
        this.controls.enabled = (mode === 'free');
        if (this.spacecraft) this.controls.target.copy(this.spacecraft.position);
      }
    }
  }

  async enterWebXR() {
    const isTr = window.app ? window.app.currentLang === 'tr' : true;
    // Always activate 1:1 Surface Walk first
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
          await this.renderer.xr.setSession(session);
          if (statusEl) {
            statusEl.innerText = isTr
              ? "🥽 WEBXR AKTİF: Meta Quest / Vision Pro 1:1 Yüzey Oturumu Başlatıldı"
              : "🥽 WEBXR ACTIVE: 1:1 Immersive Surface Session Running";
          }
          session.addEventListener('end', () => {
            this.xrSession = null;
          });
          return;
        }
      } catch (err) {
        console.warn('WebXR session fallback:', err);
      }
    }

    // Graceful Desktop / Mobile 360° 1:1 Visor HUD Fallback
    if (statusEl) {
      statusEl.innerText = isTr
        ? "🥽 1:1 ASTRONOT VİZÖR MODU AKTİF (WASD ile Yürü • Fare/Dokunmatik ile 360° Bak • Meta Quest / Vision Pro WebXR Hazır)"
        : "🥽 1:1 ASTRONAUT VISOR MODE ACTIVE (WASD to Walk • Drag to Look 360° • Meta Quest / Vision Pro WebXR Ready)";
    }
  }

  startSurfaceWalk(artifact) {
    this.cameraMode = 'walk';
    this.startSimulation(artifact);
    this.setCameraMode('walk');
  }

  getTerrainHeight(vx, vz) {
    const d = Math.sqrt(vx * vx + vz * vz);
    let y = Math.sin(vx * 0.06) * Math.cos(vz * 0.06) * 2.2;
    y += Math.sin(vx * 0.12 + 1.2) * 0.8;
    if (d < 35) {
      const factor = d / 35;
      if (factor > 0.7) {
        y += (1 - Math.abs(factor - 0.85) / 0.15) * 1.8;
      } else {
        y -= (1 - factor / 0.7) * 3.5;
      }
    }
    return y;
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;

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

    // Force multi-pass layout refresh
    this.onResize();
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 60);

    // Setup HUD telemetry info
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
        badgeEl.innerText = isTr ? "🔥 VENÜS 90 ATM BASINÇLI İNİŞ CANLANDIRMASI" : "🔥 VENUS 90 ATM PRESSURE DESCENT";
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

    // Authentic voice transmission
    if (window.SpaceAudio) {
      window.SpaceAudio.playRadioTransmission(artifact.audioSnippet || artifact.quote_en || "");
    }

    this.buildSimulationScene(artifact);
    this.setCameraMode(this.cameraMode);

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.lastTime = performance.now();
    this.animate();
  }

  stopSimulation() {
    this.isPlaying = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.xrSession) {
      this.xrSession.end().catch(() => {});
      this.xrSession = null;
    }
    if (this.overlay) this.overlay.classList.remove('open');

    if (this.scene) {
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
    }
  }

  buildSimulationScene(artifact) {
    if (!this.scene) return;

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.particles = [];

    const body = artifact.body || 'moon';
    const isMoon = body === 'moon';
    const isVenus = body === 'venus';
    const isOuter = body === 'outer';

    // Sky & Atmospheric Environment
    if (isMoon) {
      this.scene.background = new THREE.Color(0x040509);
      this.scene.fog = null;

      // Crescent Earthrise in the lunar sky
      const earthGroup = new THREE.Group();
      earthGroup.position.set(-200, 110, -320);

      const earthGeo = new THREE.SphereGeometry(16, 32, 32);
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.55,
        metalness: 0.1
      });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);

      const cloudGeo = new THREE.SphereGeometry(16.3, 32, 32);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.9
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);

      const haloGeo = new THREE.SphereGeometry(18, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);

      earthGroup.add(earthMesh, clouds, halo);
      this.scene.add(earthGroup);

    } else if (isVenus) {
      // Crushing golden-amber supercritical CO2 atmosphere on Venus
      this.scene.background = new THREE.Color(0x3d1e05);
      this.scene.fog = new THREE.FogExp2(0x4a2507, 0.0068);
    } else if (isOuter) {
      if (artifact.id === 'cassini-huygens') {
        // Titan thick orange nitrogen-methane haze + ringed Saturn in sky
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
        // Deep space comet 67P / Asteroid Eros / Jupiter probe
        this.scene.background = new THREE.Color(0x03060c);
        this.scene.fog = new THREE.FogExp2(0x091220, 0.0018);
      }
    } else {
      // Mars Sky with butterscotch dust fog
      this.scene.background = new THREE.Color(0x2d170f);
      this.scene.fog = new THREE.FogExp2(0x2d170f, 0.0032);

      const phobosGeo = new THREE.DodecahedronGeometry(5.5, 1);
      const phobosMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
      const phobos = new THREE.Mesh(phobosGeo, phobosMat);
      phobos.scale.set(1.4, 0.9, 1.1);
      phobos.position.set(160, 130, -280);
      this.scene.add(phobos);
    }

    // Stars Field (hidden under thick Venus clouds)
    if (!isVenus) {
      const starCount = 1600;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 1600;
        starPos[i * 3 + 1] = 30 + Math.random() * 800;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 1600;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMoon ? 1.8 : 1.3,
        transparent: true,
        opacity: isMoon ? 0.9 : 0.45
      });
      this.scene.add(new THREE.Points(starGeo, starMat));
    }

    // High-Resolution Cratered Terrain
    const terrainGeo = new THREE.PlaneGeometry(420, 420, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const d = Math.sqrt(vx * vx + vz * vz);

      let y = Math.sin(vx * 0.06) * Math.cos(vz * 0.06) * 2.2;
      y += Math.sin(vx * 0.12 + 1.2) * 0.8;

      if (d < 35) {
        const factor = d / 35;
        if (factor > 0.7) {
          y += (1 - Math.abs(factor - 0.85) / 0.15) * 1.8;
        } else {
          y -= (1 - factor / 0.7) * 3.5;
        }
      }

      if (d > 140) {
        const edge = (d - 140) / 70;
        y += Math.sin(vx * 0.08) * Math.cos(vz * 0.08) * (edge * 24);
      }

      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainColor = isMoon ? 0x787e87 : isVenus ? 0x784416 : isOuter ? (artifact.id === 'cassini-huygens' ? 0x855522 : 0x3b4252) : 0xc45c2c;
    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // 1:1 Scale Holographic Range Rings on Surface (visible in Walk / WebXR mode)
    this.scaleRingsGroup = new THREE.Group();
    this.scaleRingsGroup.position.y = -2.4;
    this.scaleRingsGroup.visible = (this.cameraMode === 'walk');
    [5, 10, 15].forEach((radius, idx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : 0x00f0ff,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide
      });
      const rMesh = new THREE.Mesh(ringGeo, ringMat);
      this.scaleRingsGroup.add(rMesh);
    });
    this.scene.add(this.scaleRingsGroup);

    // Scattered Rock Boulders / Venus Basalt Slabs / Titan Ice Cobbles
    const rockGeo = isVenus
      ? new THREE.CylinderGeometry(1.1, 1.3, 0.35, 7)
      : new THREE.DodecahedronGeometry(0.85, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMoon ? 0x555a63 : isVenus ? 0x45270d : isOuter ? 0x64748b : 0x8a3c1b,
      roughness: 0.95,
      metalness: 0.15,
      flatShading: true
    });
    for (let i = 0; i < 42; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 220;
      const rz = (Math.random() - 0.5) * 220;
      if (Math.abs(rx) > 8 || Math.abs(rz) > 8) {
        const sc = 0.6 + Math.random() * 2.2;
        rock.scale.set(sc, isVenus ? 0.5 : sc * (0.5 + Math.random() * 0.5), sc);
        rock.position.set(rx, this.getTerrainHeight(rx, rz) + sc * 0.25, rz);
        if (!isVenus) rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      }
    }

    // Authentic Lunar Landing Site Artifacts (Moon Lander scenes)
    if (isMoon && artifact.category === 'lander') {
      // American Flag on lunar regolith
      const flagGroup = new THREE.Group();
      flagGroup.position.set(9.5, this.getTerrainHeight(9.5, 6.5), 6.5);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.8),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
      );
      pole.position.y = 1.4;
      pole.castShadow = true;
      flagGroup.add(pole);

      const crossbar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
      );
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0.7, 2.75, 0);
      flagGroup.add(crossbar);

      const fabricGeo = new THREE.PlaneGeometry(1.4, 0.9, 8, 4);
      const fabricPos = fabricGeo.attributes.position;
      for (let fi = 0; fi < fabricPos.count; fi++) {
        const fx = fabricPos.getX(fi);
        fabricPos.setZ(fi, Math.sin(fx * 5.0) * 0.08);
      }
      fabricGeo.computeVertexNormals();

      const flagMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.8,
        side: THREE.DoubleSide
      });
      const flagMesh = new THREE.Mesh(fabricGeo, flagMat);
      flagMesh.position.set(0.7, 2.3, 0);
      flagMesh.castShadow = true;
      flagGroup.add(flagMesh);
      this.scene.add(flagGroup);

      // ALSEP Scientific Instrument Station + Laser Retroreflector (LRRR)
      const alsepY = this.getTerrainHeight(-11, 9);
      const alsepBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.9, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 })
      );
      alsepBox.position.set(-11, alsepY + 0.45, 9);
      alsepBox.castShadow = true;
      this.scene.add(alsepBox);

      const alsepAnt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
      );
      alsepAnt.position.set(-11, alsepY + 1.5, 9);
      this.scene.add(alsepAnt);
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
    // HIGH-PRECISION 3D SPACECRAFT CRAFTING (NO BLENDER - PURE THREE.JS PBR)
    // =========================================================================
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;
    const kaptonBump = window.ProceduralTextures ? window.ProceduralTextures.generateKaptonFoilBump() : null;

    if (artifact.category === 'impact') {
      // SATURN V S-IVB / CENTAUR ROCKET STAGE
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
      // INGENUITY MARS HELICOPTER
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

      this.spacecraft.position.set(0, 0.6, 0);

    } else if (artifact.id === 'curiosity-skycrane') {
      // CURIOSITY SKY CRANE & ROVER TANDEM
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
      this.spacecraft.position.set(0, 16, 0);

    } else if (isVenus) {
      // SOVIET VENERA 13 / PIONEER VENUS HIGH-PRESSURE TITANIUM LANDER
      const tiMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.28 });
      const darkBronze = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.75, roughness: 0.35 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22, bumpMap: kaptonBump, bumpScale: 0.04 });

      // Shock-absorbing toroidal landing cushion ring
      const torusBase = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.65, 16, 36), darkBronze);
      torusBase.rotation.x = Math.PI / 2;
      torusBase.position.y = -2.2;
      torusBase.castShadow = true;
      this.spacecraft.add(torusBase);

      // Struts connecting torus to spherical pressure hull
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.8), tiMat);
        strut.position.set(Math.cos(a) * 3.1, -1.0, Math.sin(a) * 3.1);
        strut.rotation.z = Math.cos(a) * 0.4;
        strut.rotation.x = -Math.sin(a) * 0.4;
        this.spacecraft.add(strut);
      }

      // Spherical Titanium Pressure Vessel
      const sphereHull = new THREE.Mesh(new THREE.SphereGeometry(2.6, 28, 28), goldMat);
      sphereHull.position.y = 0.2;
      sphereHull.castShadow = true;
      this.spacecraft.add(sphereHull);

      // Wide aerodynamic braking disk collar
      const aeroDisk = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 3.6, 0.65, 28), tiMat);
      aeroDisk.position.y = 1.9;
      aeroDisk.castShadow = true;
      this.spacecraft.add(aeroDisk);

      // Top cylindrical spool & helical antenna
      const spool = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 2.2, 24), tiMat);
      spool.position.y = 3.2;
      this.spacecraft.add(spool);

      const drillArm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 0.45), darkBronze);
      drillArm.position.set(3.4, -1.5, 0);
      drillArm.rotation.z = -0.35;
      this.spacecraft.add(drillArm);

      this.spacecraft.position.set(0, 80, 0);

    } else if (isOuter && artifact.id === 'cassini-huygens') {
      // ESA HUYGENS TITAN ATMOSPHERIC PROBE
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
        bumpScale: 0.045
      });
      const blackShield = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65 });
      const silverAlum = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.25 });
      const engineAlloy = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.2 });

      // 1. Octagonal Descent Stage Core
      const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.2, 2.9, 8), goldKapton);
      base.castShadow = true;
      base.receiveShadow = true;
      this.spacecraft.add(base);

      const quadShield = new THREE.Mesh(new THREE.BoxGeometry(4.7, 2.92, 2.4), blackShield);
      this.spacecraft.add(quadShield);

      // 2. MESA Equipment Bay
      const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.2), silverAlum);
      mesa.position.set(0, 0, 4.4);
      mesa.castShadow = true;
      this.spacecraft.add(mesa);

      // 3. Central Aerojet DPS Descent Rocket Engine Bell
      const bell = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.6, 20, 1, true), engineAlloy);
      bell.position.y = -2.2;
      bell.rotation.x = Math.PI;
      bell.castShadow = true;
      this.spacecraft.add(bell);

      // 4. Glowing Engine Exhaust Light
      this.engineLight = new THREE.PointLight(0x60a5fa, 5.0, 50);
      this.engineLight.position.set(0, -2.8, 0);
      this.engineLight.castShadow = true;
      this.spacecraft.add(this.engineLight);

      // 5. Volumetric Rocket Exhaust Plume Cone
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      this.exhaustPlume = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6.0, 16, 1, true), plumeMat);
      this.exhaustPlume.position.y = -5.0;
      this.spacecraft.add(this.exhaustPlume);

      // 6. Ascent Stage Crew Cabin
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

      // 7. 4 Outrigger Truss Landing Legs with Gold Pads & Contact Probes
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

  animate() {
    if (!this.isPlaying) return;

    this.animationId = requestAnimationFrame(() => this.animate());

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

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.simTime += dt;

    this.updateSimulationPhysics(this.simTime, dt);
    this.updateHUD(this.simTime);
    this.updateCamera(this.simTime, dt);

    if (this.controls && this.cameraMode === 'free') {
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

        for (let i = 0; i < 160; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 65,
            15 + Math.random() * 60,
            (Math.random() - 0.5) * 65
          );
          this.createParticle(new THREE.Vector3(0, 0.8, 0), vel, Math.random() > 0.4 ? 0xff3b00 : 0xffcc00, 3.2);
        }

        for (let i = 0; i < 220; i++) {
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
        const landY = Math.max(0.6, 12 - (t - 6.4) * 4);
        this.spacecraft.position.y = landY;
      }

    } else if (artifact.id === 'curiosity-skycrane') {
      if (t < 4.5) {
        const progress = t / 4.5;
        this.roverBody.position.y = Math.max(0.8, 14 - progress * 13.2);

        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const pos = new THREE.Vector3(Math.cos(ang) * 4.6, 18, Math.sin(ang) * 4.6);
          this.createParticle(pos, new THREE.Vector3(Math.cos(ang) * 6, -24 - Math.random() * 12, Math.sin(ang) * 6), 0x00f0ff, 0.45);
        }

        if (t > 2.0 && Math.random() < 0.8) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 18, 0.2, (Math.random() - 0.5) * 18),
            new THREE.Vector3((Math.random() - 0.5) * 16, 1 + Math.random() * 4, (Math.random() - 0.5) * 16),
            0xc86532,
            1.7
          );
        }
      } else if (t >= 4.5 && t < 4.8) {
        this.tetherGroup.visible = false;
        this.shakeIntensity = 0.6;
      } else if (t >= 4.8) {
        this.cranePlatform.position.x += 22 * dt;
        this.cranePlatform.position.y += 15 * dt;
        this.cranePlatform.rotation.z = -0.48;

        this.createParticle(
          this.cranePlatform.position.clone().add(new THREE.Vector3(-3.5, -1, 0)),
          new THREE.Vector3(-28 - Math.random() * 12, -18, 0),
          0xffaa00,
          0.65
        );

        if (t > 8.0 && !this.craneCrashed) {
          this.craneCrashed = true;
          this.cranePlatform.visible = false;
          this.shakeIntensity = 2.2;
          for (let i = 0; i < 75; i++) {
            this.createParticle(
              new THREE.Vector3(140, 2, 0),
              new THREE.Vector3((Math.random() - 0.5) * 40, Math.random() * 40, (Math.random() - 0.5) * 40),
              0xff5500,
              2.4
            );
          }
        }
      }

    } else {
      // Apollo Lunar Module / Viking / Venera / Huygens / Philae descent & touchdown
      if (t < 6.5) {
        const progress = t / 6.5;
        const ease = 1 - Math.pow(1 - progress, 2);
        const currentY = 80 - ease * 77.2;
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
          for (let i = 0; i < Math.floor(intensity * 8); i++) {
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
        this.spacecraft.position.y = 2.8;
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

  createParticle(position, velocity, color, maxLife) {
    const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.45, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.95
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

  updateAstronautWalk(dt) {
    const ws = this.walkState;
    const speed = 5.4; // m/s surface EVA pace
    let moveForward = 0;
    let moveRight = 0;

    if (ws.keys.w) moveForward += 1;
    if (ws.keys.s) moveForward -= 1;
    if (ws.keys.d) moveRight += 1;
    if (ws.keys.a) moveRight -= 1;

    const forwardX = -Math.sin(ws.yaw);
    const forwardZ = -Math.cos(ws.yaw);
    const rightX = Math.cos(ws.yaw);
    const rightZ = -Math.sin(ws.yaw);

    if (moveForward !== 0 || moveRight !== 0) {
      const len = Math.hypot(moveForward, moveRight) || 1;
      const nx = (forwardX * moveForward + rightX * moveRight) / len;
      const nz = (forwardZ * moveForward + rightZ * moveRight) / len;

      const candidateX = ws.x + nx * speed * dt;
      const candidateZ = ws.z + nz * speed * dt;
      // Prevent walking inside the core descent stage (< 4.2m radius)
      if (Math.hypot(candidateX, candidateZ) > 4.2 && Math.hypot(candidateX, candidateZ) < 120) {
        ws.x = candidateX;
        ws.z = candidateZ;
      }
      ws.stepPhase += dt * 7.5;
    }

    // Planetary gravity physics for jumping / walking over craters
    const body = this.currentArtifact ? this.currentArtifact.body : 'moon';
    const gravity = body === 'moon' ? 3.2 : body === 'outer' ? 2.8 : body === 'mars' ? 5.5 : 9.8;
    const groundY = this.getTerrainHeight(ws.x, ws.z) + ws.eyeHeight;

    if (!ws.isGrounded || ws.y > groundY + 0.05) {
      ws.vy -= gravity * dt;
      ws.y += ws.vy * dt;
      if (ws.y <= groundY) {
        ws.y = groundY;
        ws.vy = 0;
        ws.isGrounded = true;
      }
    } else {
      // Subtle low-gravity EVA head bobbing while walking
      const bob = (moveForward !== 0 || moveRight !== 0) ? Math.sin(ws.stepPhase) * 0.09 : 0;
      ws.y = groundY + bob;
    }

    this.camera.position.set(ws.x, ws.y, ws.z);
    const lookTarget = new THREE.Vector3(
      ws.x + forwardX * Math.cos(ws.pitch),
      ws.y + Math.sin(ws.pitch),
      ws.z + forwardZ * Math.cos(ws.pitch)
    );
    this.camera.lookAt(lookTarget);

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
      gravEl.innerText = isTr ? `YÜZEY YERÇEKİMİ: ${gravLabel} | GÖZ HİZASI: 1.75 m` : `SURFACE GRAVITY: ${gravLabel} | EYE LEVEL: 1.75 m`;
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
      if (thrustEl) thrustEl.innerText = "1:1 EVA YÜZEY YÜRÜYÜŞÜ (WebXR)";
      if (phaseEl) {
        phaseEl.innerText = isTr
          ? "🥽 1:1 ÖLÇEKTE YÜZEY KEŞFİ AKTİF (WASD + Fare ile Gezin)"
          : "🥽 1:1 TRUE-SCALE SURFACE WALK ACTIVE (WASD + Mouse Look)";
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
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 2.8) : 0;
      if (altEl) altEl.innerText = `${(currentY * 1.5).toFixed(1)} m`;
      if (speedEl) speedEl.innerText = currentY > 0.1 ? `-7.8 m/s (Aerodinamik Disk Freni)` : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = "92 ATM CO₂ Atmosferik Frenleme (465°C)";
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5
          ? (isTr ? "YOĞUN VENÜS ATMOSFERİNDE ALÇALMA" : "VENUS SUPERCRITICAL ATMOSPHERE DESCENT")
          : (isTr ? "✅ VENÜS BAZALT YÜZEYİNE İNİŞ TAMAMLANDI!" : "✅ VENUS BASALT SURFACE TOUCHDOWN CONFIRMED!");
      }
    } else {
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 2.8) : 0;
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
