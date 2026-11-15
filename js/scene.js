/**
 * Three.js 3D Celestial Engine, Beacons, Starfield, and Museum-Grade Holographic Artifact Reconstructor
 * Supports: Moon, Mars, Venus, and Titan & Outer Solar System
 */

class SpaceSceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentBody = 'moon'; // 'moon', 'mars', 'venus', 'outer'
    this.artifacts = [];
    this.pins = [];
    this.selectedArtifact = null;
    this.hoveredArtifact = null;
    this.isMiniWireframe = false;

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
    const sphereGeo = new THREE.SphereGeometry(this.sphereRadius, 112, 80);
    const textureLoader = new THREE.TextureLoader();
    const maxAniso = this.renderer && this.renderer.capabilities ? this.renderer.capabilities.getMaxAnisotropy() : 8;

    // 1. Moon Materials with Real NASA Photographic Texture + High-Detail Procedural Fallback
    const procMoonTex = window.CelestialTextures ? window.CelestialTextures.generateMoonTexture() : null;
    const procMoonBump = window.CelestialTextures ? window.CelestialTextures.generateMoonBump() : null;
    if (procMoonTex) procMoonTex.anisotropy = maxAniso;

    this.moonMaterial = new THREE.MeshStandardMaterial({
      map: procMoonTex,
      bumpMap: procMoonBump,
      bumpScale: 1.05,
      roughness: 0.88,
      metalness: 0.05,
    });

    textureLoader.load('assets/moon.jpg', (tex) => {
      tex.anisotropy = maxAniso;
      this.moonMaterial.map = tex;
      this.moonMaterial.needsUpdate = true;
    });
    textureLoader.load('assets/moon_bump.jpg', (bump) => {
      bump.anisotropy = maxAniso;
      this.moonMaterial.bumpMap = bump;
      this.moonMaterial.needsUpdate = true;
    });

    this.moonMesh = new THREE.Mesh(sphereGeo, this.moonMaterial);
    this.moonMesh.rotation.x = THREE.MathUtils.degToRad(1.5);
    this.planetGroup.add(this.moonMesh);

    // 2. Mars Materials with Real NASA Photographic Texture + High-Detail Procedural Fallback
    const procMarsTex = window.CelestialTextures ? window.CelestialTextures.generateMarsTexture() : null;
    const procMarsBump = window.CelestialTextures ? window.CelestialTextures.generateMarsBump() : null;
    if (procMarsTex) procMarsTex.anisotropy = maxAniso;

    this.marsMaterial = new THREE.MeshStandardMaterial({
      map: procMarsTex,
      bumpMap: procMarsBump,
      bumpScale: 1.25,
      roughness: 0.82,
      metalness: 0.08,
    });

    textureLoader.load('assets/mars.jpg', (tex) => {
      tex.anisotropy = maxAniso;
      this.marsMaterial.map = tex;
      this.marsMaterial.needsUpdate = true;
    });
    textureLoader.load('assets/mars_bump.jpg', (bump) => {
      bump.anisotropy = maxAniso;
      this.marsMaterial.bumpMap = bump;
      this.marsMaterial.needsUpdate = true;
    });

    this.marsMesh = new THREE.Mesh(sphereGeo, this.marsMaterial);
    this.marsMesh.rotation.z = THREE.MathUtils.degToRad(-25.19);
    this.marsMesh.visible = false;
    this.planetGroup.add(this.marsMesh);

    // 3. Venus Materials (Magellan SAR Radar + Sulfuric Cloud Bands)
    const venusTex = window.CelestialTextures ? window.CelestialTextures.generateVenusTexture() : procMoonTex;
    const venusBump = window.CelestialTextures ? window.CelestialTextures.generateVenusBump() : procMoonBump;
    if (venusTex) venusTex.anisotropy = maxAniso;
    if (venusBump) venusBump.anisotropy = maxAniso;

    this.venusMaterial = new THREE.MeshStandardMaterial({
      map: venusTex,
      bumpMap: venusBump,
      bumpScale: 1.15,
      roughness: 0.72,
      metalness: 0.12,
    });

    this.venusMesh = new THREE.Mesh(sphereGeo, this.venusMaterial);
    this.venusMesh.rotation.z = THREE.MathUtils.degToRad(177.3); // Retrograde axial tilt
    this.venusMesh.visible = false;
    this.planetGroup.add(this.venusMesh);

    // 4. Titan & Outer System Materials (Cassini Radar + Hydrocarbon Seas + Subtle Distant Ring-Halo)
    const titanTex = window.CelestialTextures ? window.CelestialTextures.generateTitanTexture() : procMarsTex;
    const titanBump = window.CelestialTextures ? window.CelestialTextures.generateTitanBump() : venusBump;
    if (titanTex) titanTex.anisotropy = maxAniso;
    if (titanBump) titanBump.anisotropy = maxAniso;

    this.outerMaterial = new THREE.MeshStandardMaterial({
      map: titanTex,
      bumpMap: titanBump,
      bumpScale: 0.95,
      roughness: 0.76,
      metalness: 0.1,
    });

    this.outerMesh = new THREE.Mesh(sphereGeo, this.outerMaterial);
    this.outerMesh.rotation.z = THREE.MathUtils.degToRad(-26.7); // Saturn/Titan system tilt
    this.outerMesh.visible = false;

    // Subtle Outer System Planetary Ring Accent (Saturn/Outer System aesthetic)
    const ringGeo = new THREE.RingGeometry(132, 185, 96);
    const ringPos = ringGeo.attributes.position;
    const ringUvs = ringGeo.attributes.uv;
    for (let i = 0; i < ringPos.count; i++) {
      const vx = ringPos.getX(i);
      const vy = ringPos.getY(i);
      const r = Math.sqrt(vx * vx + vy * vy);
      ringUvs.setXY(i, (r - 132) / (185 - 132), 0.5);
    }
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    this.outerRingMesh = new THREE.Mesh(ringGeo, ringMat);
    this.outerRingMesh.rotation.x = Math.PI * 0.42;
    this.outerRingMesh.rotation.y = 0.22;
    this.outerMesh.add(this.outerRingMesh);

    this.planetGroup.add(this.outerMesh);
  }

  initLighting() {
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(400, 120, 300);
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0x181e28, 0.45);
    this.scene.add(this.ambientLight);

    this.rimLight = new THREE.DirectionalLight(0x223355, 0.25);
    this.rimLight.position.set(-300, -50, -300);
    this.scene.add(this.rimLight);
  }

  initAtmosphere() {
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
        glowColor: { value: new THREE.Color(0x88aacc) },
        intensity: { value: 0.25 }
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

    if (window.SpaceAudio) window.SpaceAudio.playWarpTransition();

    this.moonMesh.visible = (bodyName === 'moon');
    this.marsMesh.visible = (bodyName === 'mars');
    this.venusMesh.visible = (bodyName === 'venus');
    this.outerMesh.visible = (bodyName === 'outer');

    if (bodyName === 'mars') {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0xdd6633);
      this.atmosphereMesh.material.uniforms.intensity.value = 1.2;
      this.ambientLight.color.setHex(0x2a1a15);
      this.sunLight.intensity = 1.7;
    } else if (bodyName === 'venus') {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0xf59e0b);
      this.atmosphereMesh.material.uniforms.intensity.value = 1.65;
      this.ambientLight.color.setHex(0x2d1e0b);
      this.sunLight.intensity = 2.2;
    } else if (bodyName === 'outer') {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0x38bdf8);
      this.atmosphereMesh.material.uniforms.intensity.value = 1.45;
      this.ambientLight.color.setHex(0x1e2430);
      this.sunLight.intensity = 1.45;
    } else {
      this.atmosphereMesh.material.uniforms.glowColor.value.setHex(0x88aacc);
      this.atmosphereMesh.material.uniforms.intensity.value = 0.25;
      this.ambientLight.color.setHex(0x181e28);
      this.sunLight.intensity = 2.0;
    }

    this.updatePins();
    this.flyCameraTo(new THREE.Vector3(30, 15, 290), new THREE.Vector3(0, 0, 0), 1000);
  }

  getBodyBeaconColors() {
    if (this.currentBody === 'mars') return { main: 0xff7043, accent: 0xffab91 };
    if (this.currentBody === 'venus') return { main: 0xfbbf24, accent: 0xfde68a };
    if (this.currentBody === 'outer') return { main: 0x38bdf8, accent: 0xbae6fd };
    return { main: 0x00e5ff, accent: 0x76ffff };
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

    const colors = this.getBodyBeaconColors();
    const bodyColor = colors.main;
    const bodyAccent = colors.accent;

    activeArtifacts.forEach(artifact => {
      const isCrashed = artifact.landingStatus === 'crashed' || artifact.vrAllowed === false;
      const pinColor = isCrashed ? 0xef4444 : bodyColor;
      const pinAccent = isCrashed ? 0xf87171 : bodyAccent;
      const ringColor = isCrashed ? 0xf97316 : bodyColor;

      const pos = this.latLngToVector3(artifact.coords.lat, artifact.coords.lng, this.sphereRadius);
      const normal = pos.clone().normalize();

      const pinGroup = new THREE.Group();
      pinGroup.position.copy(pos);
      pinGroup.userData = { artifact, isCrashed };

      const stemHeight = 4.5;
      const stemGeo = new THREE.CylinderGeometry(0.2, 0.2, stemHeight, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: pinAccent, transparent: true, opacity: isCrashed ? 0.95 : 0.85 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = stemHeight / 2;
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const orbRadius = isCrashed ? 1.48 : 1.35;
      const orbGeo = new THREE.SphereGeometry(orbRadius, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.copy(normal.clone().multiplyScalar(stemHeight));

      const ringGeo = new THREE.RingGeometry(1.2, isCrashed ? 2.5 : 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isCrashed ? 0.9 : 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      ringMesh.userData = { isPulseRing: true, isCrashed, baseScale: 1.0, phase: Math.random() * Math.PI * 2 };

      const hitGeo = new THREE.SphereGeometry(3.8, 8, 8);
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
        worldPos: pos,
        isCrashed
      });
    });
  }

  /**
   * Fly camera smoothly to inspect a specific artifact site, centering precisely on the marker pin
   */
  focusOnArtifact(artifact, onComplete = null) {
    if (!artifact) return;
    this.selectedArtifact = artifact;
    this.isAutoRotating = false;

    // 1. Force update matrix world hierarchy to get live global positions
    this.planetGroup.updateMatrixWorld(true);

    // 2. Find matching pin mesh to obtain its exact current world coordinates
    let pinWorldPos = new THREE.Vector3();
    const targetPin = this.pins.find(p => p.artifact && p.artifact.id === artifact.id);

    if (targetPin && targetPin.orbMesh) {
      targetPin.orbMesh.getWorldPosition(pinWorldPos);
    } else {
      // Fallback: calculate theoretical world position accounting for current planet rotation
      const localPos = this.latLngToVector3(artifact.coords.lat, artifact.coords.lng, this.sphereRadius);
      pinWorldPos.copy(localPos).applyEuler(this.planetGroup.rotation);
    }

    if (pinWorldPos.lengthSq() < 0.001) {
      pinWorldPos.set(0, 0, this.sphereRadius);
    }

    // 3. Compute true radial surface normal from planet center (0, 0, 0)
    const normal = pinWorldPos.clone().normalize();

    // 4. Position camera directly along the radial normal vector (pure radial alignment, zero skew)
    // sphereRadius = 100. Target distance of 148 provides high surface detail and pin prominence
    const cameraDistance = this.sphereRadius + 48;
    const cameraTarget = normal.clone().multiplyScalar(cameraDistance);

    // 5. Look directly at the planet center (0, 0, 0) through the pin.
    // Because pinWorldPos lies directly on the ray between cameraTarget and (0,0,0),
    // the pin is projected at the absolute center (0, 0) of the camera viewport.
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    // 6. Smooth orbital flight that preserves spherical altitude around the planet
    this.flyCameraTo(cameraTarget, targetLookAt, 1200, onComplete);
    if (window.SpaceAudio) window.SpaceAudio.playQuindarTone();

    const defaultColor = this.getBodyBeaconColors().main;
    this.pins.forEach(p => {
      const isMatch = p.artifact && p.artifact.id === artifact.id;
      p.orbMesh.scale.setScalar(isMatch ? 1.85 : 1.0);
      p.orbMesh.material.color.setHex(isMatch ? 0xffea00 : defaultColor);
    });

    this.updateMiniModel(artifact.modelType, artifact);
  }

  flyCameraTo(targetCamPos, targetLookAt, duration = 1200, onComplete = null) {
    if (!this.flightCounter) this.flightCounter = 0;
    const flightId = ++this.flightCounter;
    this.activeFlightId = flightId;

    const startCamPos = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    const startTime = performance.now();

    const startDist = Math.max(120, startCamPos.length());
    const targetDist = Math.max(120, targetCamPos.length());
    const startDir = startCamPos.clone().normalize();
    const targetDir = targetCamPos.clone().normalize();
    const angle = startDir.angleTo(targetDir);

    let qTarget = new THREE.Quaternion();
    if (angle > 0.001) {
      qTarget.setFromUnitVectors(startDir, targetDir);
    }

    const animateFlight = (now) => {
      if (this.activeFlightId !== flightId) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth cubic ease in-out
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      if (angle > 0.001) {
        // Spherical great-circle transfer along the sphere
        const qInterp = new THREE.Quaternion().identity().slerp(qTarget, ease);
        const currentDir = startDir.clone().applyQuaternion(qInterp).normalize();

        // Subtle orbital arc that lifts camera smoothly during long transfers
        // to prevent cutting into terrain or clipping through the planet
        const arc = Math.sin(progress * Math.PI) * Math.min(35, angle * 18);
        const currentDist = THREE.MathUtils.lerp(startDist, targetDist, ease) + arc;

        this.camera.position.copy(currentDir).multiplyScalar(currentDist);
      } else {
        this.camera.position.lerpVectors(startCamPos, targetCamPos, ease);
      }

      this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateFlight);
      } else {
        this.camera.position.copy(targetCamPos);
        this.controls.target.copy(targetLookAt);
        this.controls.update();
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFlight);
  }

  resetView() {
    this.selectedArtifact = null;
    this.isAutoRotating = true;
    this.flyCameraTo(new THREE.Vector3(30, 15, 290), new THREE.Vector3(0, 0, 0), 1000);
    const defaultColor = this.getBodyBeaconColors().main;
    this.pins.forEach(p => {
      p.orbMesh.scale.setScalar(1.0);
      p.orbMesh.material.color.setHex(defaultColor);
    });
  }

  // =========================================================================
  // MUSEUM-GRADE 3D HOLOGRAPHIC SPECIMEN RECONSTRUCTION VIEWER
  // =========================================================================
  initMiniViewer() {
    const canvas = document.getElementById('mini-model-canvas');
    if (!canvas) return;

    this.miniScene = new THREE.Scene();

    const initialW = canvas.clientWidth || 400;
    const initialH = canvas.clientHeight || 195;

    this.miniCamera = new THREE.PerspectiveCamera(35, initialW / initialH, 0.1, 100);
    this.miniCamera.position.set(0, 2.1, 7.8);
    this.miniCamera.lookAt(0, -0.1, 0);

    this.miniRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.miniRenderer.setSize(initialW, initialH, false);
    this.miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.miniRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.miniRenderer.toneMappingExposure = 1.35;
    this.miniRenderer.outputEncoding = THREE.sRGBEncoding;

    // Apply High-End Studio PBR Environment Map for Authentic Metallic Reflections
    if (window.CelestialTextures && window.CelestialTextures.generateStudioEnvMap) {
      this.miniScene.environment = window.CelestialTextures.generateStudioEnvMap();
    }

    // Museum-Grade 4-Point Balanced Studio Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.15);
    this.miniScene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xfffaee, 2.8);
    keyLight.position.set(5, 8, 6);
    this.miniScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 1.3);
    fillLight.position.set(-6, 4, 4);
    this.miniScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(-4, 6, -6);
    this.miniScene.add(rimLight);

    const underLight = new THREE.DirectionalLight(0x94a3b8, 0.65);
    underLight.position.set(0, -5, 2);
    this.miniScene.add(underLight);

    // Sleek Holographic CAD Pedestal (subtle glowing concentric rings)
    const grid = new THREE.PolarGridHelper(3.8, 16, 8, 64, 0x00f0ff, 0x1e3a5f);
    grid.position.y = -1.95;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    this.miniScene.add(grid);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.miniControls = new THREE.OrbitControls(this.miniCamera, canvas);
      this.miniControls.enableDamping = true;
      this.miniControls.dampingFactor = 0.06;
      this.miniControls.autoRotate = true;
      this.miniControls.autoRotateSpeed = 1.4;
      this.miniControls.enableZoom = true;
      this.miniControls.minDistance = 3.5;
      this.miniControls.maxDistance = 12.0;
      this.miniControls.enablePan = false;
      this.miniControls.target.set(0, -0.1, 0);
    }

    this.miniModelGroup = new THREE.Group();
    this.miniScene.add(this.miniModelGroup);

    this.updateMiniModel('lander');
    this.resizeMiniViewer();
  }

  resizeMiniViewer() {
    const canvas = document.getElementById('mini-model-canvas');
    if (!canvas || !this.miniRenderer || !this.miniCamera) return;

    const parent = canvas.parentElement;
    const w = (parent ? parent.clientWidth : canvas.clientWidth) || 420;
    const h = (parent ? parent.clientHeight : canvas.clientHeight) || 195;

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

  toggleMiniWireframe() {
    this.isMiniWireframe = !this.isMiniWireframe;
    if (this.currentMiniModel) {
      this.currentMiniModel.traverse(child => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => { m.wireframe = this.isMiniWireframe; });
        }
      });
    }
    return this.isMiniWireframe;
  }

  updateMiniModel(type, artifact = null) {
    if (!this.miniModelGroup) return;

    while (this.miniModelGroup.children.length > 0) {
      this.miniModelGroup.remove(this.miniModelGroup.children[0]);
    }

    const kaptonMap = window.CelestialTextures ? window.CelestialTextures.generateKaptonFoilMap() : null;
    const kaptonBump = window.CelestialTextures ? window.CelestialTextures.generateKaptonFoilBump() : null;
    const solarTex = window.CelestialTextures ? window.CelestialTextures.generateSolarPanelTexture() : null;
    const inconelTex = window.CelestialTextures ? window.CelestialTextures.generateInconelShieldTexture() : null;

    const goldMat = new THREE.MeshStandardMaterial({
      map: kaptonMap,
      color: 0xffffff,
      metalness: 0.88,
      roughness: 0.22,
      bumpMap: kaptonBump,
      bumpScale: 0.05,
      wireframe: this.isMiniWireframe
    });
    const amberFoilMat = new THREE.MeshStandardMaterial({
      map: kaptonMap,
      color: 0xdf8a10,
      metalness: 0.82,
      roughness: 0.28,
      bumpMap: kaptonBump,
      bumpScale: 0.06,
      wireframe: this.isMiniWireframe
    });
    const inconelMat = new THREE.MeshStandardMaterial({
      map: inconelTex,
      color: 0x1e293b,
      metalness: 0.72,
      roughness: 0.38,
      wireframe: this.isMiniWireframe
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.94,
      roughness: 0.16,
      wireframe: this.isMiniWireframe
    });
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.28,
      wireframe: this.isMiniWireframe
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.15,
      roughness: 0.35,
      wireframe: this.isMiniWireframe
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.55,
      roughness: 0.55,
      wireframe: this.isMiniWireframe
    });
    const copperEngineMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      metalness: 0.92,
      roughness: 0.22,
      wireframe: this.isMiniWireframe
    });
    const solarMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      color: 0x3b82f6,
      metalness: 0.75,
      roughness: 0.18,
      wireframe: this.isMiniWireframe
    });
    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x003344,
      emissiveIntensity: 0.4,
      wireframe: this.isMiniWireframe
    });

    const model = new THREE.Group();

    if (type === 'lander') {
      // =====================================================================
      // HIGH-PRECISION APOLLO LUNAR MODULE DESCENT STAGE (GRUMMAN ARCHITECTURE)
      // =====================================================================
      // 1. Octagonal Core Structure with Faceted Thermal Insulation
      const octRadius = 2.1;
      const octHeight = 1.35;
      const baseGeo = new THREE.CylinderGeometry(octRadius, octRadius * 1.08, octHeight, 8);
      const base = new THREE.Mesh(baseGeo, goldMat);
      base.position.y = -0.32;
      model.add(base);

      // Quadrant 2 (Right): Inconel dark nickel-alloy thermal heat shield
      const q2Shield = new THREE.Mesh(new THREE.CylinderGeometry(octRadius * 1.02, octRadius * 1.1, octHeight * 0.96, 8, 1, false, Math.PI * 0.25, Math.PI * 0.5), inconelMat);
      q2Shield.position.y = -0.32;
      model.add(q2Shield);

      // Quadrant 3 (Aft): Aluminized Silver Mylar heat blanket
      const q3Shield = new THREE.Mesh(new THREE.CylinderGeometry(octRadius * 1.015, octRadius * 1.09, octHeight * 0.94, 8, 1, false, Math.PI * 0.75, Math.PI * 0.5), silverMat);
      q3Shield.position.y = -0.32;
      model.add(q3Shield);

      // Top Ascent Stage Launch Deck
      const deckGeo = new THREE.CylinderGeometry(1.95, 2.05, 0.1, 8);
      const deck = new THREE.Mesh(deckGeo, silverMat);
      deck.position.y = 0.38;
      model.add(deck);

      // Central Ascent Engine Blast Deflector Bowl & Stainless Steel Pyrotechnic Ring
      const deflectorBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.5, 0.22, 24, 1, true), darkMat);
      deflectorBowl.position.y = 0.35;
      model.add(deflectorBowl);

      const blastRing = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.04, 12, 32), silverMat);
      blastRing.rotation.x = Math.PI / 2;
      blastRing.position.y = 0.44;
      model.add(blastRing);

      // 4 Ascent Stage Structural Pyrotechnic Staging Hardpoints
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const mount = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.25), titaniumMat);
        mount.position.set(Math.cos(a) * 1.75, 0.46, Math.sin(a) * 1.75);
        model.add(mount);
      }

      // Propellant Tanks inside Quadrant Bays with Titanium Retaining Straps
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const tank = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 16), (i === 1) ? titaniumMat : goldMat);
        tank.position.set(Math.cos(a) * 1.25, 0.42, Math.sin(a) * 1.25);
        model.add(tank);

        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.025, 8, 24), titaniumMat);
        strap.rotation.x = Math.PI / 2;
        strap.position.set(Math.cos(a) * 1.25, 0.42, Math.sin(a) * 1.25);
        model.add(strap);
      }

      // Helium Pressurization Spheres
      [-0.45, 0.45].forEach(ox => {
        const heSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), silverMat);
        heSphere.position.set(ox, 0.52, -0.4);
        model.add(heSphere);
      });

      // MESA Equipment Stowage Bay (Quadrant 4, Neil Armstrong TV Deploy Pallet)
      const mesaBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 0.42), amberFoilMat);
      mesaBox.position.set(-1.15, -0.32, 1.45);
      mesaBox.rotation.y = -Math.PI / 4;
      model.add(mesaBox);

      // ALSEP Scientific Bay & SNAP-27 RTG Plutonium Fuel Cask (Quadrant 1)
      const rtgCask = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.65, 16), darkMat);
      rtgCask.position.set(1.45, -0.3, -1.05);
      model.add(rtgCask);
      for (let f = 0; f < 6; f++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.6, 0.42), titaniumMat);
        fin.position.set(1.45, -0.3, -1.05);
        fin.rotation.y = (f * Math.PI) / 6;
        model.add(fin);
      }

      // Forward EVA Porch Platform (+Z) with Safety Kickplate & Handrail
      const porch = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.78), silverMat);
      porch.position.set(0, 0.42, 2.12);
      model.add(porch);

      const porchRail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.72), silverMat);
      porchRail.rotation.z = Math.PI / 2;
      porchRail.position.set(0, 0.68, 2.48);
      model.add(porchRail);

      // Aerojet / TRW DPS Throttleable Rocket Engine Bell
      const bellGeo = new THREE.CylinderGeometry(0.32, 0.95, 1.4, 28, 4, true);
      const bell = new THREE.Mesh(bellGeo, copperEngineMat);
      bell.position.y = -1.35;
      model.add(bell);

      const bellCollar = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 10, 24), silverMat);
      bellCollar.rotation.x = Math.PI / 2;
      bellCollar.position.y = -0.7;
      model.add(bellCollar);

      // 4 Cantilevered Outrigger Landing Gear Assemblies
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = angle;

        // Primary telescopic strut wrapped in gold Kapton foil
        const primaryStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 2.85, 12), goldMat);
        primaryStrut.position.set(2.05, -0.78, 0);
        primaryStrut.rotation.z = Math.PI / 4.1;
        legGroup.add(primaryStrut);

        // Dual A-Frame titanium secondary folding struts
        for (let s = -1; s <= 1; s += 2) {
          const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.7, 8), titaniumMat);
          brace.position.set(1.78, -0.72, s * 0.42);
          brace.rotation.z = Math.PI / 2.75;
          brace.rotation.y = s * 0.24;
          legGroup.add(brace);
        }

        // 37-inch scale Concave Dish Footpad
        const padUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.5, 0.06, 24), goldMat);
        padUpper.position.set(3.02, -1.75, 0);
        legGroup.add(padUpper);

        const padLip = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 8, 28), silverMat);
        padLip.rotation.x = Math.PI / 2;
        padLip.position.set(3.02, -1.75, 0);
        legGroup.add(padLip);

        // 5.6-foot flexible tempered steel lunar surface contact sensing probe wire
        const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85), cyanAccentMat);
        probe.position.set(3.02, -2.15, 0);
        legGroup.add(probe);

        // Forward Leg EVA Ladder with 9 Non-Skid Rungs (Apollo 11 Armstrong ladder)
        if (i === 3) {
          for (let r = 0; r < 9; r++) {
            const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.38), silverMat);
            rung.rotation.x = Math.PI / 2;
            rung.position.set(1.28 + r * 0.19, 0.24 - r * 0.22, 0);
            legGroup.add(rung);
          }
          // Historic Apollo 11 Lunar Plaque mounted on strut between rungs
          const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.02), silverMat);
          plaque.position.set(1.85, -0.42, 0.08);
          plaque.rotation.y = Math.PI / 2;
          legGroup.add(plaque);
        }

        model.add(legGroup);
      }

      // S-Band Steerable High-Gain Parabolic Dish Antenna
      const dish = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.38), silverMat);
      dish.position.set(-0.75, 1.45, -0.65);
      dish.rotation.x = 0.45;
      model.add(dish);

      const dishHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 0.45, 12), cyanAccentMat);
      dishHorn.position.set(-0.75, 1.55, -0.65);
      dishHorn.rotation.x = 0.45;
      model.add(dishHorn);

      const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1), silverMat);
      dishMast.position.set(-0.75, 0.9, -0.65);
      model.add(dishMast);

    } else if (type === 'rover') {
      const isMoonRover = (artifact && artifact.body === 'moon') || (!artifact);

      if (isMoonRover) {
        // =====================================================================
        // AUTHENTIC APOLLO LUNAR ROVING VEHICLE (LRV MOON BUGGY - APOLLO 15-17)
        // =====================================================================
        // Lightweight Aluminum Chassis
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 3.1), titaniumMat);
        frame.position.y = -0.28;
        model.add(frame);

        // Forward Equipment Deck & Battery Thermal Covers
        const fwdDeck = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.32, 0.95), silverMat);
        fwdDeck.position.set(0, -0.1, 1.05);
        model.add(fwdDeck);

        // Dual Folding Lawn-Chair Mesh Seats with Tubular Aluminum Frames
        for (let s = -1; s <= 1; s += 2) {
          const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.65), darkMat);
          seatBottom.position.set(s * 0.48, -0.16, -0.15);
          model.add(seatBottom);

          const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.08), darkMat);
          seatBack.position.set(s * 0.48, 0.22, -0.48);
          seatBack.rotation.x = 0.18;
          model.add(seatBack);

          const headRest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.06), silverMat);
          headRest.position.set(s * 0.48, 0.64, -0.56);
          model.add(headRest);
        }

        // Central T-Handle Steering & Drive Controller
        const tStick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52), silverMat);
        tStick.position.set(0, 0.12, 0.05);
        model.add(tStick);
        const tBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28), darkMat);
        tBar.rotation.z = Math.PI / 2;
        tBar.position.set(0, 0.36, 0.05);
        model.add(tBar);

        // High-Gain Parabolic Umbrella Mesh Dish Antenna (Front-Right)
        const lrvDish = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.35), goldMat);
        lrvDish.position.set(0.65, 1.25, 1.05);
        lrvDish.rotation.x = 0.35;
        model.add(lrvDish);
        const lrvDishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), silverMat);
        lrvDishMast.position.set(0.65, 0.65, 1.05);
        model.add(lrvDishMast);

        // Color RCA TV Camera & 16mm Maurer Camera Mast (Front-Left)
        const tvCam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.35), amberFoilMat);
        tvCam.position.set(-0.65, 0.75, 1.15);
        model.add(tvCam);
        const tvMast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8), silverMat);
        tvMast.position.set(-0.65, 0.35, 1.15);
        model.add(tvMast);

        // 4 Open Wire-Mesh Wheels with Chevron Titanium Treads and Gold Hubs
        for (let side = -1; side <= 1; side += 2) {
          [-0.95, 0.95].forEach(wz => {
            // Open Wire-Mesh Tire Rim
            const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.34, 24), darkMat);
            tire.rotation.z = Math.PI / 2;
            tire.position.set(side * 1.18, -0.65, wz);
            model.add(tire);

            // Titanium Chevron Tread Ring
            const tread = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 24), titaniumMat);
            tread.rotation.y = Math.PI / 2;
            tread.position.set(side * 1.18, -0.65, wz);
            model.add(tread);

            // Anodized Gold Hubcap
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.38, 16), goldMat);
            hub.rotation.z = Math.PI / 2;
            hub.position.set(side * 1.18, -0.65, wz);
            model.add(hub);

            // Protective Fiberglass Fenders
            const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.36, 16, 1, false, 0, Math.PI), silverMat);
            fender.rotation.z = Math.PI / 2;
            fender.rotation.x = -Math.PI / 2;
            fender.position.set(side * 1.18, -0.58, wz);
            model.add(fender);
          });
        }

        // Aft Scientific Tool Pallet & Lunar Sample Containers
        const aftPallet = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.24, 0.75), darkMat);
        aftPallet.position.set(0, -0.12, -1.25);
        model.add(aftPallet);

        [-0.45, 0.45].forEach(px => {
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.38), silverMat);
          box.position.set(px, 0.15, -1.25);
          model.add(box);
        });

      } else {
        // =====================================================================
        // 6-WHEELED NASA MARS ROVER (CURIOSITY / PERSEVERANCE / MER)
        // =====================================================================
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.82, 2.8), goldMat);
        chassis.position.y = -0.05;
        model.add(chassis);

        const topDeck = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.12, 2.95), whiteMat);
        topDeck.position.y = 0.42;
        model.add(topDeck);

        // Rear MMRTG Finned Nuclear Power Generator
        const rtgGroup = new THREE.Group();
        rtgGroup.position.set(0, 0.25, -1.75);
        rtgGroup.rotation.x = -0.35;
        const rtgCore = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.15, 16), whiteMat);
        rtgCore.rotation.x = Math.PI / 2;
        rtgGroup.add(rtgCore);
        for (let f = 0; f < 8; f++) {
          const fAng = (f * Math.PI) / 4;
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.78, 1.05), titaniumMat);
          fin.rotation.z = fAng;
          rtgGroup.add(fin);
        }
        model.add(rtgGroup);

        // Remote Sensing Mast (RSM) + SuperCam Laser + Mastcam-Z Stereo Eyes
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 1.75, 12), titaniumMat);
        mast.position.set(0.68, 1.25, 0.95);
        model.add(mast);

        const camHead = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.38, 0.42), whiteMat);
        camHead.position.set(0.68, 2.15, 0.95);
        model.add(camHead);

        const superCamEye = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.46, 16), cyanAccentMat);
        superCamEye.rotation.x = Math.PI / 2;
        superCamEye.position.set(0.68, 2.2, 0.98);
        model.add(superCamEye);

        // 5-DOF Articulated Front Robotic Arm + Coring Drill Turret
        const armBoom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.25), titaniumMat);
        armBoom1.position.set(-0.45, 0.1, 1.75);
        armBoom1.rotation.x = Math.PI / 3;
        model.add(armBoom1);

        const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.35, 12), silverMat);
        turret.position.set(-0.45, -0.25, 2.25);
        turret.rotation.z = Math.PI / 2;
        model.add(turret);

        // High-Gain Hexagonal Dish & UHF Antenna
        const hga = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 6), goldMat);
        hga.position.set(-0.65, 0.72, -0.75);
        hga.rotation.x = 0.25;
        model.add(hga);

        const uhf = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 10), darkMat);
        uhf.position.set(-0.75, 0.9, -1.1);
        model.add(uhf);

        // Rocker-Bogie Articulated Suspension + 6 Cleated Aluminum Wheels
        for (let side = -1; side <= 1; side += 2) {
          const rocker = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5), silverMat);
          rocker.rotation.x = Math.PI / 2;
          rocker.position.set(side * 1.25, -0.35, 0);
          model.add(rocker);

          [-1.25, 0, 1.25].forEach(wz => {
            const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.75), titaniumMat);
            strut.position.set(side * 1.38, -0.68, wz);
            model.add(strut);

            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.38, 20), darkMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(side * 1.52, -1.02, wz);
            model.add(wheel);

            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.41, 12), cyanAccentMat);
            hub.rotation.z = Math.PI / 2;
            hub.position.set(side * 1.52, -1.02, wz);
            model.add(hub);
          });
        }
      }

    } else if (type === 'helicopter') {
      // =====================================================================
      // INGENUITY MARS HELICOPTER ('GINNY')
      // =====================================================================
      const fuse = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 1.05), goldMat);
      fuse.position.y = -0.35;
      model.add(fuse);

      // Downward Navigation Camera & Laser Altimeter Window
      const navLens = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), cyanAccentMat);
      navLens.position.set(0, -0.92, 0.25);
      model.add(navLens);

      // Coaxial Carbon-Fiber Rotor Mast + Upper/Lower Swashplates
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.35, 16), darkMat);
      mast.position.y = 0.9;
      model.add(mast);

      [0.85, 1.45].forEach(sy => {
        const swash = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16), silverMat);
        swash.position.y = sy;
        model.add(swash);
      });

      // Historic Wright Brothers 1903 Flyer Fabric Swatch Band (Mounted under Solar Panel)
      const wrightBand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), amberFoilMat);
      wrightBand.position.y = 1.82;
      model.add(wrightBand);

      // Photovoltaic Solar Panel Array
      const solar = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 1.15), solarMat);
      solar.position.y = 2.02;
      model.add(solar);

      // Counter-Rotating Carbon-Fiber Airfoil Blades
      const bladeGeo = new THREE.BoxGeometry(4.6, 0.035, 0.34);
      const blade1 = new THREE.Mesh(bladeGeo, darkMat);
      blade1.position.y = 1.02;
      blade1.rotation.x = 0.12;
      const blade2 = new THREE.Mesh(bladeGeo, darkMat);
      blade2.position.y = 1.55;
      blade2.rotation.y = Math.PI / 2.2;
      blade2.rotation.z = -0.12;
      model.add(blade1);
      model.add(blade2);

      // 4 Carbon-Composite Landing Legs with Foot Dampers
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 2.25, 10), titaniumMat);
        leg.position.set(Math.cos(angle) * 0.95, -1.25, Math.sin(angle) * 0.95);
        leg.rotation.x = Math.sin(angle) * 0.42;
        leg.rotation.z = -Math.cos(angle) * 0.42;
        model.add(leg);

        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), cyanAccentMat);
        foot.position.set(Math.cos(angle) * 1.38, -2.02, Math.sin(angle) * 1.38);
        model.add(foot);
      }

    } else if (type === 'venera') {
      // =====================================================================
      // SOVIET VENERA 7 / 9 / 13 HIGH-PRESSURE VENUS LANDER
      // =====================================================================
      const sphereHull = new THREE.Mesh(new THREE.SphereGeometry(1.2, 28, 24), titaniumMat);
      sphereHull.position.y = -0.25;
      model.add(sphereHull);

      // Aerodynamic Decelerator Disk Brake Ring
      const aeroRing = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.85, 0.22, 28, 1, false), goldMat);
      aeroRing.position.y = 0.45;
      model.add(aeroRing);

      const rimTorus = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 12, 32), silverMat);
      rimTorus.rotation.x = Math.PI / 2;
      rimTorus.position.y = 0.45;
      model.add(rimTorus);

      // Top Cylindrical Helical Antenna Spire
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.35, 20), silverMat);
      tower.position.y = 1.2;
      model.add(tower);

      const helix = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.035, 48, 8, 2, 5), cyanAccentMat);
      helix.position.y = 1.95;
      model.add(helix);

      // Shock-Absorbing Bottom Landing Ring + Support Struts
      const landingRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.16, 14, 28), darkMat);
      landingRing.rotation.x = Math.PI / 2;
      landingRing.position.y = -1.65;
      model.add(landingRing);

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15), silverMat);
        strut.position.set(Math.cos(a) * 1.25, -1.15, Math.sin(a) * 1.25);
        strut.rotation.z = -Math.cos(a) * 0.35;
        strut.rotation.x = Math.sin(a) * 0.35;
        model.add(strut);
      }

      // Deployed GZU Soil Drill Arm & Ejected Titanium Lens Cap on Floor
      const drillArm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.24), copperEngineMat);
      drillArm.position.set(1.45, -1.35, 0);
      drillArm.rotation.z = -0.35;
      model.add(drillArm);

      const lensCap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16, 1, false, 0, Math.PI), whiteMat);
      lensCap.position.set(0.8, -1.75, 1.35);
      model.add(lensCap);

    } else if (type === 'huygens') {
      // =====================================================================
      // ESA/NASA HUYGENS TITAN ATMOSPHERIC & SURFACE PROBE
      // =====================================================================
      const domeTop = new THREE.Mesh(new THREE.SphereGeometry(1.45, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), goldMat);
      domeTop.position.y = -0.2;
      model.add(domeTop);

      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 1.55, 0.55, 32), silverMat);
      skirt.position.y = -0.35;
      model.add(skirt);

      const topBox = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.45, 20), whiteMat);
      topBox.position.y = 0.85;
      model.add(topBox);

      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), cyanAccentMat);
        rib.position.set(Math.cos(a) * 0.65, 1.35, Math.sin(a) * 0.65);
        rib.rotation.z = Math.cos(a) * 0.35;
        rib.rotation.x = -Math.sin(a) * 0.35;
        model.add(rib);
      }

      const disrPod = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.45), darkMat);
      disrPod.position.set(1.42, -0.35, 0);
      model.add(disrPod);

      const penetrometer = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, 0.85, 12), cyanAccentMat);
      penetrometer.position.set(0, -1.25, 0);
      model.add(penetrometer);

    } else if (type === 'philae') {
      // =====================================================================
      // ESA/NASA PHILAE COMET 67P LANDER
      // =====================================================================
      const bodyCore = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.35, 6), goldMat);
      bodyCore.position.y = 0.25;
      model.add(bodyCore);

      const solarHood = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 1.15, 6, 1, true, 0, Math.PI * 1.5), solarMat);
      solarHood.position.y = 0.32;
      model.add(solarHood);

      const adsNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.45, 14), silverMat);
      adsNozzle.position.y = 1.15;
      model.add(adsNozzle);

      const sd2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.65, 12), copperEngineMat);
      sd2.position.set(0.75, 0.15, 0.65);
      model.add(sd2);

      const girderRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 10, 20), titaniumMat);
      girderRing.rotation.x = Math.PI / 2;
      girderRing.position.y = -0.55;
      model.add(girderRing);

      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = a;

        const legBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 2.65, 10), darkMat);
        legBoom.position.set(1.55, -1.15, 0);
        legBoom.rotation.z = Math.PI / 3.2;
        legGroup.add(legBoom);

        for (let p = -1; p <= 1; p += 2) {
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 14), silverMat);
          pad.position.set(2.55, -1.78, p * 0.28);
          legGroup.add(pad);

          const screw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 8), cyanAccentMat);
          screw.rotation.x = Math.PI;
          screw.position.set(2.55, -1.92, p * 0.28);
          legGroup.add(screw);
        }

        model.add(legGroup);
      }

    } else if (type === 'skycrane') {
      // =====================================================================
      // MARS SCIENCE LABORATORY / PERSEVERANCE SKY CRANE DESCENT STAGE
      // =====================================================================
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.45, 8), silverMat);
      frame.position.y = 0.25;
      model.add(frame);

      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const tank = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 18), goldMat);
        tank.position.set(Math.cos(angle) * 0.92, 0.35, Math.sin(angle) * 0.92);
        model.add(tank);
      }

      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), darkMat);
        pod.position.set(Math.cos(angle) * 2.2, 0.0, Math.sin(angle) * 2.2);
        model.add(pod);

        for (let j = -1; j <= 1; j += 2) {
          const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.78, 14, 1, true), copperEngineMat);
          nozzle.position.set(
            Math.cos(angle) * 2.2 + (angle === 0 || angle === Math.PI ? 0 : j * 0.22),
            -0.62,
            Math.sin(angle) * 2.2 + (angle === 0 || angle === Math.PI ? j * 0.22 : 0)
          );
          nozzle.rotation.z = Math.cos(angle) * 0.38;
          nozzle.rotation.x = -Math.sin(angle) * 0.38;
          model.add(nozzle);
        }
      }

      const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16), cyanAccentMat);
      reel.position.y = -0.15;
      model.add(reel);

    } else if (type === 'stage') {
      // =====================================================================
      // SATURN V S-IVB / CENTAUR UPPER ROCKET STAGE
      // =====================================================================
      const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 3.1, 32), whiteMat);
      stage.position.y = 0.25;
      model.add(stage);

      const band1 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.55, 32), darkMat);
      band1.position.y = -0.65;
      model.add(band1);

      const band2 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.35, 32), goldMat);
      band2.position.y = 1.45;
      model.add(band2);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.38), silverMat);
      dome.position.y = 1.75;
      model.add(dome);

      const j2 = new THREE.Mesh(new THREE.ConeGeometry(1.02, 1.55, 24, 2, true), copperEngineMat);
      j2.position.y = -1.85;
      j2.rotation.x = Math.PI;
      model.add(j2);

      for (let p = -1; p <= 1; p += 2) {
        const aps = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.75, 0.35), darkMat);
        aps.position.set(p * 1.68, -0.85, 0);
        model.add(aps);
      }

    } else if (type === 'probe') {
      // =====================================================================
      // DEEP SPACE ASTEROID / LUNAR ORBITER & LANDER
      // =====================================================================
      const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.55, 8), goldMat);
      bus.position.y = -0.15;
      model.add(bus);

      const dish = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35), whiteMat);
      dish.rotation.x = Math.PI;
      dish.position.y = 1.05;
      model.add(dish);

      const feedHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.65, 12), cyanAccentMat);
      feedHorn.position.y = 1.15;
      model.add(feedHorn);

      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const wing = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 0.92), solarMat);
        wing.position.set(Math.cos(a) * 1.85, 0.35, Math.sin(a) * 1.85);
        wing.rotation.y = -a;
        wing.rotation.z = 0.22;
        model.add(wing);
      }

      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8), silverMat);
        boom.position.set(Math.cos(a) * 1.35, -0.95, Math.sin(a) * 1.35);
        boom.rotation.z = -Math.cos(a) * 0.52;
        boom.rotation.x = Math.sin(a) * 0.52;
        model.add(boom);
      }

    } else {
      // =====================================================================
      // PLANETARY AEROSHELL, BACKSHELL & ABLATIVE HEAT SHIELD
      // =====================================================================
      const backshell = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.55, 32), whiteMat);
      backshell.position.y = 0.35;
      model.add(backshell);

      const heatShield = new THREE.Mesh(new THREE.SphereGeometry(2.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.34), copperEngineMat);
      heatShield.position.y = -0.45;
      heatShield.rotation.x = Math.PI;
      model.add(heatShield);

      const bridle = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 12, 24), cyanAccentMat);
      bridle.position.y = 1.18;
      bridle.rotation.x = Math.PI / 2;
      model.add(bridle);
    }

    model.traverse((obj) => {
      if (obj.isMesh || obj.isLine) {
        obj.frustumCulled = false;
      }
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          m.side = THREE.DoubleSide;
        });
      }
    });

    this.miniModelGroup.add(model);
    this.currentMiniModel = model;

    if (this.miniControls) {
      this.miniControls.target.set(0, -0.1, 0);
      this.miniControls.update();
    }
  }

  // --- Interaction & Events ---
  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));

    let pointerDownPos = { x: 0, y: 0 };
    this.container.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.container.addEventListener('click', (e) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      // If user was dragging to orbit the camera, ignore click event on drag release
      if (Math.hypot(dx, dy) > 6) return;
      this.onClick(e);
    });
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
        if (window.SpaceAudio) window.SpaceAudio.playTelemetryPing(1400, 0.04);
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
    if (e && e.clientX !== undefined) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
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

    if (this.isAutoRotating) {
      this.planetGroup.rotation.y += this.autoRotateSpeed;
    }

    const time = performance.now() * 0.003;
    this.pins.forEach(p => {
      p.group.children.forEach(child => {
        if (child.userData && child.userData.isPulseRing) {
          const speedMul = child.userData.isCrashed ? 1.6 : 1.0;
          const s = 1.0 + (child.userData.isCrashed ? 0.55 : 0.45) * Math.sin(time * speedMul + child.userData.phase);
          child.scale.set(s, s, s);
          child.material.opacity = child.userData.isCrashed ? (0.95 - (s - 1.0) * 0.8) : (0.8 - (s - 1.0) * 0.9);
        }
      });
    });

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
