/**
 * Three.js 3D Celestial Engine, Beacons, Starfield, and Holographic Artifact Mini-Viewer
 */

class SpaceSceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentBody = 'moon'; // 'moon' or 'mars'
    this.artifacts = [];
    this.pins = [];
    this.selectedArtifact = null;
    this.hoveredArtifact = null;

    this.sphereRadius = 100;
    this.isAutoRotating = true;
    this.autoRotateSpeed = 0.0006;

    this.initScene();
    this.initStarfield();
    this.initPlanets();
    this.initLighting();
    this.initAtmosphere();
    this.initMiniViewer();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      1,
      8000
    );
    this.camera.position.set(30, 15, 290);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 118;
    this.controls.maxDistance = 650;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.8;
    this.controls.enablePan = false;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Planet Root Group
    this.planetGroup = new THREE.Group();
    this.scene.add(this.planetGroup);

    // Pins Group
    this.pinsGroup = new THREE.Group();
    this.planetGroup.add(this.pinsGroup);
  }

  initStarfield() {
    const starCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xdce6ff),
      new THREE.Color(0xffeedd),
      new THREE.Color(0xaaccff),
      new THREE.Color(0xffccaa),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 2500 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  initPlanets() {
    const sphereGeo = new THREE.SphereGeometry(this.sphereRadius, 96, 64);
    const textureLoader = new THREE.TextureLoader();

    // 1. Moon Materials with Real NASA Photographic Texture
    const moonTex = textureLoader.load('assets/moon.jpg');
    const moonBump = textureLoader.load('assets/moon_bump.jpg');

    this.moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTex,
      bumpMap: moonBump,
      bumpScale: 0.85,
      roughness: 0.90,
      metalness: 0.05,
    });

    this.moonMesh = new THREE.Mesh(sphereGeo, this.moonMaterial);
    this.moonMesh.rotation.x = THREE.MathUtils.degToRad(1.5); // Moon axial tilt
    this.planetGroup.add(this.moonMesh);

    // 2. Mars Materials with Real NASA Photographic Texture
    const marsTex = textureLoader.load('assets/mars.jpg');
    const marsBump = textureLoader.load('assets/mars_bump.jpg');

    this.marsMaterial = new THREE.MeshStandardMaterial({
      map: marsTex,
      bumpMap: marsBump,
      bumpScale: 1.1,
      roughness: 0.82,
      metalness: 0.08,
    });

    this.marsMesh = new THREE.Mesh(sphereGeo, this.marsMaterial);
    this.marsMesh.rotation.z = THREE.MathUtils.degToRad(-25.19); // Mars axial tilt ~25.2 deg
    this.marsMesh.visible = false;
    this.planetGroup.add(this.marsMesh);
  }

  initLighting() {
    // Distant Sun directional light
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(400, 120, 300);
    this.scene.add(this.sunLight);

    // Subtle space ambient fill
    this.ambientLight = new THREE.AmbientLight(0x181e28, 0.45);
    this.scene.add(this.ambientLight);

    // Soft rim back-light for dark side silhouette visibility
    this.rimLight = new THREE.DirectionalLight(0x223355, 0.25);
    this.rimLight.position.set(-300, -50, -300);
    this.scene.add(this.rimLight);
  }

  initAtmosphere() {
    // Atmospheric glow halo (specially for Mars)
    const haloGeo = new THREE.SphereGeometry(this.sphereRadius * 1.045, 64, 48);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        uniform float intensity;
        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, 3.2) * intensity;
          gl_FragColor = vec4(glowColor, rim);
        }
      `,
      uniforms: {
        glowColor: { value: new THREE.Color(0xdd6633) },
        intensity: { value: 0.0 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    this.atmosphereMesh = new THREE.Mesh(haloGeo, haloMat);
    this.planetGroup.add(this.atmosphereMesh);
  }

  /**
   * Switch celestial body with smooth cinematic warp
   */
  switchBody(bodyName) {
    if (this.currentBody === bodyName) return;
    this.currentBody = bodyName;

    window.SpaceAudio.playWarpTransition();

    const isMars = bodyName === 'mars';
    this.moonMesh.visible = !isMars;
    this.marsMesh.visible = isMars;

    // Atmospheric glow update
    if (isMars) {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0xdd6633);
      this.atmosphereMesh.material.uniforms.intensity.value = 1.2;
      this.ambientLight.color.setHex(0x2a1a15);
      this.sunLight.intensity = 1.7; // Sun is slightly dimmer at Mars
    } else {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0x88aacc);
      this.atmosphereMesh.material.uniforms.intensity.value = 0.25; // Subtle lunar exosphere rim
      this.ambientLight.color.setHex(0x181e28);
      this.sunLight.intensity = 2.0;
    }

    // Refresh beacon pins
    this.updatePins();

    // Reset camera position smoothly
    this.flyCameraTo(new THREE.Vector3(30, 15, 290), new THREE.Vector3(0, 0, 0), 1000);
  }

  /**
   * Lat/Lng to 3D Sphere Coordinates
   */
  latLngToVector3(lat, lng, radius = this.sphereRadius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Populate 3D Artifact Beacon Pins
   */
  setArtifacts(artifacts) {
    this.artifacts = artifacts;
    this.updatePins();
  }

  updatePins(filteredIds = null) {
    // Clear old pins
    while (this.pinsGroup.children.length > 0) {
      const obj = this.pinsGroup.children[0];
      this.pinsGroup.remove(obj);
    }
    this.pins = [];

    const activeArtifacts = this.artifacts.filter(a => {
      const matchesBody = a.body === this.currentBody;
      const matchesFilter = filteredIds ? filteredIds.includes(a.id) : true;
      return matchesBody && matchesFilter;
    });

    const bodyColor = this.currentBody === 'moon' ? 0x00e5ff : 0xff7043;
    const bodyAccent = this.currentBody === 'moon' ? 0x76ffff : 0xffab91;

    activeArtifacts.forEach(artifact => {
      const pos = this.latLngToVector3(artifact.coords.lat, artifact.coords.lng, this.sphereRadius);
      const normal = pos.clone().normalize();

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pos);
      pinGroup.userData = { artifact };

      // 1. Beacon Stem (thin line reaching upward from ground)
      const stemHeight = 4.5;
      const stemGeo = new THREE.CylinderGeometry(0.2, 0.2, stemHeight, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: bodyAccent, transparent: true, opacity: 0.85 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = stemHeight / 2;
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // 2. Glowing Beacon Orb
      const orbRadius = 1.35;
      const orbGeo = new THREE.SphereGeometry(orbRadius, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.copy(normal.clone().multiplyScalar(stemHeight));

      // 3. Ground Pulse Ring
      const ringGeo = new THREE.RingGeometry(1.2, 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      ringMesh.userData = { isPulseRing: true, baseScale: 1.0, phase: Math.random() * Math.PI * 2 };

      // Hit area for easier clicking
      const hitGeo = new THREE.SphereGeometry(3.5, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(normal.clone().multiplyScalar(stemHeight));
      hitMesh.userData = { isHitMesh: true };

      pinGroup.add(stemMesh);
      pinGroup.add(orbMesh);
      pinGroup.add(ringMesh);
      pinGroup.add(hitMesh);

      this.pinsGroup.add(pinGroup);
      this.pins.push({
        group: pinGroup,
        orbMesh,
        ringMesh,
        artifact,
        worldPos: pos
      });
    });
  }

  /**
   * Fly camera smoothly to inspect a specific artifact site
   */
  focusOnArtifact(artifact, onComplete = null) {
    this.selectedArtifact = artifact;
    this.isAutoRotating = false;

    // Calculate surface position in world space
    const targetPos = this.latLngToVector3(artifact.coords.lat, artifact.coords.lng, this.sphereRadius);
    const normal = targetPos.clone().normalize();

    // Position camera just above the site, angled slightly
    const cameraTarget = normal.clone().multiplyScalar(this.sphereRadius + 45);
    cameraTarget.add(new THREE.Vector3(10, 15, 10));

    this.flyCameraTo(cameraTarget, targetPos, 1400, onComplete);
    window.SpaceAudio.playQuindarTone();

    // Highlight selected pin
    this.pins.forEach(p => {
      const isMatch = p.artifact.id === artifact.id;
      p.orbMesh.scale.setScalar(isMatch ? 1.8 : 1.0);
      p.orbMesh.material.color.setHex(isMatch ? 0xffea00 : (this.currentBody === 'moon' ? 0x00e5ff : 0xff7043));
    });

    // Update mini 3D viewer
    this.updateMiniModel(artifact.modelType);
  }

  /**
   * Camera animation helper using simple easing
   */
  flyCameraTo(targetCamPos, targetLookAt, duration = 1200, onComplete = null) {
    const startCamPos = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    const startTime = performance.now();

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth step easing (smooth in/out)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startCamPos, targetCamPos, ease);
      this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateFlight);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFlight);
  }

  resetView() {
    this.selectedArtifact = null;
    this.isAutoRotating = true;
    this.flyCameraTo(new THREE.Vector3(30, 15, 290), new THREE.Vector3(0, 0, 0), 1000);
    this.pins.forEach(p => {
      p.orbMesh.scale.setScalar(1.0);
      p.orbMesh.material.color.setHex(this.currentBody === 'moon' ? 0x00e5ff : 0xff7043);
    });
  }

  // --- Secondary 3D Holographic Artifact Mini-Viewer ---
  initMiniViewer() {
    const canvas = document.getElementById('mini-model-canvas');
    if (!canvas) return;

    this.miniScene = new THREE.Scene();

    const initialW = canvas.clientWidth || 400;
    const initialH = canvas.clientHeight || 180;

    this.miniCamera = new THREE.PerspectiveCamera(38, initialW / initialH, 0.1, 100);
    this.miniCamera.position.set(0, 2.2, 8.5);
    this.miniCamera.lookAt(0, -0.1, 0);

    this.miniRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.miniRenderer.setSize(initialW, initialH, false);
    this.miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio & Museum Holographic Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    this.miniScene.add(amb);

    // Warm Key Light (brings out gold foil and metallic details)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(5, 8, 6);
    this.miniScene.add(keyLight);

    // Sci-Fi Hologram Cyan Rim Light (silhouette edge glow)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    rimLight.position.set(-6, 5, -6);
    this.miniScene.add(rimLight);

    // Subtle upward fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(0, -6, 3);
    this.miniScene.add(fillLight);

    // Holographic grid projection disk beneath model
    const grid = new THREE.PolarGridHelper(3.8, 16, 8, 32, 0x00f0ff, 0x0284c7);
    grid.position.y = -2.1;
    this.miniScene.add(grid);

    // Interactive 360 OrbitControls with smooth auto-rotation
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.miniControls = new THREE.OrbitControls(this.miniCamera, canvas);
      this.miniControls.enableDamping = true;
      this.miniControls.dampingFactor = 0.06;
      this.miniControls.autoRotate = true;
      this.miniControls.autoRotateSpeed = 1.8;
      this.miniControls.enableZoom = false; // keep drawer scrollable on mobile
      this.miniControls.enablePan = false;  // keep specimen strictly centered
      this.miniControls.target.set(0, -0.1, 0);
    }

    this.miniModelGroup = new THREE.Group();
    this.miniScene.add(this.miniModelGroup);

    // Initial load
    this.updateMiniModel('lander');
    this.resizeMiniViewer();
  }

  resizeMiniViewer() {
    const canvas = document.getElementById('mini-model-canvas');
    if (!canvas || !this.miniRenderer || !this.miniCamera) return;

    const parent = canvas.parentElement;
    const w = (parent ? parent.clientWidth : canvas.clientWidth) || 420;
    const h = (parent ? parent.clientHeight : canvas.clientHeight) || 180;

    if (w > 0 && h > 0) {
      this.miniCamera.aspect = w / h;
      this.miniCamera.updateProjectionMatrix();
      this.miniRenderer.setSize(w, h, false);
      if (this.miniControls) {
        this.miniControls.target.set(0, -0.1, 0);
        this.miniControls.update();
      }
    }
  }

  updateMiniModel(type) {
    if (!this.miniModelGroup) return;

    // Clear old model
    while (this.miniModelGroup.children.length > 0) {
      this.miniModelGroup.remove(this.miniModelGroup.children[0]);
    }

    // High-fidelity materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.15,
      roughness: 0.45
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.55
    });
    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x003344,
      emissiveIntensity: 0.4
    });
    const copperEngineMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.85,
      roughness: 0.3
    });

    const model = new THREE.Group();

    if (type === 'lander') {
      // --- Apollo Lunar Module Descent Stage & Viking Lander ---
      // Octagonal golden descent stage core
      const baseGeo = new THREE.CylinderGeometry(2.1, 2.5, 1.4, 8);
      const base = new THREE.Mesh(baseGeo, goldMat);
      base.position.y = -0.2;
      model.add(base);

      // Top silver equipment bulkhead plate
      const topPlateGeo = new THREE.CylinderGeometry(1.85, 1.85, 0.15, 8);
      const topPlate = new THREE.Mesh(topPlateGeo, silverMat);
      topPlate.position.y = 0.55;
      model.add(topPlate);

      // Central Descent Propulsion Engine (DPS) bell
      const bellGeo = new THREE.ConeGeometry(0.85, 1.3, 18, 1, true);
      const bell = new THREE.Mesh(bellGeo, copperEngineMat);
      bell.position.y = -1.2;
      bell.rotation.x = Math.PI;
      model.add(bell);

      // 4 Outrigger landing gear assemblies with footpads
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = angle;

        // Primary compression strut
        const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.9);
        const strut = new THREE.Mesh(strutGeo, silverMat);
        strut.position.set(2.0, -0.65, 0);
        strut.rotation.z = Math.PI / 4;
        legGroup.add(strut);

        // Circular landing dish footpad
        const padGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 16);
        const pad = new THREE.Mesh(padGeo, goldMat);
        pad.position.set(3.05, -1.75, 0);
        legGroup.add(pad);

        // Lunar surface contact sensor probe needle
        const probeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.9);
        const probe = new THREE.Mesh(probeGeo, cyanAccentMat);
        probe.position.set(3.05, -2.15, 0);
        legGroup.add(probe);

        model.add(legGroup);
      }

      // 4 Modular propellant/helium spherical tanks around the perimeter
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const tankGeo = new THREE.SphereGeometry(0.42, 14, 14);
        const tank = new THREE.Mesh(tankGeo, silverMat);
        tank.position.set(Math.cos(angle) * 1.5, -0.2, Math.sin(angle) * 1.5);
        model.add(tank);
      }

    } else if (type === 'rover') {
      // --- Mars Exploration Rover / Lunar Rover (Curiosity / Opportunity) ---
      // Main chassis equipment box
      const bodyGeo = new THREE.BoxGeometry(2.4, 0.9, 3.2);
      const body = new THREE.Mesh(bodyGeo, whiteMat);
      body.position.y = -0.1;
      model.add(body);

      // Solar panel decking on top
      const solarGeo = new THREE.BoxGeometry(2.6, 0.06, 3.4);
      const solar = new THREE.Mesh(solarGeo, darkMat);
      solar.position.y = 0.4;
      model.add(solar);

      // Camera Mast (Pancam / Navcam)
      const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0);
      const mast = new THREE.Mesh(mastGeo, silverMat);
      mast.position.set(0.7, 1.4, 0.9);
      model.add(mast);

      // Stereo Camera Head
      const headGeo = new THREE.BoxGeometry(0.65, 0.32, 0.4);
      const head = new THREE.Mesh(headGeo, goldMat);
      head.position.set(0.7, 2.35, 0.9);
      model.add(head);

      // High-gain dish antenna
      const dishGeo = new THREE.CylinderGeometry(0.5, 0.1, 0.2, 16);
      const dish = new THREE.Mesh(dishGeo, silverMat);
      dish.position.set(-0.7, 0.75, -0.8);
      dish.rotation.x = -Math.PI / 6;
      model.add(dish);

      // 6 All-terrain aluminum wheels on suspension
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
      const wheelPositions = [
        [-1.6, -0.9, -1.2], [-1.6, -0.9, 0], [-1.6, -0.9, 1.2],
        [1.6, -0.9, -1.2],  [1.6, -0.9, 0],  [1.6, -0.9, 1.2]
      ];
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, darkMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        model.add(wheel);

        // Silver hubcap
        const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.38, 12);
        const hub = new THREE.Mesh(hubGeo, silverMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(...pos);
        model.add(hub);
      });

    } else if (type === 'helicopter') {
      // --- Ingenuity Mars Helicopter ('Ginny') ---
      // Gold Mylar fuselage cube
      const fuseGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      const fuse = new THREE.Mesh(fuseGeo, goldMat);
      fuse.position.y = -0.3;
      model.add(fuse);

      // Main rotor mast
      const mastGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2);
      const mast = new THREE.Mesh(mastGeo, darkMat);
      mast.position.y = 0.9;
      model.add(mast);

      // Solar panel roof on top
      const solarGeo = new THREE.BoxGeometry(1.2, 0.04, 1.2);
      const solar = new THREE.Mesh(solarGeo, darkMat);
      solar.position.y = 2.02;
      model.add(solar);

      // Twin counter-rotating carbon fiber rotor blades
      const bladeGeo = new THREE.BoxGeometry(4.4, 0.03, 0.26);
      const blade1 = new THREE.Mesh(bladeGeo, silverMat);
      blade1.position.y = 1.05;
      const blade2 = new THREE.Mesh(bladeGeo, silverMat);
      blade2.position.y = 1.5;
      blade2.rotation.y = Math.PI / 2;
      model.add(blade1);
      model.add(blade2);

      // 4 Carbon-composite angled landing legs
      for (let i = 0; i < 4; i++) {
        const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.1);
        const leg = new THREE.Mesh(legGeo, silverMat);
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        leg.position.set(Math.cos(angle) * 0.9, -1.25, Math.sin(angle) * 0.9);
        leg.rotation.x = Math.sin(angle) * 0.38;
        leg.rotation.z = -Math.cos(angle) * 0.38;
        model.add(leg);
      }

    } else if (type === 'skycrane') {
      // --- Curiosity Sky Crane Rocket Descent Stage ---
      // Structural octagonal chassis ring
      const frameGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.4, 8);
      const frame = new THREE.Mesh(frameGeo, silverMat);
      frame.position.y = 0.2;
      model.add(frame);

      // Central hydrazine propellant spherical tanks
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const tankGeo = new THREE.SphereGeometry(0.55, 14, 14);
        const tank = new THREE.Mesh(tankGeo, goldMat);
        tank.position.set(Math.cos(angle) * 0.9, 0.3, Math.sin(angle) * 0.9);
        model.add(tank);
      }

      // 4 Canted Mars Landing Engine (MLE) thruster pods
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const podGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
        const pod = new THREE.Mesh(podGeo, darkMat);
        pod.position.set(Math.cos(angle) * 2.2, -0.05, Math.sin(angle) * 2.2);
        model.add(pod);

        // Twin canted copper nozzles per pod
        for (let j = -1; j <= 1; j += 2) {
          const nozzleGeo = new THREE.ConeGeometry(0.22, 0.7, 12, 1, true);
          const nozzle = new THREE.Mesh(nozzleGeo, copperEngineMat);
          nozzle.position.set(
            Math.cos(angle) * 2.2 + (angle === 0 || angle === Math.PI ? 0 : j * 0.2),
            -0.6,
            Math.sin(angle) * 2.2 + (angle === 0 || angle === Math.PI ? j * 0.2 : 0)
          );
          nozzle.rotation.z = Math.cos(angle) * 0.35;
          nozzle.rotation.x = -Math.sin(angle) * 0.35;
          model.add(nozzle);
        }
      }

    } else if (type === 'stage') {
      // --- Saturn V S-IVB Third Stage Rocket (Apollo 13 S-IVB) ---
      // Ribbed white rocket cylinder
      const stageGeo = new THREE.CylinderGeometry(1.7, 1.7, 3.2, 24);
      const stage = new THREE.Mesh(stageGeo, whiteMat);
      stage.position.y = 0.2;
      model.add(stage);

      // Instrument Unit & Black Roll-Pattern Interstage Band
      const bandGeo = new THREE.CylinderGeometry(1.73, 1.73, 0.45, 24);
      const band = new THREE.Mesh(bandGeo, darkMat);
      band.position.y = -0.7;
      model.add(band);

      // Forward dome
      const domeGeo = new THREE.SphereGeometry(1.68, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.35);
      const dome = new THREE.Mesh(domeGeo, silverMat);
      dome.position.y = 1.75;
      model.add(dome);

      // Massive J-2 rocket engine nozzle
      const j2Geo = new THREE.ConeGeometry(1.05, 1.5, 20, 1, true);
      const j2 = new THREE.Mesh(j2Geo, copperEngineMat);
      j2.position.y = -1.9;
      j2.rotation.x = Math.PI;
      model.add(j2);

    } else if (type === 'probe') {
      // --- Lunar / Planetary Probe (Surveyor 1, Luna 9) ---
      // Triangular mast base
      const bodyGeo = new THREE.CylinderGeometry(1.2, 1.5, 1.2, 3);
      const body = new THREE.Mesh(bodyGeo, goldMat);
      body.position.y = -0.3;
      model.add(body);

      // Solar panel mast
      const mastGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0);
      const mast = new THREE.Mesh(mastGeo, silverMat);
      mast.position.set(0, 0.9, 0);
      model.add(mast);

      // Planar solar array
      const panelGeo = new THREE.BoxGeometry(1.5, 0.04, 0.9);
      const panel = new THREE.Mesh(panelGeo, darkMat);
      panel.position.set(0, 1.7, 0);
      panel.rotation.x = Math.PI / 4;
      model.add(panel);

      // High-gain dish antenna
      const dishGeo = new THREE.CylinderGeometry(0.65, 0.1, 0.25, 16);
      const dish = new THREE.Mesh(dishGeo, silverMat);
      dish.position.set(0.6, 1.3, -0.4);
      dish.rotation.z = Math.PI / 3;
      model.add(dish);

      // 3 Tripod landing legs
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2);
        const leg = new THREE.Mesh(legGeo, silverMat);
        leg.position.set(Math.cos(angle) * 1.5, -1.1, Math.sin(angle) * 1.5);
        leg.rotation.x = Math.sin(angle) * 0.45;
        leg.rotation.z = -Math.cos(angle) * 0.45;
        model.add(leg);

        const footGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
        const foot = new THREE.Mesh(footGeo, goldMat);
        foot.position.set(Math.cos(angle) * 2.2, -1.8, Math.sin(angle) * 2.2);
        model.add(foot);
      }

    } else {
      // --- Shield & Backshell (Perseverance / Curiosity) ---
      // Aerodynamic conical backshell
      const backshellGeo = new THREE.ConeGeometry(2.3, 1.6, 24);
      const backshell = new THREE.Mesh(backshellGeo, whiteMat);
      backshell.position.y = 0.3;
      model.add(backshell);

      // Curved ablative heat shield base
      const heatShieldGeo = new THREE.SphereGeometry(2.35, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.32);
      const heatShield = new THREE.Mesh(heatShieldGeo, darkMat);
      heatShield.position.y = -0.5;
      heatShield.rotation.x = Math.PI;
      model.add(heatShield);

      // Supersonic parachute attachment bridle ring
      const bridleGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
      const bridle = new THREE.Mesh(bridleGeo, cyanAccentMat);
      bridle.position.y = 1.15;
      bridle.rotation.x = Math.PI / 2;
      model.add(bridle);
    }

    this.miniModelGroup.add(model);
    this.currentMiniModel = model;

    // Reset controls target & camera orientation
    if (this.miniControls) {
      this.miniControls.target.set(0, -0.1, 0);
      this.miniControls.update();
    }
  }

  // --- Interaction & Events ---
  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Raycast Pin Hover & Click
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('click', (e) => this.onClick(e));
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    this.resizeMiniViewer();
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast on pins
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitMeshes = [];
    this.pins.forEach(p => {
      p.group.traverse(child => {
        if (child.isMesh) hitMeshes.push({ mesh: child, pin: p });
      });
    });

    const intersects = this.raycaster.intersectObjects(hitMeshes.map(h => h.mesh), false);

    if (intersects.length > 0) {
      const match = hitMeshes.find(h => h.mesh === intersects[0].object);
      if (match && this.hoveredArtifact !== match.pin.artifact) {
        this.hoveredArtifact = match.pin.artifact;
        this.container.style.cursor = 'pointer';
        window.SpaceAudio.playTelemetryPing(1400, 0.04);
        if (window.onArtifactHover) {
          window.onArtifactHover(this.hoveredArtifact, e.clientX, e.clientY);
        }
      }
    } else {
      if (this.hoveredArtifact) {
        this.hoveredArtifact = null;
        this.container.style.cursor = 'default';
        if (window.onArtifactLeave) window.onArtifactLeave();
      }
    }
  }

  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitMeshes = [];
    this.pins.forEach(p => {
      p.group.traverse(child => {
        if (child.isMesh) hitMeshes.push({ mesh: child, pin: p });
      });
    });

    const intersects = this.raycaster.intersectObjects(hitMeshes.map(h => h.mesh), false);
    if (intersects.length > 0) {
      const match = hitMeshes.find(h => h.mesh === intersects[0].object);
      if (match) {
        if (window.onArtifactSelect) {
          window.onArtifactSelect(match.pin.artifact);
        }
      }
    }
  }

  // --- Main Animation Loop ---
  animate() {
    requestAnimationFrame(() => this.animate());

    // Auto slow planet rotation if idle
    if (this.isAutoRotating) {
      this.planetGroup.rotation.y += this.autoRotateSpeed;
    }

    // Pulse animation on beacon rings
    const time = performance.now() * 0.003;
    this.pins.forEach(p => {
      p.group.children.forEach(child => {
        if (child.userData && child.userData.isPulseRing) {
          const s = 1.0 + 0.45 * Math.sin(time + child.userData.phase);
          child.scale.set(s, s, s);
          child.material.opacity = 0.8 - (s - 1.0) * 0.9;
        }
      });
    });

    // Animate holographic mini-viewer model & controls
    if (this.miniControls) {
      this.miniControls.update();
    } else if (this.currentMiniModel) {
      this.currentMiniModel.rotation.y += 0.012;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.miniRenderer && this.miniScene && this.miniCamera) {
      this.miniRenderer.render(this.miniScene, this.miniCamera);
    }
  }
}

window.SpaceSceneManager = SpaceSceneManager;
