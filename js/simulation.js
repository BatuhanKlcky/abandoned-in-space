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
    this.animationId = null;

    this.currentArtifact = null;
    this.simTime = 0;
    this.simDuration = 10; // seconds
    this.isPlaying = false;
    this.cameraMode = 'cinematic'; // 'cinematic', 'follow', 'ground'

    // Scene objects
    this.spacecraft = null;
    this.secondaryCraft = null;
    this.terrain = null;
    this.particles = [];
    this.shockwave = null;
    this.thrusterParticles = null;
    this.dustParticles = null;

    // Camera shake
    this.shakeIntensity = 0;
  }

  init() {
    this.overlay = document.getElementById('simulation-modal');
    this.canvas = document.getElementById('sim-canvas');
    if (!this.overlay || !this.canvas) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      2000
    );

    // Event listeners
    window.addEventListener('resize', () => this.onResize());

    const closeBtn = document.getElementById('btn-close-sim');
    if (closeBtn) closeBtn.addEventListener('click', () => this.stopSimulation());

    const replayBtn = document.getElementById('btn-replay-sim');
    if (replayBtn) replayBtn.addEventListener('click', () => {
      if (this.currentArtifact) this.startSimulation(this.currentArtifact);
    });

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) camSelect.addEventListener('change', (e) => {
      this.cameraMode = e.target.value;
    });
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /**
   * Start 3D simulation for a specific historical artifact
   */
  startSimulation(artifact) {
    if (!this.renderer) this.init();
    if (!this.overlay) return;

    this.currentArtifact = artifact;
    this.simTime = 0;
    this.isPlaying = true;
    this.shakeIntensity = 0;

    // Open overlay
    this.overlay.classList.add('open');
    this.onResize();

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
    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      this.scene.remove(obj);
    }
  }

  buildSimulationScene(artifact) {
    // Clear previous objects
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.particles = [];

    const isMoon = artifact.body === 'moon';

    // Sky & Lighting
    const skyColor = isMoon ? 0x000000 : 0x22110c; // Black vacuum for Moon, butterscotch for Mars
    this.scene.background = new THREE.Color(skyColor);

    // Stars
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1200;
      starPos[i * 3 + 1] = 50 + Math.random() * 600;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 1200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);

    // Terrain Surface
    const terrainGeo = new THREE.PlaneGeometry(300, 300, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    // Add terrain crater depressions & mounds
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const d = Math.sqrt(vx * vx + vz * vz);
      let y = Math.sin(vx * 0.08) * Math.cos(vz * 0.08) * 1.5;
      if (artifact.category === 'impact' && d < 25) {
        y -= (1 - d / 25) * 3.5; // Pre-carve crater depression
      }
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainColor = isMoon ? 0x6e7278 : 0xb55a30;
    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.95,
      metalness: 0.05,
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.scene.add(this.terrain);

    // Sun Lighting
    const sunLight = new THREE.DirectionalLight(0xfff6e5, isMoon ? 2.2 : 1.8);
    sunLight.position.set(100, 150, 80);
    this.scene.add(sunLight);

    const ambLight = new THREE.AmbientLight(isMoon ? 0x222630 : 0x442618, 0.7);
    this.scene.add(ambLight);

    // Build the craft model
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;

    if (artifact.category === 'impact') {
      // Saturn V S-IVB or Centaur rocket stage
      const cylGeo = new THREE.CylinderGeometry(2.5, 2.5, 14, 24);
      const cylMat = new THREE.MeshStandardMaterial({ color: 0xdde2e8, metalness: 0.4, roughness: 0.4 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);

      const nozzleGeo = new THREE.ConeGeometry(1.8, 2.5, 16, 1, true);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x2b2e35, metalness: 0.8 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.y = -7.5;
      nozzle.rotation.x = Math.PI;

      this.spacecraft.add(cyl);
      this.spacecraft.add(nozzle);
      this.spacecraft.rotation.z = Math.PI * 0.35; // Diving at angle
      this.spacecraft.position.set(-60, 90, 0);

    } else if (artifact.category === 'helicopter') {
      // Ingenuity Mars Helicopter
      const bodyGeo = new THREE.BoxGeometry(2, 2, 2);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.8, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, goldMat);

      const mastGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5);
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const mast = new THREE.Mesh(mastGeo, darkMat);
      mast.position.y = 2.5;

      const bladeGeo = new THREE.BoxGeometry(9, 0.08, 0.6);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      this.blade1 = new THREE.Mesh(bladeGeo, bladeMat);
      this.blade1.position.y = 2.8;
      this.blade2 = new THREE.Mesh(bladeGeo, bladeMat);
      this.blade2.position.y = 3.6;

      this.spacecraft.add(body);
      this.spacecraft.add(mast);
      this.spacecraft.add(this.blade1);
      this.spacecraft.add(this.blade2);
      this.spacecraft.position.set(0, 0.5, 0);

    } else if (artifact.id === 'curiosity-skycrane') {
      // Sky Crane + Rover tandem
      // 1. Sky Crane platform
      const craneGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.9, 8);
      const craneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
      this.cranePlatform = new THREE.Mesh(craneGeo, craneMat);
      this.cranePlatform.position.y = 18;

      // 4 Canted rocket nozzles
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const noz = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x334155 }));
        noz.position.set(Math.cos(ang) * 4, 17.5, Math.sin(ang) * 4);
        noz.rotation.z = Math.cos(ang) * 0.4;
        this.spacecraft.add(noz);
      }

      // Rover chassis
      const roverGeo = new THREE.BoxGeometry(4.2, 1.5, 5);
      const roverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
      this.roverBody = new THREE.Mesh(roverGeo, roverMat);
      this.roverBody.position.y = 8; // Being lowered

      // Tethers (3 lines)
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      this.tetherGroup = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const pts = [
          new THREE.Vector3(Math.cos(a) * 2, 17.5, Math.sin(a) * 2),
          new THREE.Vector3(Math.cos(a) * 1.5, 8.5, Math.sin(a) * 1.5)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        this.tetherGroup.add(new THREE.Line(lineGeo, lineMat));
      }

      this.spacecraft.add(this.cranePlatform);
      this.spacecraft.add(this.roverBody);
      this.spacecraft.add(this.tetherGroup);
      this.spacecraft.position.set(0, 15, 0);

    } else {
      // Apollo Lunar Module Descent Stage or Viking Lander
      const baseGeo = new THREE.CylinderGeometry(4.2, 4.8, 2.6, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.85, roughness: 0.25 });
      const base = new THREE.Mesh(baseGeo, goldMat);

      // Rocket nozzle
      const bellGeo = new THREE.ConeGeometry(1.6, 2.2, 16, 1, true);
      const bellMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.position.y = -1.8;
      bell.rotation.x = Math.PI;

      // 4 Outrigger Legs
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;

        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        strut.position.set(3.8, -1.0, 0);
        strut.rotation.z = Math.PI / 4;
        legGroup.add(strut);

        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.15, 12), goldMat);
        pad.position.set(5.8, -3.0, 0);
        legGroup.add(pad);

        this.spacecraft.add(legGroup);
      }

      this.spacecraft.add(base);
      this.spacecraft.add(bell);
      this.spacecraft.position.set(0, 75, 0); // Starting altitude
    }

    this.scene.add(this.spacecraft);

    // Initial Camera position
    this.camera.position.set(25, 30, 65);
    this.camera.lookAt(0, 10, 0);
  }

  /**
   * Main Simulation Loop
   */
  animate() {
    if (!this.isPlaying) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.simTime += dt;

    this.updateSimulationPhysics(this.simTime, dt);
    this.updateHUD(this.simTime);
    this.updateCamera(this.simTime);

    this.renderer.render(this.scene, this.camera);
  }

  updateSimulationPhysics(t, dt) {
    const artifact = this.currentArtifact;
    if (!artifact) return;

    if (artifact.category === 'impact') {
      // 1. Kinetic Impact sequence (0s -> 3s descent, 3s impact!)
      if (t < 3.2) {
        // Rocket diving at high speed
        const progress = t / 3.2;
        this.spacecraft.position.x = -60 + progress * 60;
        this.spacecraft.position.y = 90 - progress * 90;

        // Thruster sparks
        if (Math.random() < 0.8) {
          this.createParticle(
            this.spacecraft.position.clone().add(new THREE.Vector3(-2, 2, 0)),
            new THREE.Vector3(-10 - Math.random() * 5, 8 + Math.random() * 5, (Math.random() - 0.5) * 4),
            0xffaa00,
            0.6
          );
        }
      } else if (t >= 3.2 && t < 3.4) {
        // IMPACT MOMENT!
        this.spacecraft.visible = false;
        this.shakeIntensity = 2.5;

        // Spawn massive fireball & shockwave
        for (let i = 0; i < 90; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 50,
            10 + Math.random() * 45,
            (Math.random() - 0.5) * 50
          );
          this.createParticle(new THREE.Vector3(0, 0.5, 0), vel, Math.random() > 0.4 ? 0xff4400 : 0xffea00, 2.5);
        }

        // Spawn ground dust ejecta
        for (let i = 0; i < 120; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 70,
            5 + Math.random() * 25,
            (Math.random() - 0.5) * 70
          );
          this.createParticle(new THREE.Vector3(0, 0.2, 0), vel, 0xd0d5dd, 3.2);
        }
      }

    } else if (artifact.category === 'helicopter') {
      // 2. Ingenuity Helicopter Takeoff & Hover (0s to 8s)
      if (this.blade1 && this.blade2) {
        const rpm = Math.min(t * 15, 60);
        this.blade1.rotation.y += rpm * dt;
        this.blade2.rotation.y -= rpm * dt;
      }

      if (t > 1.5 && t < 6.0) {
        // Climb to 8m altitude and hover
        const targetY = Math.min((t - 1.5) * 3.5, 12);
        this.spacecraft.position.y = targetY;
        this.spacecraft.position.x = Math.sin((t - 1.5) * 1.2) * 4;

        // Swirling dust under rotor
        if (Math.random() < 0.6) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8),
            new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 2, (Math.random() - 0.5) * 6),
            0xb55a30,
            1.2
          );
        }
      } else if (t >= 6.0 && t < 9.0) {
        // Descend and touch down gently
        const landY = Math.max(0.5, 12 - (t - 6.0) * 4);
        this.spacecraft.position.y = landY;
      }

    } else if (artifact.id === 'curiosity-skycrane') {
      // 3. Curiosity Sky Crane lower rover, cut cords, flyaway!
      if (t < 4.5) {
        // Sky Crane hovering at 18m, lowering rover from 14m to 0.5m
        const progress = t / 4.5;
        this.roverBody.position.y = Math.max(0.8, 14 - progress * 13.2);

        // Rocket thruster plumes from 4 nozzles
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const pos = new THREE.Vector3(Math.cos(ang) * 4, 17, Math.sin(ang) * 4);
          this.createParticle(pos, new THREE.Vector3(Math.cos(ang) * 5, -20 - Math.random() * 10, Math.sin(ang) * 5), 0x00f0ff, 0.4);
        }

        // Dust on martian surface
        if (t > 2.0 && Math.random() < 0.7) {
          this.createParticle(
            new THREE.Vector3((Math.random() - 0.5) * 15, 0.2, (Math.random() - 0.5) * 15),
            new THREE.Vector3((Math.random() - 0.5) * 12, 1 + Math.random() * 3, (Math.random() - 0.5) * 12),
            0xc46235,
            1.5
          );
        }
      } else if (t >= 4.5 && t < 4.8) {
        // Touchdown confirmed, cut tethers!
        this.tetherGroup.visible = false;
        this.shakeIntensity = 0.5;
      } else if (t >= 4.8) {
        // Sky Crane flyaway!
        const dtFly = t - 4.8;
        this.cranePlatform.position.x += 18 * dt;
        this.cranePlatform.position.y += 12 * dt;
        this.cranePlatform.rotation.z = -0.45;

        // Roaring rocket plume
        this.createParticle(
          this.cranePlatform.position.clone().add(new THREE.Vector3(-3, -1, 0)),
          new THREE.Vector3(-25 - Math.random() * 10, -15, 0),
          0xffaa00,
          0.6
        );

        // 650m away crash at t=8.5s
        if (t > 8.0 && !this.craneCrashed) {
          this.craneCrashed = true;
          this.cranePlatform.visible = false;
          this.shakeIntensity = 1.8;
          // Distant fireball
          for (let i = 0; i < 50; i++) {
            this.createParticle(
              new THREE.Vector3(120, 2, 0),
              new THREE.Vector3((Math.random() - 0.5) * 30, Math.random() * 30, (Math.random() - 0.5) * 30),
              0xff5500,
              2.0
            );
          }
        }
      }

    } else {
      // 4. Apollo Lunar Module / Viking Lander descent & touchdown
      if (t < 6.5) {
        // Smooth descent from 75m to 2.8m (footpads touching surface)
        const progress = t / 6.5;
        const ease = 1 - Math.pow(1 - progress, 2); // Slows down near touchdown
        const currentY = 75 - ease * 72.2;
        this.spacecraft.position.y = currentY;

        // Main descent engine plume (blue-white rocket exhaust)
        const exhaustPos = this.spacecraft.position.clone().add(new THREE.Vector3(0, -2, 0));
        for (let i = 0; i < 2; i++) {
          this.createParticle(
            exhaustPos,
            new THREE.Vector3((Math.random() - 0.5) * 2, -25 - Math.random() * 10, (Math.random() - 0.5) * 2),
            0xd0e8ff,
            0.4
          );
        }

        // Regolith dust kicking up as altitude < 25m
        if (currentY < 25) {
          const intensity = (25 - currentY) / 25;
          for (let i = 0; i < Math.floor(intensity * 6); i++) {
            const dustOrigin = new THREE.Vector3((Math.random() - 0.5) * 6, 0.2, (Math.random() - 0.5) * 6);
            const dustVel = new THREE.Vector3(
              (Math.random() - 0.5) * 25 * intensity,
              Math.random() * 6 * intensity,
              (Math.random() - 0.5) * 25 * intensity
            );
            this.createParticle(dustOrigin, dustVel, 0x9ca3af, 1.8);
          }
        }
      } else {
        // Touchdown completed!
        this.spacecraft.position.y = 2.8;
        if (t < 6.8) {
          this.shakeIntensity = 0.6; // Small touchdown bump
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
        p.velocity.y -= 9.8 * 0.2 * dt; // Lower gravity
        p.mesh.material.opacity = p.life / p.maxLife;
      }
    }
  }

  createParticle(position, velocity, color, maxLife) {
    const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.4, 6, 6);
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

  updateCamera(t) {
    // Smooth camera positioning based on mode
    if (this.cameraMode === 'follow' && this.spacecraft) {
      const targetPos = this.spacecraft.position.clone();
      this.camera.position.set(targetPos.x + 15, targetPos.y + 8, targetPos.z + 30);
      this.camera.lookAt(targetPos);
    } else if (this.cameraMode === 'ground') {
      this.camera.position.set(0, 1.5, 25);
      if (this.spacecraft) this.camera.lookAt(this.spacecraft.position);
    } else {
      // Cinematic Director Track
      const r = 45;
      const ang = t * 0.35;
      this.camera.position.set(Math.cos(ang) * r, 18 + Math.sin(t * 0.2) * 6, Math.sin(ang) * r);
      if (this.spacecraft) {
        this.camera.lookAt(this.spacecraft.position.x, this.spacecraft.position.y * 0.5 + 2, this.spacecraft.position.z);
      }
    }

    // Apply Camera Shake on impact/touchdown
    if (this.shakeIntensity > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.92; // Decay
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
          : t < 6.0 
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
