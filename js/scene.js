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
    this.miniCamera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.miniCamera.position.set(0, 5, 12);

    this.miniRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.miniRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0x446688, 1.2);
    this.miniScene.add(amb);

    const dir = new THREE.DirectionalLight(0x00ffff, 2.5);
    dir.position.set(5, 10, 7);
    this.miniScene.add(dir);

    const dir2 = new THREE.DirectionalLight(0xffaa44, 1.5);
    dir2.position.set(-5, -5, -5);
    this.miniScene.add(dir2);

    this.miniModelGroup = new THREE.Group();
    this.miniScene.add(this.miniModelGroup);

    // Initial placeholder
    this.updateMiniModel('lander');
  }

  updateMiniModel(type) {
    if (!this.miniModelGroup) return;

    // Clear old model
    while (this.miniModelGroup.children.length > 0) {
      this.miniModelGroup.remove(this.miniModelGroup.children[0]);
    }

    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: false
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      metalness: 0.9,
      roughness: 0.2
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7
    });

    const model = new THREE.Group();

    if (type === 'lander') {
      // Apollo / Viking style lander descent stage
      // Octagonal golden descent base
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.5, 8);
      const base = new THREE.Mesh(baseGeo, goldMat);
      model.add(base);

      // Rocket engine bell
      const bellGeo = new THREE.ConeGeometry(0.9, 1.4, 16, 1, true);
      const bell = new THREE.Mesh(bellGeo, darkMat);
      bell.position.y = -1.2;
      bell.rotation.x = Math.PI;
      model.add(bell);

      // 4 Outrigger landing legs & footpads
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = angle;

        // Strut
        const strutGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2);
        const strut = new THREE.Mesh(strutGeo, wireMat);
        strut.position.set(2.2, -0.6, 0);
        strut.rotation.z = Math.PI / 4;
        legGroup.add(strut);

        // Circular footpad
        const padGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12);
        const pad = new THREE.Mesh(padGeo, goldMat);
        pad.position.set(3.3, -1.8, 0);
        legGroup.add(pad);

        model.add(legGroup);
      }
    } else if (type === 'rover') {
      // 6-wheeled Rover (Curiosity / Opportunity style)
      // Body chassis
      const bodyGeo = new THREE.BoxGeometry(2.5, 1.0, 3.2);
      const body = new THREE.Mesh(bodyGeo, wireMat);
      model.add(body);

      // Camera mast
      const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.4);
      const mast = new THREE.Mesh(mastGeo, darkMat);
      mast.position.set(0.8, 1.4, 1.0);
      model.add(mast);

      // Camera head (Pancam)
      const headGeo = new THREE.BoxGeometry(0.7, 0.35, 0.4);
      const head = new THREE.Mesh(headGeo, goldMat);
      head.position.set(0.8, 2.5, 1.0);
      model.add(head);

      // 6 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16);
      const wheelPositions = [
        [-1.6, -0.8, -1.2], [-1.6, -0.8, 0], [-1.6, -0.8, 1.2],
        [1.6, -0.8, -1.2], [1.6, -0.8, 0], [1.6, -0.8, 1.2]
      ];
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, darkMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        model.add(wheel);
      });
    } else if (type === 'helicopter') {
      // Ingenuity Mars Helicopter
      // Fuselage cube
      const fuseGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const fuse = new THREE.Mesh(fuseGeo, goldMat);
      model.add(fuse);

      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0);
      const mast = new THREE.Mesh(mastGeo, darkMat);
      mast.position.y = 1.2;
      model.add(mast);

      // Solar panel plate on top
      const solarGeo = new THREE.BoxGeometry(1.4, 0.05, 1.4);
      const solar = new THREE.Mesh(solarGeo, darkMat);
      solar.position.y = 2.2;
      model.add(solar);

      // Twin counter-rotating rotors
      const bladeGeo = new THREE.BoxGeometry(4.8, 0.04, 0.3);
      const blade1 = new THREE.Mesh(bladeGeo, wireMat);
      blade1.position.y = 1.3;
      const blade2 = new THREE.Mesh(bladeGeo, wireMat);
      blade2.position.y = 1.7;
      blade2.rotation.y = Math.PI / 2;
      model.add(blade1);
      model.add(blade2);

      // 4 Spindly landing legs
      for (let i = 0; i < 4; i++) {
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
        const leg = new THREE.Mesh(legGeo, darkMat);
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        leg.position.set(Math.cos(angle) * 1.0, -1.2, Math.sin(angle) * 1.0);
        leg.rotation.x = Math.sin(angle) * 0.4;
        leg.rotation.z = -Math.cos(angle) * 0.4;
        model.add(leg);
      }
    } else if (type === 'skycrane') {
      // Sky Crane with canted thrusters
      const plateGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 8);
      const plate = new THREE.Mesh(plateGeo, wireMat);
      model.add(plate);

      // 4 Rocket clusters
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const nozzleGeo = new THREE.ConeGeometry(0.3, 0.8, 8, 1, true);
        const nozzle = new THREE.Mesh(nozzleGeo, goldMat);
        nozzle.position.set(Math.cos(angle) * 2.2, -0.6, Math.sin(angle) * 2.2);
        nozzle.rotation.z = Math.cos(angle) * 0.35;
        model.add(nozzle);
      }
    } else {
      // Shield or Stage (Saturn V cylindrical ribbed stage or heat shield)
      const cylGeo = new THREE.CylinderGeometry(1.8, 2.2, 3.5, 24);
      const cyl = new THREE.Mesh(cylGeo, wireMat);
      model.add(cyl);

      const nozzleGeo = new THREE.ConeGeometry(1.1, 1.6, 16, 1, true);
      const nozzle = new THREE.Mesh(nozzleGeo, darkMat);
      nozzle.position.y = -2.2;
      nozzle.rotation.x = Math.PI;
      model.add(nozzle);
    }

    this.miniModelGroup.add(model);
    this.currentMiniModel = model;
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

    const miniCanvas = document.getElementById('mini-model-canvas');
    if (miniCanvas && this.miniRenderer) {
      this.miniCamera.aspect = miniCanvas.clientWidth / miniCanvas.clientHeight;
      this.miniCamera.updateProjectionMatrix();
      this.miniRenderer.setSize(miniCanvas.clientWidth, miniCanvas.clientHeight);
    }
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

    // Animate holographic mini-viewer model
    if (this.currentMiniModel) {
      this.currentMiniModel.rotation.y += 0.012;
      this.currentMiniModel.rotation.x = Math.sin(time * 0.5) * 0.15;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.miniRenderer && this.miniScene && this.miniCamera) {
      this.miniRenderer.render(this.miniScene, this.miniCamera);
    }
  }
}

window.SpaceSceneManager = SpaceSceneManager;
