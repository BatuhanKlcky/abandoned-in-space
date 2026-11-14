/**
 * Cinematic 3D Mission Simulation Theater — High-Fidelity Historical Reenactments
 * Authentic models of Apollo Lunar Modules, Saturn V S-IVB boosters, Curiosity Sky Crane,
 * and Ingenuity with dynamic shadows, planetary environments (Earth in Lunar sky, craters, mountains),
 * exhaust Mach diamonds, and ballistic particle physics.
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

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 2500);
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
        if (this.currentArtifact) this.startSimulation(this.currentArtifact);
      });
    }

    const camSelect = document.getElementById('sim-cam-select');
    if (camSelect) {
      camSelect.addEventListener('change', (e) => {
        this.cameraMode = e.target.value;
        if (this.controls) {
          this.controls.enabled = (this.cameraMode === 'free');
          if (this.spacecraft) this.controls.target.copy(this.spacecraft.position);
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
      } else {
        badgeEl.innerText = isTr ? "🛰️ YÜZEYE İNİŞ CANLANDIRMASI" : "🛰️ TOUCHDOWN REENACTMENT";
        badgeEl.style.borderColor = "#10b981";
        badgeEl.style.color = "#34d399";
      }
    }

    // Authentic voice transmission
    if (window.SpaceAudio) {
      window.SpaceAudio.playRadioTransmission(artifact.audioSnippet || artifact.quote_en || "");
    }

    this.buildSimulationScene(artifact);

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.lastTime = performance.now();
    this.animate();
  }

  stopSimulation() {
    this.isPlaying = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
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

    const isMoon = artifact.body === 'moon';

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

      // Swirling white clouds layer
      const cloudGeo = new THREE.SphereGeometry(16.3, 32, 32);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.9
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);

      // Atmospheric blue halo glow
      const haloGeo = new THREE.SphereGeometry(18, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);

      earthGroup.add(earthMesh);
      earthGroup.add(clouds);
      earthGroup.add(halo);
      this.scene.add(earthGroup);

    } else {
      // Mars Sky with butterscotch dust fog
      this.scene.background = new THREE.Color(0x2d170f);
      this.scene.fog = new THREE.FogExp2(0x2d170f, 0.0032);

      // Phobos irregular moon
      const phobosGeo = new THREE.DodecahedronGeometry(5.5, 1);
      const phobosMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
      const phobos = new THREE.Mesh(phobosGeo, phobosMat);
      phobos.scale.set(1.4, 0.9, 1.1);
      phobos.position.set(160, 130, -280);
      this.scene.add(phobos);
    }

    // Stars Field
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
      opacity: isMoon ? 0.9 : 0.6
    });
    this.scene.add(new THREE.Points(starGeo, starMat));

    // High-Resolution Cratered Terrain
    const terrainGeo = new THREE.PlaneGeometry(420, 420, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const d = Math.sqrt(vx * vx + vz * vz);

      // Organic crater depression rings and rolling dunes
      let y = Math.sin(vx * 0.06) * Math.cos(vz * 0.06) * 2.2;
      y += Math.sin(vx * 0.12 + 1.2) * 0.8;

      // Primary landing / impact crater feature
      if (d < 35) {
        const factor = d / 35;
        // Raised crater rim at edge, depression in center
        if (factor > 0.7) {
          y += (1 - Math.abs(factor - 0.85) / 0.15) * 1.8;
        } else {
          y -= (1 - factor / 0.7) * 3.5;
        }
      }

      // Perimeter mountain ranges
      if (d > 140) {
        const edge = (d - 140) / 70;
        y += Math.sin(vx * 0.08) * Math.cos(vz * 0.08) * (edge * 24);
      }

      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainColor = isMoon ? 0x787e87 : 0xc45c2c;
    const terrainMat = new THREE.MeshStandardMaterial({
      color: terrainColor,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: true
    });
    this.terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // Scattered Rock Boulders with Shadows
    const rockGeo = new THREE.DodecahedronGeometry(0.85, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMoon ? 0x555a63 : 0x8a3c1b,
      roughness: 0.95,
      metalness: 0.15,
      flatShading: true
    });
    for (let i = 0; i < 36; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 220;
      const rz = (Math.random() - 0.5) * 220;
      if (Math.abs(rx) > 10 || Math.abs(rz) > 10) {
        const sc = 0.6 + Math.random() * 2.2;
        rock.scale.set(sc, sc * (0.5 + Math.random() * 0.5), sc);
        rock.position.set(rx, sc * 0.35, rz);
        rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      }
    }

    // Authentic Lunar Landing Site Artifacts (Moon Lander scenes only)
    if (isMoon && artifact.category === 'lander') {
      // American Flag on lunar regolith
      const flagGroup = new THREE.Group();
      flagGroup.position.set(12, 0.2, 8);

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
        fabricPos.setZ(fi, Math.sin(fx * 5.0) * 0.08); // Authentic wrinkles
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

      // ALSEP Scientific Instrument Station Box
      const alsepBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.9, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 })
      );
      alsepBox.position.set(-14, 0.45, 12);
      alsepBox.castShadow = true;
      this.scene.add(alsepBox);

      // ALSEP Antenna
      const alsepAnt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
      );
      alsepAnt.position.set(-14, 1.5, 12);
      this.scene.add(alsepAnt);
    }

    // Dynamic Sun Light with Crisp Soft Shadows
    const sunLight = new THREE.DirectionalLight(0xfffaed, isMoon ? 2.8 : 2.4);
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

    // Fill Ambient & Hemisphere Lights
    const ambLight = new THREE.AmbientLight(isMoon ? 0x384454 : 0x553222, 1.3);
    this.scene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, isMoon ? 0x222630 : 0x3d1c14, 0.85);
    this.scene.add(hemiLight);

    // =========================================================================
    // HIGH-PRECISION 3D SPACECRAFT CRAFTING
    // =========================================================================
    this.spacecraft = new THREE.Group();
    this.secondaryCraft = null;

    if (artifact.category === 'impact') {
      // -----------------------------------------------------------------------
      // SATURN V S-IVB / CENTAUR ROCKET STAGE (True Dimensions & Details)
      // -----------------------------------------------------------------------
      const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xededed, metalness: 0.45, roughness: 0.35 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.7 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });

      // Massive Rocket Hull (6.6m diameter, 16m length)
      const hullGeo = new THREE.CylinderGeometry(3.3, 3.3, 16, 32);
      const hull = new THREE.Mesh(hullGeo, whiteMat);
      hull.castShadow = true;
      hull.receiveShadow = true;
      this.spacecraft.add(hull);

      // NASA Black Roll-Pattern Quadrant Stripes
      const stripeGeo = new THREE.CylinderGeometry(3.32, 3.32, 4.2, 32);
      const stripe = new THREE.Mesh(stripeGeo, darkMat);
      stripe.position.y = 2.5;
      stripe.castShadow = true;
      this.spacecraft.add(stripe);

      // Forward Dome
      const domeGeo = new THREE.SphereGeometry(3.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
      const dome = new THREE.Mesh(domeGeo, whiteMat);
      dome.position.y = 8.0;
      this.spacecraft.add(dome);

      // Rocketdyne J-2 Engine Bell with Gimbal Actuators & Heat Shield
      const nozzleGeo = new THREE.ConeGeometry(2.3, 3.2, 24, 1, true);
      const nozzle = new THREE.Mesh(nozzleGeo, steelMat);
      nozzle.position.y = -9.2;
      nozzle.rotation.x = Math.PI;
      nozzle.castShadow = true;
      this.spacecraft.add(nozzle);

      // Turbine Exhaust Duct pipe alongside the nozzle
      const ductGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.0);
      const duct = new THREE.Mesh(ductGeo, steelMat);
      duct.position.set(1.6, -9.0, 0);
      this.spacecraft.add(duct);

      // APS (Auxiliary Propulsion System) pods on flanks
      for (let pi = 0; pi < 2; pi++) {
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), darkMat);
        pod.position.set(pi === 0 ? 3.4 : -3.4, -4.0, 0);
        this.spacecraft.add(pod);
      }

      this.spacecraft.rotation.z = Math.PI * 0.38;
      this.spacecraft.position.set(-75, 100, 0);

    } else if (artifact.category === 'helicopter') {
      // -----------------------------------------------------------------------
      // INGENUITY MARS HELICOPTER
      // -----------------------------------------------------------------------
      const goldFoil = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.9, roughness: 0.18 });
      const carbon = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
      const solarCell = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 });
      const darkLegs = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });

      // Fuselage box wrapped in Kapton
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), goldFoil);
      body.castShadow = true;
      this.spacecraft.add(body);

      // Mast with Solar Panel Array
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2), carbon);
      mast.position.y = 2.8;
      this.spacecraft.add(mast);

      const solar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.9), solarCell);
      solar.position.y = 4.8;
      solar.castShadow = true;
      this.spacecraft.add(solar);

      // Upper and lower swashplate linkages
      for (let si = 0; si < 2; si++) {
        const swash = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2), darkLegs);
        swash.position.y = si === 0 ? 3.1 : 3.9;
        this.spacecraft.add(swash);
      }

      // Dual Coaxial Counter-Rotating Rotor Blades
      const bladeGeo = new THREE.BoxGeometry(10.2, 0.08, 0.75);
      this.blade1 = new THREE.Mesh(bladeGeo, carbon);
      this.blade1.position.y = 3.2;
      this.blade1.castShadow = true;

      this.blade2 = new THREE.Mesh(bladeGeo, carbon);
      this.blade2.position.y = 4.0;
      this.blade2.castShadow = true;

      this.spacecraft.add(this.blade1);
      this.spacecraft.add(this.blade2);

      // 4 Spring-Loaded Carbon Landing Legs
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
      // -----------------------------------------------------------------------
      // CURIOSITY SKY CRANE & ROVER TANDEM
      // -----------------------------------------------------------------------
      const craneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.25 });
      const roverWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.3 });
      const darkSteel = new THREE.MeshStandardMaterial({ color: 0x222630, metalness: 0.85 });
      const goldFoil = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.2 });

      // Sky Crane Octagonal Frame
      this.cranePlatform = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1.2, 12), craneMat);
      this.cranePlatform.position.y = 19;
      this.cranePlatform.castShadow = true;

      // 4 Pairs of Canted Mars Landing Engines (MLE)
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 8, 1, true), darkSteel);
        nozzle.position.set(Math.cos(ang) * 4.6, 18.2, Math.sin(ang) * 4.6);
        nozzle.rotation.z = Math.cos(ang) * 0.45;
        this.cranePlatform.add(nozzle);
      }
      this.spacecraft.add(this.cranePlatform);

      // Suspended Curiosity Rover
      this.roverBody = new THREE.Group();
      this.roverBody.position.y = 8.5;

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.7, 5.4), roverWhite);
      chassis.castShadow = true;
      this.roverBody.add(chassis);

      // SuperCam Remote Sensing Mast
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2), darkSteel);
      mast.position.set(1.4, 2.4, 1.8);
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.9), darkSteel);
      head.position.set(1.4, 4.0, 1.8);
      this.roverBody.add(mast);
      this.roverBody.add(head);

      // Rear MMRTG Nuclear Power Generator cylinder with fins
      const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.2, 12), goldFoil);
      rtg.rotation.x = Math.PI / 2;
      rtg.position.set(0, 0.4, -3.2);
      this.roverBody.add(rtg);

      // 6 Cleated Aluminum Wheels with Rocker-Bogie Legs
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

      // 3 Braided Steel Bridle Tethers
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

    } else {
      // -----------------------------------------------------------------------
      // APOLLO LUNAR MODULE (LM) — COMPLETE DESCENT & ASCENT STAGE FIDELITY
      // -----------------------------------------------------------------------
      const goldKapton = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        flatShading: true
      });
      const blackShield = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.65
      });
      const silverAlum = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.25
      });
      const engineAlloy = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        metalness: 0.85,
        roughness: 0.2
      });

      // 1. Octagonal Descent Stage Core
      const baseGeo = new THREE.CylinderGeometry(4.6, 5.2, 2.9, 8);
      const base = new THREE.Mesh(baseGeo, goldKapton);
      base.castShadow = true;
      base.receiveShadow = true;
      this.spacecraft.add(base);

      // Black thermal blanket panels on alternating quadrants
      const quadShield = new THREE.Mesh(new THREE.BoxGeometry(4.7, 2.92, 2.4), blackShield);
      this.spacecraft.add(quadShield);

      // 2. MESA (Modular Equipment Stowage Assembly) Bay on Quadrant 4
      const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.2), silverAlum);
      mesa.position.set(0, 0, 4.4);
      mesa.castShadow = true;
      this.spacecraft.add(mesa);

      // 3. Central Aerojet DPS Descent Rocket Engine Bell
      const bellGeo = new THREE.ConeGeometry(2.0, 2.6, 20, 1, true);
      const bell = new THREE.Mesh(bellGeo, engineAlloy);
      bell.position.y = -2.2;
      bell.rotation.x = Math.PI;
      bell.castShadow = true;
      this.spacecraft.add(bell);

      // 4. Glowing Engine Exhaust Light (Pulsating rocket flame illumination)
      this.engineLight = new THREE.PointLight(0x60a5fa, 5.0, 50);
      this.engineLight.position.set(0, -2.8, 0);
      this.engineLight.castShadow = true;
      this.spacecraft.add(this.engineLight);

      // 5. Volumetric Rocket Exhaust Plume Cone
      const plumeGeo = new THREE.ConeGeometry(1.6, 6.0, 16, 1, true);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      this.exhaustPlume = new THREE.Mesh(plumeGeo, plumeMat);
      this.exhaustPlume.position.y = -5.0;
      this.spacecraft.add(this.exhaustPlume);

      // 6. Ascent Stage (Crew Cabin Deck) on Top
      const cabinGeo = new THREE.BoxGeometry(3.8, 2.4, 3.8);
      const cabin = new THREE.Mesh(cabinGeo, silverAlum);
      cabin.position.y = 2.6;
      cabin.castShadow = true;
      this.spacecraft.add(cabin);

      // Forward EVA Porch & Triangular Crew Cockpit Windows
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
      this.spacecraft.add(winL);
      this.spacecraft.add(winR);

      // S-Band Steerable High-Gain Dish Antenna pointing toward Earth
      const dishGeo = new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
      const dish = new THREE.Mesh(dishGeo, silverAlum);
      dish.position.set(-2.2, 4.4, -1.8);
      dish.rotation.x = -Math.PI * 0.65;
      dish.rotation.y = Math.PI * 0.3;
      this.spacecraft.add(dish);

      // 4 Reaction Control System (RCS) Quad Thruster Clusters
      for (let qi = 0; qi < 4; qi++) {
        const qAng = (qi * Math.PI) / 2;
        const qGroup = new THREE.Group();
        qGroup.position.set(Math.cos(qAng) * 2.4, 3.2, Math.sin(qAng) * 2.4);
        const rcsBlock = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), engineAlloy);
        qGroup.add(rcsBlock);
        this.spacecraft.add(qGroup);
      }

      // 7. 4 Outrigger Truss Landing Legs with Gold Pads & Contact Probes
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = ang;

        // Primary A-Frame Strut
        const strut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 6.6),
          silverAlum
        );
        strut.position.set(4.4, -1.2, 0);
        strut.rotation.z = Math.PI / 4.1;
        strut.castShadow = true;
        legGroup.add(strut);

        // Concave Gold Footpad
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 1.1, 0.2, 16),
          goldKapton
        );
        pad.position.set(6.8, -3.2, 0);
        pad.castShadow = true;
        legGroup.add(pad);

        // Lunar Contact Sensing Probe hanging 1.7m beneath pad
        const probe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 2.0),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
        );
        probe.position.set(6.8, -4.2, 0);
        legGroup.add(probe);

        // Forward leg ladder (on leg 0)
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

    // Auto-verify and adjust resolution
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
      // 1. Saturn V S-IVB / Centaur Kinetic Impact (0s to 3.2s dive, 3.2s impact!)
      if (t < 3.2) {
        const progress = t / 3.2;
        this.spacecraft.position.x = -75 + progress * 75;
        this.spacecraft.position.y = 100 - progress * 100;

        // Exhaust / re-entry friction glow
        if (Math.random() < 0.9) {
          this.createParticle(
            this.spacecraft.position.clone().add(new THREE.Vector3(-4, 4, 0)),
            new THREE.Vector3(-15 - Math.random() * 8, 12 + Math.random() * 8, (Math.random() - 0.5) * 5),
            0xff9900,
            0.65
          );
        }
      } else if (t >= 3.2 && !this.impactTriggered) {
        // IMPACT MOMENT!
        this.impactTriggered = true;
        this.spacecraft.visible = false;
        this.shakeIntensity = 4.0;

        // Blinding flash light
        const flashLight = new THREE.PointLight(0xfffaed, 18, 120);
        flashLight.position.set(0, 3, 0);
        this.scene.add(flashLight);
        setTimeout(() => this.scene.remove(flashLight), 350);

        // Expanding shockwave ring on regolith
        const ringGeo = new THREE.RingGeometry(0.5, 4.0, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        this.shockwave = new THREE.Mesh(ringGeo, ringMat);
        this.shockwave.position.y = 0.4;
        this.scene.add(this.shockwave);

        // Spawn 160 fiery fireball fragments
        for (let i = 0; i < 160; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 65,
            15 + Math.random() * 60,
            (Math.random() - 0.5) * 65
          );
          this.createParticle(new THREE.Vector3(0, 0.8, 0), vel, Math.random() > 0.4 ? 0xff3b00 : 0xffcc00, 3.2);
        }

        // Spawn 220 high-speed lunar regolith ejecta particles in vacuum parabolas
        for (let i = 0; i < 220; i++) {
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 95,
            8 + Math.random() * 40,
            (Math.random() - 0.5) * 95
          );
          this.createParticle(new THREE.Vector3(0, 0.4, 0), vel, 0xdbeafe, 4.0);
        }
      }

      // Expand shockwave
      if (this.shockwave) {
        this.shockwave.scale.multiplyScalar(1.08);
        this.shockwave.material.opacity *= 0.94;
        if (this.shockwave.material.opacity < 0.05) {
          this.scene.remove(this.shockwave);
          this.shockwave = null;
        }
      }

    } else if (artifact.category === 'helicopter') {
      // 2. Ingenuity Helicopter Takeoff & Cruise
      if (this.blade1 && this.blade2) {
        const rpm = Math.min(t * 22, 85);
        this.blade1.rotation.y += rpm * dt;
        this.blade2.rotation.y -= rpm * dt;
      }

      if (t > 1.5 && t < 6.4) {
        const targetY = Math.min((t - 1.5) * 3.8, 12);
        this.spacecraft.position.y = targetY;
        this.spacecraft.position.x = Math.sin((t - 1.5) * 1.2) * 6;

        // Downward martian dust vortex
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
      // 3. Curiosity Sky Crane lowering rover, severing cords, flyaway
      if (t < 4.5) {
        const progress = t / 4.5;
        this.roverBody.position.y = Math.max(0.8, 14 - progress * 13.2);

        // Canted rocket exhaust from 4 MLE pods
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const pos = new THREE.Vector3(Math.cos(ang) * 4.6, 18, Math.sin(ang) * 4.6);
          this.createParticle(pos, new THREE.Vector3(Math.cos(ang) * 6, -24 - Math.random() * 12, Math.sin(ang) * 6), 0x00f0ff, 0.45);
        }

        // Dust under sky crane
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
        // Sky Crane flyaway!
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
      // 4. Apollo Lunar Module / Viking descent & touchdown
      if (t < 6.5) {
        const progress = t / 6.5;
        const ease = 1 - Math.pow(1 - progress, 2);
        const currentY = 80 - ease * 77.2;
        this.spacecraft.position.y = currentY;

        // Pulsating rocket light & exhaust plume
        if (this.engineLight) {
          this.engineLight.intensity = 4.5 + Math.random() * 2.5;
        }
        if (this.exhaustPlume) {
          this.exhaustPlume.scale.set(1.0 + Math.random() * 0.2, 1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.2);
          this.exhaustPlume.material.opacity = 0.5 + Math.random() * 0.3;
        }

        const exhaustPos = this.spacecraft.position.clone().add(new THREE.Vector3(0, -2.6, 0));
        for (let i = 0; i < 3; i++) {
          this.createParticle(
            exhaustPos,
            new THREE.Vector3((Math.random() - 0.5) * 2.5, -28 - Math.random() * 14, (Math.random() - 0.5) * 2.5),
            0xd0e8ff,
            0.45
          );
        }

        // Ballistic lunar regolith dust blowing outward as altitude < 28m
        if (currentY < 28) {
          const intensity = (28 - currentY) / 28;
          for (let i = 0; i < Math.floor(intensity * 8); i++) {
            const dustOrigin = new THREE.Vector3((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8);
            const dustVel = new THREE.Vector3(
              (Math.random() - 0.5) * 30 * intensity,
              Math.random() * 8 * intensity,
              (Math.random() - 0.5) * 30 * intensity
            );
            this.createParticle(dustOrigin, dustVel, 0x9ca3af, 2.0);
          }
        }
      } else {
        // Touchdown completed!
        this.spacecraft.position.y = 2.8;
        if (this.engineLight) this.engineLight.intensity = 0;
        if (this.exhaustPlume) this.exhaustPlume.visible = false;
        if (t < 6.8) {
          this.shakeIntensity = 0.8;
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

  updateCamera(t) {
    if (!this.spacecraft) return;
    const sPos = this.spacecraft.position;

    if (this.cameraMode === 'free') {
      if (this.controls) this.controls.enabled = true;
      return;
    }

    if (this.controls) this.controls.enabled = false;

    if (this.cameraMode === 'follow') {
      // Follow closely behind and above craft
      this.camera.position.set(sPos.x + 18, sPos.y + 11, sPos.z + 32);
      this.camera.lookAt(sPos.x, sPos.y, sPos.z);
    } else if (this.cameraMode === 'ground') {
      // Surface tracking camera
      this.camera.position.set(0, 2.2, 34);
      this.camera.lookAt(sPos.x, Math.max(1.2, sPos.y * 0.7), sPos.z);
    } else {
      // Cinematic Director Track
      const r = 46;
      const ang = t * 0.32;
      this.camera.position.set(
        Math.cos(ang) * r,
        Math.max(9, sPos.y * 0.4 + 15 + Math.sin(t * 0.25) * 5),
        Math.sin(ang) * r
      );
      this.camera.lookAt(sPos.x, Math.max(1.5, sPos.y * 0.5 + 2.2), sPos.z);
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
