/**
 * Cinematic 3D Mission Simulation Theater
 * Real-time reenactments of historical lunar & martian landings, kinetic impacts,
 * sky crane cable descents, and helicopter flights with particle physics and telemetry HUD.
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
    this.cameraMode = 'cinematic'; // 'cinematic', 'follow', 'ground', 'free'

    this.currentW = 0;
    this.currentH = 0;

    // Scene objects
    this.spacecraft = null;
    this.secondaryCraft = null;
    this.terrain = null;
    this.engineLight = null;
    this.shockwave = null;
    this.particles = [];
    this.shakeIntensity = 0;
    this.craneCrashed = false;
  }

  init() {
    this.overlay = document.getElementById('simulation-modal');
    this.canvas = document.getElementById('sim-canvas');
    if (!this.overlay || !this.canvas) return;

    // Determine initial dimensions safely
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
    this.renderer.toneMappingExposure = 1.25;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 2000);
    this.camera.position.set(30, 25, 55);

    // Orbit Controls for free rotation
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.maxDistance = 250;
      this.controls.minDistance = 2;
      this.controls.enabled = false;
    }

    // Window resize binding
    window.addEventListener('resize', () => this.onResize());

    // Modal UI Controls
    const closeBtn = document.getElementById('btn-close-sim');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.stopSimulation());
    }

    const replayBtn = document.getElementById('btn-replay-sim');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (this.currentArtifact) this.startSimulation(this.currentArtifact);
      });
    }

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) {
      camSelect.addEventListener('change', (e) => {
        this.cameraMode = e.target.value;
        if (this.controls) {
          this.controls.enabled = (this.cameraMode === 'free');
          if (this.spacecraft) {
            this.controls.target.copy(this.spacecraft.position);
          }
        }
      });
    }
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

  /**
   * Start 3D simulation for a specific historical artifact
   */
  startSimulation(artifact) {
    if (!this.overlay) {
      this.overlay = document.getElementById('simulation-modal');
      this.canvas = document.getElementById('sim-canvas');
    }
    if (!this.renderer) this.init();
    if (!this.overlay || !this.canvas) return;

    this.currentArtifact = artifact;
    this.simTime = 0;
    this.isPlaying = true;
    this.shakeIntensity = 0;
    this.craneCrashed = false;

    // Reset camera dropdown
    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) {
      camSelect.value = this.cameraMode;
    }

    // Open overlay
    this.overlay.classList.add('open');

    // Force layout update and resize
    this.onResize();
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 60);

    // Setup title and details in HUD
    const titleEl = document.getElementById('sim-title');
    const badgeEl = document.getElementById('sim-badge');
    const isTr = window.app ? window.app.currentLang === 'tr' : true;

    if (titleEl) titleEl.innerText = isTr ? artifact.name_tr : artifact.name_en;
    if (badgeEl) {
      if (artifact.category === 'impact') {
        badgeEl.innerText = isTr ? "💥 KİNETİK ÇARPIŞMA SİMÜLASYONU" : "💥 KINETIC IMPACT REENACTMENT";
        badgeEl.style.borderColor = "#ef4444";
        badgeEl.style.color = "#f87171";
      } else if (artifact.category === 'helicopter') {
        badgeEl.innerText = isTr ? "🚁 AERODİNAMİK UÇUŞ SİMÜLASYONU" : "🚁 AERODYNAMIC FLIGHT REENACTMENT";
        badgeEl.style.borderColor = "#00f0ff";
        badgeEl.style.color = "#00f0ff";
      } else if (artifact.id === 'curiosity-skycrane') {
        badgeEl.innerText = isTr ? "🚀 GÖKYÜZÜ VİNCİ İNİŞ & KAZA SİMÜLASYONU" : "🚀 SKY CRANE DESCENT & FLYAWAY";
        badgeEl.style.borderColor = "#ffb300";
        badgeEl.style.color = "#fde68a";
      } else {
        badgeEl.innerText = isTr ? "🛰️ YÜZEYE İNİŞ SİMÜLASYONU" : "🛰️ TOUCHDOWN REENACTMENT";
        badgeEl.style.borderColor = "#10b981";
        badgeEl.style.color = "#34d399";
      }
    }

    // Play authentic radio broadcast
    if (window.SpaceAudio) {
      window.SpaceAudio.playRadioTransmission(artifact.audioSnippet || artifact.quote_en || "");
    }

    // Build the specific 3D scene
    this.buildSimulationScene(artifact);

    // Start loop
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.lastTime = performance.now();
    this.animate();
  }

  stopSimulation() {
    this.isPlaying = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.overlay) this.overlay.classList.remove('open');

    // Clean up scene
    if (this.scene) {
      while (this.scene.children.length > 0) {
        const obj = this.scene.children[0];
        this.scene.remove(obj);
      }
    }
  }

  buildSimulationScene(artifact) {
    if (!this.scene) return;

    // Clear previous objects
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.particles = [];

    const isMoon = artifact.body === 'moon';

    // Sky & Lighting
    const skyColor = isMoon ? 0x05070c : 0x22110c;
    this.scene.background = new THREE.Color(skyColor);

    // Stars
    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1400;
      starPos[i * 3 + 1] = 40 + Math.random() * 700;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 1400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8 });
    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);

    // Terrain Surface
    const terrainGeo = new THREE.PlaneGeometry(350, 350, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    // Add craters and relief
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const d = Math.sqrt(vx * vx + vz * vz);
      let y = Math.sin(vx * 0.07) * Math.cos(vz * 0.07) * 1.8;
      if (artifact.category === 'impact' && d < 28) {
        y -= (1 - d / 28) * 3.8;
      }
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainColor = isMoon ? 0x757b85 : 0xc25b2d;
    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.9,
      metalness: 0.08,
      flatShading: true
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.scene.add(this.terrain);

    // Scattered Surface Rocks / Boulders
    const rockGeo = new THREE.DodecahedronGeometry(0.8, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMoon ? 0x5a5e66 : 0x8a3819,
      roughness: 0.95,
      metalness: 0.1
    });
    for (let i = 0; i < 28; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 180;
      const rz = (Math.random() - 0.5) * 180;
      if (Math.abs(rx) > 12 || Math.abs(rz) > 12) {
        const sc = 0.5 + Math.random() * 1.6;
        rock.scale.set(sc, sc * 0.7, sc);
        rock.position.set(rx, sc * 0.35, rz);
        rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        this.scene.add(rock);
      }
    }

    // High quality planetary lighting
    const sunLight = new THREE.DirectionalLight(0xfffaee, isMoon ? 2.6 : 2.2);
    sunLight.position.set(90, 140, 70);
    this.scene.add(sunLight);

    const ambLight = new THREE.AmbientLight(isMoon ? 0x334455 : 0x553322, 1.2);
    this.scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, isMoon ? 0x222630 : 0x331c14, 0.75);
    this.scene.add(hemiLight);

    // Build the spacecraft model
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;

    if (artifact.category === 'impact') {
      // Saturn V S-IVB / Centaur rocket stage
      const cylGeo = new THREE.CylinderGeometry(2.8, 2.8, 15, 24);
      const cylMat = new THREE.MeshStandardMaterial({ color: 0xdde3ea, metalness: 0.6, roughness: 0.3 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);

      // Black/White NASA roll stripes
      const stripeGeo = new THREE.CylinderGeometry(2.82, 2.82, 4.0, 24);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 2.0;

      const nozzleGeo = new THREE.ConeGeometry(2.0, 2.8, 16, 1, true);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x222429, metalness: 0.85, roughness: 0.2 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.y = -8.2;
      nozzle.rotation.x = Math.PI;

      this.spacecraft.add(cyl);
      this.spacecraft.add(stripe);
      this.spacecraft.add(nozzle);
      this.spacecraft.rotation.z = Math.PI * 0.38;
      this.spacecraft.position.set(-70, 95, 0);

    } else if (artifact.category === 'helicopter') {
      // Ingenuity Mars Helicopter
      const bodyGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.85, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, goldMat);

      // Solar Panel Mast
      const mastGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.8);
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
      const mast = new THREE.Mesh(mastGeo, darkMat);
      mast.position.y = 2.6;

      const solarGeo = new THREE.BoxGeometry(2.4, 0.08, 1.8);
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 });
      const solar = new THREE.Mesh(solarGeo, solarMat);
      solar.position.y = 4.5;

      // Carbon fiber rotor blades
      const bladeGeo = new THREE.BoxGeometry(9.6, 0.09, 0.7);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
      this.blade1 = new THREE.Mesh(bladeGeo, bladeMat);
      this.blade1.position.y = 3.0;
      this.blade2 = new THREE.Mesh(bladeGeo, bladeMat);
      this.blade2.position.y = 3.8;

      // 4 Carbon landing legs
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2), darkMat);
        leg.position.set(Math.cos(a) * 1.6, -1.2, Math.sin(a) * 1.6);
        leg.rotation.z = Math.cos(a) * 0.45;
        leg.rotation.x = Math.sin(a) * 0.45;
        this.spacecraft.add(leg);
      }

      this.spacecraft.add(body);
      this.spacecraft.add(mast);
      this.spacecraft.add(solar);
      this.spacecraft.add(this.blade1);
      this.spacecraft.add(this.blade2);
      this.spacecraft.position.set(0, 0.5, 0);

    } else if (artifact.id === 'curiosity-skycrane') {
      // Sky Crane platform + Rover tandem
      const craneGeo = new THREE.CylinderGeometry(4.8, 4.8, 1.0, 12);
      const craneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.3 });
      this.cranePlatform = new THREE.Mesh(craneGeo, craneMat);
      this.cranePlatform.position.y = 18;

      // 4 Canted rocket nozzles
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const noz = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0x222429 }));
        noz.position.set(Math.cos(ang) * 4.2, 17.4, Math.sin(ang) * 4.2);
        noz.rotation.z = Math.cos(ang) * 0.42;
        this.spacecraft.add(noz);
      }

      // Rover chassis
      const roverGeo = new THREE.BoxGeometry(4.4, 1.6, 5.2);
      const roverMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.3 });
      this.roverBody = new THREE.Mesh(roverGeo, roverMat);
      this.roverBody.position.y = 8;

      // Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      for (let wx = -1; wx <= 1; wx += 2) {
        for (let wz = -1.8; wz <= 1.8; wz += 1.8) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12), wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx * 2.6, -0.6, wz);
          this.roverBody.add(wheel);
        }
      }

      // 3 Tethers
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      this.tetherGroup = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const pts = [
          new THREE.Vector3(Math.cos(a) * 2.2, 17.5, Math.sin(a) * 2.2),
          new THREE.Vector3(Math.cos(a) * 1.6, 8.8, Math.sin(a) * 1.6)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        this.tetherGroup.add(new THREE.Line(lineGeo, lineMat));
      }

      this.spacecraft.add(this.cranePlatform);
      this.spacecraft.add(this.roverBody);
      this.spacecraft.add(this.tetherGroup);
      this.spacecraft.position.set(0, 16, 0);

    } else {
      // Apollo Lunar Module Descent Stage
      const baseGeo = new THREE.CylinderGeometry(4.4, 5.0, 2.8, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
      const base = new THREE.Mesh(baseGeo, goldMat);

      // Descent engine nozzle
      const bellGeo = new THREE.ConeGeometry(1.8, 2.4, 16, 1, true);
      const bellMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.85, roughness: 0.2 });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.position.y = -2.0;
      bell.rotation.x = Math.PI;

      // Rocket engine point light glow
      this.engineLight = new THREE.PointLight(0x60a5fa, 4.5, 45);
      this.engineLight.position.set(0, -2.5, 0);
      this.spacecraft.add(this.engineLight);

      // Ascent Stage Deck
      const deckGeo = new THREE.BoxGeometry(3.6, 2.2, 3.6);
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.7, roughness: 0.3 });
      const deck = new THREE.Mesh(deckGeo, silverMat);
      deck.position.y = 2.4;

      // 4 Outrigger truss landing legs with gold pads
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;

        const strut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 6.2),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
        );
        strut.position.set(4.2, -1.1, 0);
        strut.rotation.z = Math.PI / 4.2;
        legGroup.add(strut);

        const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.18, 12), goldMat);
        pad.position.set(6.4, -3.1, 0);
        legGroup.add(pad);

        // Surface contact probe wire hanging down
        const probe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
        );
        probe.position.set(6.4, -4.0, 0);
        legGroup.add(probe);

        this.spacecraft.add(legGroup);
      }

      this.spacecraft.add(base);
      this.spacecraft.add(bell);
      this.spacecraft.add(deck);
      this.spacecraft.position.set(0, 75, 0);
    }

    this.scene.add(this.spacecraft);

    // Initial Camera setup
    this.camera.position.set(28, 30, 65);
    this.camera.lookAt(0, 15, 0);

    if (this.controls && this.spacecraft) {
      this.controls.target.copy(this.spacecraft.position);
    }
  }

  /**
   * Main Simulation Loop
   */
  animate() {
    if (!this.isPlaying) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Auto-verify and adjust size if container dimensions became available
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
    this.updateCamera(this.simTime);

    if (this.controls && this.cameraMode === 'free') {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateSimulationPhysics(t, dt) {
    const artifact = this.currentArtifact;
    if (!artifact || !this.spacecraft) return;

    if (artifact.category === 'impact') {
      // 1. Kinetic Impact sequence (0s -> 3.2s dive, 3.2s impact!)
      if (t < 3.2) {
        const progress = t / 3.2;
        this.spacecraft.position.x = -70 + progress * 70;
        this.spacecraft.position.y = 95 - progress * 95;

        // Rocket booster trail
        if (Math.random() < 0.85) {
          this.createParticle(
            this.spacecraft.position.clone().add(new THREE.Vector3(-3, 3, 0)),
            new THREE.Vector3(-12 - Math.random() * 6, 10 + Math.random() * 6, (Math.random() - 0.5) * 4),
            0xffaa00,
            0.6
          );
        }
      } else if (t >= 3.2 && t < 3.35) {
        // IMPACT MOMENT!
        this.spacecraft.visible = false;
        this.shakeIntensity = 3.0;

        // Spawn massive fireball & shockwave
        for (let i = 0; i < 110; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 55,
            12 + Math.random() * 50,
            (Math.random() - 0.5) * 55
          );
          this.createParticle(new THREE.Vector3(0, 0.6, 0), vel, Math.random() > 0.4 ? 0xff4400 : 0xffea00, 2.8);
        }

        // Spawn regolith ejecta debris
        for (let i = 0; i < 140; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 80,
            6 + Math.random() * 30,
            (Math.random() - 0.5) * 80
          );
          this.createParticle(new THREE.Vector3(0, 0.3, 0), vel, 0xd0d5dd, 3.5);
        }
      }

    } else if (artifact.category === 'helicopter') {
      // 2. Ingenuity Helicopter Takeoff & Cruise
      if (this.blade1 && this.blade2) {
        const rpm = Math.min(t * 18, 70);
        this.blade1.rotation.y += rpm * dt;
        this.blade2.rotation.y -= rpm * dt;
      }

      if (t > 1.5 && t < 6.2) {
        const targetY = Math.min((t - 1.5) * 3.6, 12);
        this.spacecraft.position.y = targetY;
        this.spacecraft.position.x = Math.sin((t - 1.5) * 1.2) * 5;

        // Dust under rotors
        if (Math.random() < 0.7) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8),
            new THREE.Vector3((Math.random() - 0.5) * 7, Math.random() * 2.5, (Math.random() - 0.5) * 7),
            0xc25b2d,
            1.3
          );
        }
      } else if (t >= 6.2 && t < 9.2) {
        const landY = Math.max(0.5, 12 - (t - 6.2) * 4);
        this.spacecraft.position.y = landY;
      }

    } else if (artifact.id === 'curiosity-skycrane') {
      // 3. Curiosity Sky Crane lower rover, sever tethers, flyaway
      if (t < 4.5) {
        const progress = t / 4.5;
        this.roverBody.position.y = Math.max(0.8, 14 - progress * 13.2);

        // Rocket thruster plumes from 4 canted nozzles
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const pos = new THREE.Vector3(Math.cos(ang) * 4.2, 17, Math.sin(ang) * 4.2);
          this.createParticle(pos, new THREE.Vector3(Math.cos(ang) * 5, -22 - Math.random() * 10, Math.sin(ang) * 5), 0x00f0ff, 0.4);
        }

        // Dust on martian surface
        if (t > 2.0 && Math.random() < 0.75) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 16, 0.2, (Math.random() - 0.5) * 16),
            new THREE.Vector3((Math.random() - 0.5) * 14, 1 + Math.random() * 3.5, (Math.random() - 0.5) * 14),
            0xc46235,
            1.6
          );
        }
      } else if (t >= 4.5 && t < 4.8) {
        this.tetherGroup.visible = false;
        this.shakeIntensity = 0.5;
      } else if (t >= 4.8) {
        // Sky Crane flyaway!
        this.cranePlatform.position.x += 20 * dt;
        this.cranePlatform.position.y += 14 * dt;
        this.cranePlatform.rotation.z = -0.45;

        this.createParticle(
          this.cranePlatform.position.clone().add(new THREE.Vector3(-3, -1, 0)),
          new THREE.Vector3(-26 - Math.random() * 10, -16, 0),
          0xffaa00,
          0.6
        );

        // Crash in distance
        if (t > 8.0 && !this.craneCrashed) {
          this.craneCrashed = true;
          this.cranePlatform.visible = false;
          this.shakeIntensity = 2.0;
          for (let i = 0; i < 60; i++) {
            this.createParticle(
              new THREE.Vector3(130, 2, 0),
              new THREE.Vector3((Math.random() - 0.5) * 35, Math.random() * 35, (Math.random() - 0.5) * 35),
              0xff5500,
              2.2
            );
          }
        }
      }

    } else {
      // 4. Apollo Lunar Module / Viking Lander descent & touchdown
      if (t < 6.5) {
        const progress = t / 6.5;
        const ease = 1 - Math.pow(1 - progress, 2);
        const currentY = 75 - ease * 72.2;
        this.spacecraft.position.y = currentY;

        if (this.engineLight) {
          this.engineLight.intensity = 4.0 + Math.random() * 2.0;
        }

        // Rocket exhaust plume
        const exhaustPos = this.spacecraft.position.clone().add(new THREE.Vector3(0, -2.4, 0));
        for (let i = 0; i < 2; i++) {
          this.createParticle(
            exhaustPos,
            new THREE.Vector3((Math.random() - 0.5) * 2, -26 - Math.random() * 12, (Math.random() - 0.5) * 2),
            0xd0e8ff,
            0.4
          );
        }

        // Lunar regolith dust kicking up as altitude < 25m
        if (currentY < 25) {
          const intensity = (25 - currentY) / 25;
          for (let i = 0; i < Math.floor(intensity * 7); i++) {
            const dustOrigin = new THREE.Vector3((Math.random() - 0.5) * 7, 0.2, (Math.random() - 0.5) * 7);
            const dustVel = new THREE.Vector3(
              (Math.random() - 0.5) * 26 * intensity,
              Math.random() * 7 * intensity,
              (Math.random() - 0.5) * 26 * intensity
            );
            this.createParticle(dustOrigin, dustVel, 0x9ca3af, 1.9);
          }
        }
      } else {
        // Touchdown completed!
        this.spacecraft.position.y = 2.8;
        if (this.engineLight) {
          this.engineLight.intensity = 0; // Engine shutdown
        }
        if (t < 6.8) {
          this.shakeIntensity = 0.7;
        }
      }
    }

    // Update active particles
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
    const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.4, 6, 6);
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

  updateCamera(t) {
    if (!this.spacecraft) return;
    const sPos = this.spacecraft.position;

    if (this.cameraMode === 'free') {
      if (this.controls) {
        this.controls.enabled = true;
      }
      return;
    }

    if (this.controls) {
      this.controls.enabled = false;
    }

    if (this.cameraMode === 'follow') {
      this.camera.position.set(sPos.x + 16, sPos.y + 10, sPos.z + 28);
      this.camera.lookAt(sPos.x, sPos.y, sPos.z);
    } else if (this.cameraMode === 'ground') {
      this.camera.position.set(0, 2.0, 32);
      this.camera.lookAt(sPos.x, Math.max(1.0, sPos.y * 0.7), sPos.z);
    } else {
      // Cinematic Director Track
      const r = 44;
      const ang = t * 0.32;
      this.camera.position.set(
        Math.cos(ang) * r,
        Math.max(8, sPos.y * 0.4 + 14 + Math.sin(t * 0.25) * 5),
        Math.sin(ang) * r
      );
      this.camera.lookAt(sPos.x, Math.max(1.5, sPos.y * 0.5 + 2), sPos.z);
    }

    // Apply Camera Shake on impact/touchdown
    if (this.shakeIntensity > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.92;
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

    if (artifact.category === 'impact') {
      const speed = Math.max(0, 2580 - t * 40);
      const alt = Math.max(0, 9200 - t * 2800);
      if (altEl) altEl.innerText = `${Math.round(alt)} m`;
      if (speedEl) speedEl.innerText = `${Math.round(speed)} m/s (9,288 km/h)`;
      if (thrustEl) thrustEl.innerText = "0% (Balistik Serbest Düşüş)";
      if (phaseEl) {
        phaseEl.innerText = t < 3.2 
          ? (isTr ? "KİNETİK YÖRÜNGEDEN ALÇALMA" : "ORBITAL KINETIC PLUNGE")
          : (isTr ? "💥 ÇARPIŞMA: SİSMİK ÇAN DALGASI AKTİF" : "💥 IMPACT: SEISMIC RINGING ACTIVE");
      }
    } else if (artifact.category === 'helicopter') {
      const alt = this.spacecraft ? this.spacecraft.position.y : 0;
      if (altEl) altEl.innerText = `${alt.toFixed(1)} m`;
      if (speedEl) speedEl.innerText = `${(t < 5 ? 3.5 : 0.8).toFixed(1)} m/s`;
      if (thrustEl) thrustEl.innerText = "2,400 RPM (Çift Ters Rotor)";
      if (phaseEl) {
        phaseEl.innerText = t < 1.5 
          ? (isTr ? "ROTOR DÖNÜŞ BAŞLANGICI" : "ROTOR SPIN-UP")
          : t < 6.2 
            ? (isTr ? "DİKİNE UÇUŞ & SEYİR" : "VERTICAL CLIMB & CRUISE")
            : (isTr ? "VALINOR TEPELERİ İNİŞİ" : "VALINOR HILLS TOUCHDOWN");
      }
    } else {
      const currentY = this.spacecraft ? Math.max(0, this.spacecraft.position.y - 2.8) : 0;
      if (altEl) altEl.innerText = `${(currentY * 1.5).toFixed(1)} m`;
      if (speedEl) speedEl.innerText = currentY > 0.1 ? `-${Math.max(1.2, currentY * 0.15).toFixed(1)} m/s` : "0.0 m/s";
      if (thrustEl) thrustEl.innerText = currentY > 0.1 ? "78% (MLE İniş Roketi)" : "0% (MOTOR SUSTURULDU)";
      if (phaseEl) {
        phaseEl.innerText = currentY > 0.5 
          ? (isTr ? "FRENLEME & YUMUŞAK ALÇALMA" : "BRAKING & TERMINAL DESCENT")
          : (isTr ? "✅ TEMAS IŞIĞI YANDI: THE EAGLE HAS LANDED!" : "✅ TOUCHDOWN CONFIRMED: EAGLE HAS LANDED!");
      }
    }
  }
}

window.SpaceSimulation = new MissionSimulationTheater();
