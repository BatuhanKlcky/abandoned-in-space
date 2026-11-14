/**
 * High-Precision Procedural PBR Planetary Surface & Globe Texture Engine
 * Supports: Moon, Mars, Venus, Titan, Comet 67P / Asteroid & Spacecraft Kapton/Solar PBR
 * Provides both Orbital Globe Maps and 1:1 Seamless Surface Regolith PBR Maps (Albedo, Bump, Roughness).
 * 100% Offline & WebXR Compatible, Zero CORS Issues.
 */

class CelestialTextureGenerator {
  constructor() {
    this.cache = {};
    this._initPermutationTable();
  }

  _initPermutationTable() {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let seed = 133742;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  // Seamless tileable 2D value noise (periodX, periodY)
  _tileableNoise(x, y, periodX, periodY) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    const u = xf * xf * (3.0 - 2.0 * xf);
    const v = yf * yf * (3.0 - 2.0 * yf);

    const x0 = ((xi % periodX) + periodX) % periodX;
    const x1 = ((x0 + 1) % periodX);
    const y0 = ((yi % periodY) + periodY) % periodY;
    const y1 = ((y0 + 1) % periodY);

    const p = this.perm;
    const aa = p[(p[x0 & 255] + (y0 & 255)) & 255] / 255.0;
    const ba = p[(p[x1 & 255] + (y0 & 255)) & 255] / 255.0;
    const ab = p[(p[x0 & 255] + (y1 & 255)) & 255] / 255.0;
    const bb = p[(p[x1 & 255] + (y1 & 255)) & 255] / 255.0;

    const xLerp1 = aa + u * (ba - aa);
    const xLerp2 = ab + u * (bb - ab);
    return xLerp1 + v * (xLerp2 - xLerp1);
  }

  // Multi-octave tileable Fractal Brownian Motion (FBM)
  _fbmTileable(normX, normY, baseFreq = 8, octaves = 5) {
    let value = 0.0;
    let amplitude = 0.5;
    let freq = baseFreq;
    let maxAmp = 0.0;

    for (let o = 0; o < octaves; o++) {
      value += this._tileableNoise(normX * freq, normY * freq, freq, freq) * amplitude;
      maxAmp += amplitude;
      freq *= 2;
      amplitude *= 0.5;
    }
    return value / maxAmp;
  }

  // Ridge FBM for sharp rock fractures, basalt cracks, and dune crests
  _ridgeFbmTileable(normX, normY, baseFreq = 6, octaves = 4) {
    let value = 0.0;
    let amplitude = 0.5;
    let freq = baseFreq;
    let maxAmp = 0.0;

    for (let o = 0; o < octaves; o++) {
      const n = this._tileableNoise(normX * freq, normY * freq, freq, freq);
      const ridge = 1.0 - Math.abs(n * 2.0 - 1.0);
      value += (ridge * ridge) * amplitude;
      maxAmp += amplitude;
      freq *= 2;
      amplitude *= 0.5;
    }
    return value / maxAmp;
  }

  /**
   * Generates a realistic crinkled Kapton Gold Foil bump/normal relief for 3D spacecraft models
   */
  generateKaptonFoilBump(width = 512, height = 512) {
    if (this.cache.kaptonBump) return this.cache.kaptonBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base neutral gray height
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // 1. Organic Voronoi-like faceted crinkles
    const points = [];
    const numPoints = 64;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        val: 0.35 + Math.random() * 0.3
      });
    }

    // Draw faceted polygons connecting nearby points to mimic crumpled foil sheets
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < Math.min(i + 5, points.length); j++) {
        const p1 = points[i];
        const p2 = points[j];
        const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 30;
        const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 30;

        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
        grad.addColorStop(0.5, 'rgba(30, 30, 30, 0.45)');
        grad.addColorStop(1, 'rgba(220, 220, 220, 0.35)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5 + Math.random() * 3.0;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
        ctx.stroke();
      }
    }

    // 2. Fine crumpled micro-creases
    for (let i = 0; i < 400; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const len = 10 + Math.random() * 35;
      const ang = Math.random() * Math.PI * 2;
      const x2 = x1 + Math.cos(ang) * len;
      const y2 = y1 + Math.sin(ang) * len;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.5, 'rgba(40, 40, 40, 0.35)');
      grad.addColorStop(1, 'rgba(200, 200, 200, 0.25)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.8 + Math.random() * 2.0;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.kaptonBump = texture;
    return texture;
  }

  /**
   * Generates a photorealistic aluminized Kapton Gold MLI diffuse/color map
   */
  generateKaptonFoilMap(width = 512, height = 512) {
    if (this.cache.kaptonMap) return this.cache.kaptonMap;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base rich amber-gold metallic gradient
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, '#f59e0b');
    baseGrad.addColorStop(0.35, '#d97706');
    baseGrad.addColorStop(0.7, '#fbbf24');
    baseGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // Layer irregular specular facets
    for (let i = 0; i < 70; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 25 + Math.random() * 70;
      const radGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      radGrad.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
      radGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.18)');
      radGrad.addColorStop(1, 'rgba(180, 83, 9, 0.0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thermal tape seam lines (NASA orange/amber acrylic adhesive tape)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.75)';
    ctx.lineWidth = 4;
    [128, 256, 384].forEach(coord => {
      ctx.beginPath();
      ctx.moveTo(coord, 0);
      ctx.lineTo(coord, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, coord);
      ctx.lineTo(width, coord);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.kaptonMap = texture;
    return texture;
  }

  /**
   * Generates authentic Inconel / Titanium thermal heat shield texture
   */
  generateInconelShieldTexture(width = 512, height = 512) {
    if (this.cache.inconelTex) return this.cache.inconelTex;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Brushed metallic grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let y = 0; y < height; y += 2) {
      if (Math.random() > 0.4) {
        ctx.fillRect(0, y, width, 1);
      }
    }

    // Panel perimeter fasteners / rivets
    ctx.fillStyle = '#475569';
    const step = 32;
    for (let x = 8; x < width; x += step) {
      ctx.beginPath();
      ctx.arc(x, 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, height - 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.inconelTex = texture;
    return texture;
  }

  /**
   * Generates high-end procedural studio environment map for realistic PBR reflections
   */
  generateStudioEnvMap(width = 1024, height = 512) {
    if (this.cache.studioEnv) return this.cache.studioEnv;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Neutral dark studio atmosphere gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0f18');
    bgGrad.addColorStop(0.45, '#151e2e');
    bgGrad.addColorStop(0.55, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Warm Key Softbox Light (overhead left)
    const keyGrad = ctx.createRadialGradient(width * 0.3, height * 0.28, 10, width * 0.3, height * 0.28, 140);
    keyGrad.addColorStop(0, 'rgba(255, 250, 240, 0.95)');
    keyGrad.addColorStop(0.4, 'rgba(254, 243, 199, 0.6)');
    keyGrad.addColorStop(1, 'rgba(254, 243, 199, 0.0)');
    ctx.fillStyle = keyGrad;
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.28, 140, 0, Math.PI * 2);
    ctx.fill();

    // Cool Rim Softbox Light (overhead right)
    const rimGrad = ctx.createRadialGradient(width * 0.75, height * 0.32, 10, width * 0.75, height * 0.32, 120);
    rimGrad.addColorStop(0, 'rgba(240, 249, 255, 0.85)');
    rimGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.4)');
    rimGrad.addColorStop(1, 'rgba(186, 230, 253, 0.0)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.32, 120, 0, Math.PI * 2);
    ctx.fill();

    // Studio horizon reflection strip
    const horizGrad = ctx.createLinearGradient(0, height * 0.48, 0, height * 0.52);
    horizGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    horizGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    horizGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, height * 0.48, width, height * 0.04);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.cache.studioEnv = texture;
    return texture;
  }

  /**
   * Generates a solar cell grid texture for spacecraft solar arrays
   */
  generateSolarPanelTexture(width = 512, height = 512) {
    if (this.cache.solarTex) return this.cache.solarTex;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(1, '#172554');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    const cols = 8;
    const rows = 16;
    const cw = width / cols;
    const ch = height / rows;

    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cw, 0);
      ctx.lineTo(c * cw, height);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ch);
      ctx.lineTo(width, r * ch);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1;
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cw + cw * 0.5, 0);
      ctx.lineTo(c * cw + cw * 0.5, height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.solarTex = texture;
    return texture;
  }

  // ===========================================================================
  // 1:1 PLANETARY SURFACE REGOLITH & BEDROCK PBR GENERATOR (ALL CELESTIAL BODIES)
  // Generates seamless, tileable 1024x1024 Albedo (map), Height (bumpMap),
  // and Micro-Roughness (roughnessMap) textures for Moon, Mars, Venus, Titan, Comet.
  // ===========================================================================
  generateSurfaceGroundPBR(surfaceType = 'moon', size = 1024) {
    const cacheKey = `groundPBR_${surfaceType}_${size}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const aCtx = albedoCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d');

    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const rCtx = roughCanvas.getContext('2d');

    const aImg = aCtx.createImageData(size, size);
    const bImg = bCtx.createImageData(size, size);
    const rImg = rCtx.createImageData(size, size);
    const aData = aImg.data;
    const bData = bImg.data;
    const rData = rImg.data;

    // 1. Pixel-level Multi-Octave Geological Synthesis
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const idx = (y * size + x) * 4;

        const macro = this._fbmTileable(nx, ny, 4, 4);
        const meso = this._fbmTileable(nx + 0.31, ny + 0.17, 16, 4);
        const micro = this._tileableNoise(nx * 64, ny * 64, 64, 64);
        const fineGrain = (Math.random() - 0.5);

        let r = 128, g = 128, b = 128;
        let heightVal = 128;
        let roughVal = 230;

        if (surfaceType === 'moon') {
          // Authentic Apollo Lunar Mare Basalt & Anorthosite Regolith
          // Subtle micrometeorite gardening streaks + fine glass spherule glint
          const ripple = Math.sin((nx * 18 + macro * 2.2) * Math.PI * 2) * 0.5 + 0.5;
          const baseLum = 92 + macro * 42 + (meso - 0.5) * 28 + (micro - 0.5) * 18 + fineGrain * 11;
          r = baseLum * 0.98;
          g = baseLum * 1.00;
          b = baseLum * 1.04;
          heightVal = 110 + macro * 55 + meso * 45 + ripple * 12 + (micro - 0.5) * 28 + fineGrain * 14;
          roughVal = 235 - (micro * 28) + fineGrain * 10;

        } else if (surfaceType === 'mars') {
          // Authentic Jezero / Gale Crater Iron-Oxide Regolith, Aeolian Sand Ripples & Sulfate Bedrock
          const duneWave = Math.sin((nx * 14 + ny * 6 + macro * 1.8) * Math.PI * 2);
          const duneCrest = Math.pow(Math.max(0, duneWave * 0.5 + 0.5), 1.6);
          const bedrockMask = Math.max(0, (macro - 0.58) * 3.2); // Exposed pale sedimentary rock slabs
          const darkSand = Math.max(0, (0.42 - macro) * 2.5);   // Dark basaltic trough sand

          r = 168 + meso * 36 - darkSand * 52 + bedrockMask * 38 + (micro - 0.5) * 22 + fineGrain * 10;
          g = 82  + meso * 24 - darkSand * 28 + bedrockMask * 44 + (micro - 0.5) * 14 + fineGrain * 8;
          b = 46  + meso * 16 - darkSand * 16 + bedrockMask * 40 + (micro - 0.5) * 10 + fineGrain * 6;

          heightVal = 95 + macro * 45 + duneCrest * 38 + bedrockMask * 42 + (micro - 0.5) * 26 + fineGrain * 12;
          roughVal = 228 - bedrockMask * 45 + darkSand * 15;

        } else if (surfaceType === 'venus') {
          // Authentic Venera 13/14 Fractured Flat Basaltic Slabs & Sulfuric Thermal Fissures
          const ridge = this._ridgeFbmTileable(nx, ny, 6, 4);
          const crackMask = ridge < 0.34 ? (0.34 - ridge) / 0.34 : 0; // Deep cooling fissures between flat basalt plates
          const sulfurStain = Math.max(0, (meso - 0.55) * 2.4);

          r = 128 + macro * 44 + sulfurStain * 55 - crackMask * 85 + (micro - 0.5) * 20 + fineGrain * 9;
          g = 76  + macro * 28 + sulfurStain * 42 - crackMask * 52 + (micro - 0.5) * 14 + fineGrain * 7;
          b = 24  + macro * 12 + sulfurStain * 8  - crackMask * 20 + (micro - 0.5) * 8  + fineGrain * 4;

          heightVal = 145 + macro * 35 - crackMask * 115 + (micro - 0.5) * 24 + fineGrain * 12;
          roughVal = 215 - sulfurStain * 30 + crackMask * 35;

        } else if (surfaceType === 'titan') {
          // Authentic Cassini-Huygens Shangri-La Organic Tholin Mud, Methane Channels & Water-Ice Cobbles
          const channel = this._ridgeFbmTileable(nx + 0.2, ny + 0.4, 5, 3);
          const dampStream = channel < 0.36 ? (0.36 - channel) / 0.36 : 0;
          const icePatch = Math.max(0, (meso - 0.68) * 3.0);

          r = 148 + macro * 38 - dampStream * 68 + icePatch * 55 + (micro - 0.5) * 18 + fineGrain * 8;
          g = 96  + macro * 28 - dampStream * 46 + icePatch * 62 + (micro - 0.5) * 14 + fineGrain * 6;
          b = 44  + macro * 16 - dampStream * 22 + icePatch * 75 + (micro - 0.5) * 10 + fineGrain * 5;

          heightVal = 120 + macro * 42 - dampStream * 65 + icePatch * 35 + (micro - 0.5) * 22 + fineGrain * 10;
          roughVal = 205 - dampStream * 75 - icePatch * 55; // Wet methane mud & water-ice glisten

        } else {
          // Comet 67P / Asteroid Carbonaceous Chondrite Crust & Sublimating Cryo-Ice Fractures
          const ridge = this._ridgeFbmTileable(nx, ny, 7, 4);
          const iceVein = ridge > 0.78 ? (ridge - 0.78) / 0.22 : 0;

          const baseC = 48 + macro * 32 + (meso - 0.5) * 24 + (micro - 0.5) * 18 + fineGrain * 10;
          r = baseC + iceVein * 135;
          g = baseC * 1.04 + iceVein * 148;
          b = baseC * 1.12 + iceVein * 165;

          heightVal = 100 + macro * 65 + ridge * 55 + (micro - 0.5) * 32 + fineGrain * 16;
          roughVal = 240 - iceVein * 110;
        }

        aData[idx]     = Math.min(255, Math.max(0, r));
        aData[idx + 1] = Math.min(255, Math.max(0, g));
        aData[idx + 2] = Math.min(255, Math.max(0, b));
        aData[idx + 3] = 255;

        const bClamped = Math.min(255, Math.max(0, heightVal));
        bData[idx] = bData[idx + 1] = bData[idx + 2] = bClamped;
        bData[idx + 3] = 255;

        const rClamped = Math.min(255, Math.max(0, roughVal));
        rData[idx] = rData[idx + 1] = rData[idx + 2] = rClamped;
        rData[idx + 3] = 255;
      }
    }

    aCtx.putImageData(aImg, 0, 0);
    bCtx.putImageData(bImg, 0, 0);
    rCtx.putImageData(rImg, 0, 0);

    // 2. Vector-Stamped Geological Micro-Features (Tile-Aware Craters, Pebbles, Basalt Plates & Strata)
    this._stampSurfaceMicroGeology(aCtx, bCtx, rCtx, surfaceType, size);

    const map = new THREE.CanvasTexture(albedoCanvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(18, 18);

    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.repeat.set(18, 18);

    const roughnessMap = new THREE.CanvasTexture(roughCanvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(18, 18);

    const bundle = { map, bumpMap, roughnessMap };
    this.cache[cacheKey] = bundle;
    return bundle;
  }

  _stampSurfaceMicroGeology(aCtx, bCtx, rCtx, surfaceType, size) {
    // Helper to stamp across tile boundaries (9-way wrap if near edges)
    const drawWrapped = (cx, cy, radius, drawFn) => {
      const offsets = [0];
      const oxList = [0];
      const oyList = [0];
      if (cx - radius < 0) oxList.push(size);
      if (cx + radius > size) oxList.push(-size);
      if (cy - radius < 0) oyList.push(size);
      if (cy + radius > size) oyList.push(-size);

      for (const ox of oxList) {
        for (const oy of oyList) {
          drawFn(cx + ox, cy + oy);
        }
      }
    };

    // Deterministic PRNG for stamps
    let s = surfaceType === 'moon' ? 101 : surfaceType === 'mars' ? 202 : surfaceType === 'venus' ? 303 : surfaceType === 'titan' ? 404 : 505;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return (s & 0xfffffff) / 0x10000000;
    };

    if (surfaceType === 'moon' || surfaceType === 'comet') {
      // Stamp 260 crisp multi-scale impact craters with ejecta aprons & sunken bowls
      const craterCount = surfaceType === 'moon' ? 260 : 180;
      for (let i = 0; i < craterCount; i++) {
        const cx = rand() * size;
        const cy = rand() * size;
        const r = i < 25 ? (18 + rand() * 34) : (3 + rand() * 13);

        drawWrapped(cx, cy, r * 1.6, (x, y) => {
          // Albedo crater bowl & sunlit rim
          const aGrad = aCtx.createRadialGradient(x - r * 0.18, y - r * 0.18, r * 0.1, x, y, r * 1.35);
          aGrad.addColorStop(0, 'rgba(28, 30, 35, 0.72)');
          aGrad.addColorStop(0.58, 'rgba(48, 52, 58, 0.45)');
          aGrad.addColorStop(0.78, 'rgba(185, 192, 202, 0.48)');
          aGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
          aCtx.fillStyle = aGrad;
          aCtx.beginPath();
          aCtx.arc(x, y, r * 1.35, 0, Math.PI * 2);
          aCtx.fill();

          // Bump height: deep dark pit inside, bright raised ring at rim
          const bGrad = bCtx.createRadialGradient(x, y, r * 0.05, x, y, r * 1.25);
          bGrad.addColorStop(0, 'rgba(18, 18, 18, 0.85)');
          bGrad.addColorStop(0.62, 'rgba(45, 45, 45, 0.70)');
          bGrad.addColorStop(0.82, 'rgba(242, 242, 242, 0.80)');
          bGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
          bCtx.fillStyle = bGrad;
          bCtx.beginPath();
          bCtx.arc(x, y, r * 1.25, 0, Math.PI * 2);
          bCtx.fill();
        });
      }
    }

    if (surfaceType === 'mars') {
      // Stamp Mars polygonal sulfate bedrock fractures, wind-scoured craters, and hematite pebbles
      for (let i = 0; i < 95; i++) {
        const cx = rand() * size;
        const cy = rand() * size;
        const r = 6 + rand() * 24;
        drawWrapped(cx, cy, r * 1.3, (x, y) => {
          // Eroded sand-filled Martian crater
          const aGrad = aCtx.createRadialGradient(x, y, r * 0.15, x, y, r * 1.2);
          aGrad.addColorStop(0, 'rgba(92, 38, 20, 0.55)');
          aGrad.addColorStop(0.7, 'rgba(225, 125, 75, 0.42)');
          aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          aCtx.fillStyle = aGrad;
          aCtx.beginPath();
          aCtx.arc(x, y, r * 1.2, 0, Math.PI * 2);
          aCtx.fill();

          const bGrad = bCtx.createRadialGradient(x, y, r * 0.1, x, y, r * 1.15);
          bGrad.addColorStop(0, 'rgba(45, 45, 45, 0.65)');
          bGrad.addColorStop(0.78, 'rgba(225, 225, 225, 0.70)');
          bGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
          bCtx.fillStyle = bGrad;
          bCtx.beginPath();
          bCtx.arc(x, y, r * 1.15, 0, Math.PI * 2);
          bCtx.fill();
        });
      }
    }

    if (surfaceType === 'venus') {
      // Stamp polygonal basaltic lava slab cracks & sulfur vents
      aCtx.lineCap = 'round';
      bCtx.lineCap = 'round';
      for (let i = 0; i < 110; i++) {
        const x1 = rand() * size;
        const y1 = rand() * size;
        const len = 25 + rand() * 85;
        const ang = rand() * Math.PI * 2;
        const x2 = x1 + Math.cos(ang) * len;
        const y2 = y1 + Math.sin(ang) * len;

        aCtx.strokeStyle = 'rgba(32, 16, 5, 0.65)';
        aCtx.lineWidth = 1.5 + rand() * 3.0;
        aCtx.beginPath();
        aCtx.moveTo(x1, y1);
        aCtx.lineTo(x2, y2);
        aCtx.stroke();

        bCtx.strokeStyle = 'rgba(15, 15, 15, 0.85)';
        bCtx.lineWidth = 2.0 + rand() * 3.5;
        bCtx.beginPath();
        bCtx.moveTo(x1, y1);
        bCtx.lineTo(x2, y2);
        bCtx.stroke();
      }
    }

    // 3. High-Density Scattered Surface Pebbles, Regolith Clasts & Ice Cobbles (All Bodies)
    const pebbleCount = surfaceType === 'titan' ? 650 : 520;
    for (let i = 0; i < pebbleCount; i++) {
      const px = rand() * size;
      const py = rand() * size;
      const pr = 1.2 + rand() * 4.2;

      drawWrapped(px, py, pr * 2, (x, y) => {
        if (surfaceType === 'titan') {
          // Rounded bright water-ice & hydrocarbon cobbles (Huygens DISR surface image style)
          aCtx.fillStyle = rand() > 0.35 ? 'rgba(235, 200, 145, 0.68)' : 'rgba(75, 48, 24, 0.65)';
        } else if (surfaceType === 'mars') {
          // Dark basaltic clasts & iron-oxide nodules
          aCtx.fillStyle = rand() > 0.4 ? 'rgba(78, 42, 28, 0.68)' : 'rgba(215, 128, 82, 0.58)';
        } else if (surfaceType === 'venus') {
          aCtx.fillStyle = 'rgba(62, 34, 10, 0.72)';
        } else {
          // Lunar / Comet angular breccia clasts
          aCtx.fillStyle = rand() > 0.45 ? 'rgba(195, 202, 212, 0.65)' : 'rgba(45, 48, 55, 0.65)';
        }
        aCtx.beginPath();
        aCtx.arc(x, y, pr, 0, Math.PI * 2);
        aCtx.fill();

        // Bump protrusion for every pebble
        bCtx.fillStyle = 'rgba(235, 235, 235, 0.75)';
        bCtx.beginPath();
        bCtx.arc(x, y, pr, 0, Math.PI * 2);
        bCtx.fill();
      });
    }
  }

  /**
   * Generates a high-relief stratified rock PBR texture & bump map for 3D surface boulders
   */
  generateRockPBR(surfaceType = 'moon', size = 512) {
    const key = `rockPBR_${surfaceType}`;
    if (this.cache[key]) return this.cache[key];

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d');

    const img = ctx.createImageData(size, size);
    const bImg = bCtx.createImageData(size, size);
    const d = img.data;
    const bd = bImg.data;

    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const idx = (y * size + x) * 4;
        const n1 = this._fbmTileable(nx, ny, 6, 4);
        const strata = Math.sin((ny * 16 + n1 * 2.5) * Math.PI * 2) * 0.5 + 0.5;
        const grain = (Math.random() - 0.5) * 24;

        let r = 100, g = 100, b = 100;
        if (surfaceType === 'mars') {
          r = 122 + n1 * 45 + strata * 22 + grain;
          g = 62  + n1 * 26 + strata * 14 + grain * 0.7;
          b = 38  + n1 * 16 + strata * 10 + grain * 0.5;
        } else if (surfaceType === 'venus') {
          r = 85 + n1 * 38 + strata * 25 + grain;
          g = 52 + n1 * 24 + strata * 16 + grain * 0.7;
          b = 20 + n1 * 12 + strata * 8  + grain * 0.4;
        } else if (surfaceType === 'titan') {
          // Water-ice bedrock coated in orange tholins
          r = 155 + n1 * 50 + strata * 20 + grain;
          g = 128 + n1 * 45 + strata * 20 + grain;
          b = 95  + n1 * 48 + strata * 22 + grain;
        } else {
          // Lunar vesicular basalt / breccia boulder
          const v = 86 + n1 * 52 + strata * 18 + grain;
          r = v * 0.98;
          g = v;
          b = v * 1.03;
        }

        d[idx]     = Math.min(255, Math.max(0, r));
        d[idx + 1] = Math.min(255, Math.max(0, g));
        d[idx + 2] = Math.min(255, Math.max(0, b));
        d[idx + 3] = 255;

        const bv = Math.min(255, Math.max(0, 75 + n1 * 110 + strata * 45 + grain));
        bd[idx] = bd[idx + 1] = bd[idx + 2] = bv;
        bd[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    bCtx.putImageData(bImg, 0, 0);

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;

    const res = { map, bumpMap };
    this.cache[key] = res;
    return res;
  }

  /**
   * Generates a radial retro-rocket exhaust blast mark / scorched regolith decal
   * placed directly beneath the spacecraft nozzle on the planetary surface.
   */
  generateBlastZoneTexture(surfaceType = 'moon', size = 512) {
    const key = `blastZone_${surfaceType}`;
    if (this.cache[key]) return this.cache[key];

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.48;

    // Central darkened scorch & swept regolith ring
    const baseGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxR);
    if (surfaceType === 'mars') {
      baseGrad.addColorStop(0, 'rgba(38, 18, 10, 0.82)');
      baseGrad.addColorStop(0.35, 'rgba(68, 32, 18, 0.55)');
      baseGrad.addColorStop(0.7, 'rgba(165, 85, 45, 0.25)');
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (surfaceType === 'venus') {
      baseGrad.addColorStop(0, 'rgba(25, 12, 4, 0.78)');
      baseGrad.addColorStop(0.5, 'rgba(85, 45, 12, 0.42)');
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      baseGrad.addColorStop(0, 'rgba(22, 24, 28, 0.85)');
      baseGrad.addColorStop(0.32, 'rgba(48, 52, 58, 0.58)');
      baseGrad.addColorStop(0.68, 'rgba(155, 162, 172, 0.28)');
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();

    // High-velocity radial plume erosion streaks (authentic Apollo DPS exhaust radial rays)
    for (let i = 0; i < 140; i++) {
      const ang = (i / 140) * Math.PI * 2 + (Math.random() - 0.5) * 0.04;
      const rIn = 12 + Math.random() * 28;
      const rOut = maxR * (0.55 + Math.random() * 0.44);
      const x1 = cx + Math.cos(ang) * rIn;
      const y1 = cy + Math.sin(ang) * rIn;
      const x2 = cx + Math.cos(ang) * rOut;
      const y2 = cy + Math.sin(ang) * rOut;

      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, 'rgba(20, 22, 25, 0.45)');
      g.addColorStop(0.5, 'rgba(190, 198, 210, 0.25)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache[key] = texture;
    return texture;
  }

  /**
   * Generates a high-detail procedural Moon orbital surface texture
   */
  generateMoonTexture(width = 2048, height = 1024) {
    if (this.cache.moonTexture) return this.cache.moonTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#5a5e66');
    baseGrad.addColorStop(0.5, '#767a82');
    baseGrad.addColorStop(1, '#5a5e66');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const idx = (y * width + x) * 4;
        const fbm = (this._fbmTileable(nx, ny, 8, 4) - 0.5) * 55;
        const n = (Math.random() - 0.5) * 26 + fbm;
        data[idx]     = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 1.03));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const maria = [
      { x: width * 0.56, y: height * 0.48, rx: width * 0.12, ry: height * 0.16, opacity: 0.68 },
      { x: width * 0.42, y: height * 0.38, rx: width * 0.08, ry: height * 0.12, opacity: 0.72 },
      { x: width * 0.35, y: height * 0.42, rx: width * 0.05, ry: height * 0.07, opacity: 0.62 },
      { x: width * 0.32, y: height * 0.49, rx: width * 0.06, ry: height * 0.07, opacity: 0.70 },
      { x: width * 0.23, y: height * 0.45, rx: width * 0.04, ry: height * 0.05, opacity: 0.74 },
      { x: width * 0.39, y: height * 0.62, rx: width * 0.07, ry: height * 0.09, opacity: 0.60 },
      { x: width * 0.48, y: height * 0.55, rx: width * 0.06, ry: height * 0.08, opacity: 0.62 },
    ];

    maria.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 5, m.x, m.y, Math.max(m.rx, m.ry));
      g.addColorStop(0, `rgba(30, 33, 38, ${m.opacity})`);
      g.addColorStop(0.5, `rgba(44, 48, 55, ${m.opacity * 0.85})`);
      g.addColorStop(0.85, `rgba(65, 68, 74, ${m.opacity * 0.4})`);
      g.addColorStop(1, 'rgba(80, 83, 89, 0)');

      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.scale(m.rx / Math.max(m.rx, m.ry), m.ry / Math.max(m.rx, m.ry));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(m.rx, m.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this._stampCraterWithRays(ctx, width * 0.46, height * 0.73, 18, 130, '#d8dcde');
    this._stampCraterWithRays(ctx, width * 0.44, height * 0.44, 22, 95, '#c8cdd0');
    this._stampCraterWithRays(ctx, width * 0.52, height * 0.46, 14, 65, '#bcc0c4');

    for (let i = 0; i < 520; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 1.8 + Math.random() * 10;
      this._stampSmallCrater(ctx, cx, cy, r);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.moonTexture = texture;
    return texture;
  }

  generateMoonBump(width = 1024, height = 512) {
    if (this.cache.moonBump) return this.cache.moonBump;
    const pbr = this.generateSurfaceGroundPBR('moon', 1024);
    this.cache.moonBump = pbr.bumpMap;
    return pbr.bumpMap;
  }

  /**
   * Generates a realistic Mars orbital surface texture
   */
  generateMarsTexture(width = 2048, height = 1024) {
    if (this.cache.marsTexture) return this.cache.marsTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#c9643b');
    baseGrad.addColorStop(0.3, '#d87040');
    baseGrad.addColorStop(0.5, '#c25e34');
    baseGrad.addColorStop(0.8, '#af502b');
    baseGrad.addColorStop(1, '#943d1f');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const idx = (y * width + x) * 4;
        const fbm = (this._fbmTileable(nx, ny, 8, 4) - 0.5) * 48;
        const n = (Math.random() - 0.5) * 24 + fbm;
        data[idx]     = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n * 0.78));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 0.48));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const darkFeatures = [
      { x: width * 0.65, y: height * 0.45, rx: width * 0.08, ry: height * 0.18, color: 'rgba(75, 45, 35, 0.75)' },
      { x: width * 0.35, y: height * 0.32, rx: width * 0.12, ry: height * 0.14, color: 'rgba(85, 52, 40, 0.60)' },
      { x: width * 0.48, y: height * 0.52, rx: width * 0.09, ry: height * 0.10, color: 'rgba(70, 40, 32, 0.70)' },
      { x: width * 0.82, y: height * 0.60, rx: width * 0.11, ry: height * 0.12, color: 'rgba(90, 55, 42, 0.65)' },
      { x: width * 0.20, y: height * 0.55, rx: width * 0.07, ry: height * 0.09, color: 'rgba(80, 48, 38, 0.55)' },
    ];

    darkFeatures.forEach(f => {
      const g = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, Math.max(f.rx, f.ry));
      g.addColorStop(0, f.color);
      g.addColorStop(0.7, 'rgba(60, 35, 25, 0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.rx / Math.max(f.rx, f.ry), f.ry / Math.max(f.rx, f.ry));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(f.rx, f.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.strokeStyle = 'rgba(50, 25, 20, 0.85)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const vY = height * 0.54;
    ctx.moveTo(width * 0.28, vY);
    ctx.bezierCurveTo(width * 0.35, vY + 20, width * 0.42, vY - 15, width * 0.47, vY + 10);
    ctx.stroke();
    ctx.restore();

    this._stampVolcano(ctx, width * 0.18, height * 0.40, 28, '#8b4528', '#3d1a10');
    this._stampVolcano(ctx, width * 0.25, height * 0.35, 18, '#91492b', '#441d12');
    this._stampVolcano(ctx, width * 0.23, height * 0.48, 18, '#91492b', '#441d12');
    this._stampVolcano(ctx, width * 0.21, height * 0.60, 18, '#91492b', '#441d12');

    const northCap = ctx.createLinearGradient(0, 0, 0, height * 0.12);
    northCap.addColorStop(0, '#ffffff');
    northCap.addColorStop(0.6, '#eef6ff');
    northCap.addColorStop(1, 'rgba(235, 245, 255, 0)');
    ctx.fillStyle = northCap;
    ctx.fillRect(0, 0, width, height * 0.12);

    const southCap = ctx.createLinearGradient(0, height, 0, height * 0.90);
    southCap.addColorStop(0, '#ffffff');
    southCap.addColorStop(0.5, '#f4faff');
    southCap.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = southCap;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);

    for (let i = 0; i < 340; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 9;
      this._stampSmallCrater(ctx, cx, cy, r, 'rgba(60, 30, 20, 0.55)', 'rgba(240, 180, 150, 0.45)');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.marsTexture = texture;
    return texture;
  }

  generateMarsBump(width = 1024, height = 512) {
    if (this.cache.marsBump) return this.cache.marsBump;
    const pbr = this.generateSurfaceGroundPBR('mars', 1024);
    this.cache.marsBump = pbr.bumpMap;
    return pbr.bumpMap;
  }

  /**
   * Generates a Magellan Radar & Sulfuric Acid Cloud Texture for VENUS
   */
  generateVenusTexture(width = 2048, height = 1024) {
    if (this.cache.venusTexture) return this.cache.venusTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#9a5b13');
    baseGrad.addColorStop(0.25, '#c87d20');
    baseGrad.addColorStop(0.5, '#e09b35');
    baseGrad.addColorStop(0.75, '#c2741b');
    baseGrad.addColorStop(1, '#8c4f10');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // High-resolution Magellan SAR radar backscatter noise
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const idx = (y * width + x) * 4;
        const ridge = (this._ridgeFbmTileable(nx, ny, 8, 4) - 0.5) * 52;
        const n = (Math.random() - 0.5) * 18 + ridge;
        data[idx]     = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n * 0.72));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 0.35));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const continents = [
      { x: width * 0.52, y: height * 0.55, rx: width * 0.24, ry: height * 0.11, col: 'rgba(255, 210, 110, 0.58)' },
      { x: width * 0.35, y: height * 0.22, rx: width * 0.16, ry: height * 0.09, col: 'rgba(255, 225, 130, 0.68)' },
      { x: width * 0.78, y: height * 0.42, rx: width * 0.10, ry: height * 0.14, col: 'rgba(245, 190, 90, 0.52)' },
      { x: width * 0.22, y: height * 0.62, rx: width * 0.13, ry: height * 0.12, col: 'rgba(110, 50, 10, 0.58)' },
    ];

    continents.forEach(c => {
      const g = ctx.createRadialGradient(c.x, c.y, 8, c.x, c.y, Math.max(c.rx, c.ry));
      g.addColorStop(0, c.col);
      g.addColorStop(0.6, 'rgba(180, 105, 25, 0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.rx / Math.max(c.rx, c.ry), c.ry / Math.max(c.rx, c.ry));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(c.rx, c.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    for (let b = 0; b < 36; b++) {
      const y = (b / 36) * height;
      ctx.strokeStyle = b % 2 === 0 ? 'rgba(255, 232, 165, 0.18)' : 'rgba(120, 62, 12, 0.16)';
      ctx.lineWidth = 8 + Math.random() * 18;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 128) {
        const dy = Math.sin((x / width) * Math.PI * 4 + b) * 16;
        ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 140; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 4 + Math.random() * 14;
      this._stampVolcano(ctx, cx, cy, r, '#b86b19', '#4a2104');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.venusTexture = texture;
    return texture;
  }

  generateVenusBump(width = 1024, height = 512) {
    if (this.cache.venusBump) return this.cache.venusBump;
    const pbr = this.generateSurfaceGroundPBR('venus', 1024);
    this.cache.venusBump = pbr.bumpMap;
    return pbr.bumpMap;
  }

  /**
   * Generates a Cassini VIMS / Radar Texture for TITAN & Outer System Worlds
   */
  generateTitanTexture(width = 2048, height = 1024) {
    if (this.cache.titanTexture) return this.cache.titanTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#805b36');
    baseGrad.addColorStop(0.25, '#b88648');
    baseGrad.addColorStop(0.5, '#d49e54');
    baseGrad.addColorStop(0.75, '#b37f40');
    baseGrad.addColorStop(1, '#755230');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const idx = (y * width + x) * 4;
        const fbm = (this._fbmTileable(nx, ny, 8, 4) - 0.5) * 44;
        const n = (Math.random() - 0.5) * 16 + fbm;
        data[idx]     = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n * 0.78));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 0.52));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const dunes = [
      { x: width * 0.46, y: height * 0.54, rx: width * 0.18, ry: height * 0.09, col: 'rgba(48, 32, 18, 0.74)' },
      { x: width * 0.72, y: height * 0.48, rx: width * 0.15, ry: height * 0.08, col: 'rgba(52, 35, 20, 0.68)' },
      { x: width * 0.22, y: height * 0.56, rx: width * 0.14, ry: height * 0.07, col: 'rgba(45, 30, 16, 0.70)' },
    ];
    dunes.forEach(d => {
      const g = ctx.createRadialGradient(d.x, d.y, 10, d.x, d.y, Math.max(d.rx, d.ry));
      g.addColorStop(0, d.col);
      g.addColorStop(0.7, 'rgba(60, 40, 22, 0.3)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(d.rx / Math.max(d.rx, d.ry), d.ry / Math.max(d.rx, d.ry));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(d.rx, d.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const highlands = [
      { x: width * 0.32, y: height * 0.54, rx: width * 0.12, ry: height * 0.08 },
      { x: width * 0.42, y: height * 0.53, rx: width * 0.06, ry: height * 0.05 },
    ];
    highlands.forEach(h => {
      const g = ctx.createRadialGradient(h.x, h.y, 5, h.x, h.y, Math.max(h.rx, h.ry));
      g.addColorStop(0, 'rgba(255, 228, 170, 0.75)');
      g.addColorStop(0.6, 'rgba(230, 185, 110, 0.35)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.x, h.y, Math.max(h.rx, h.ry), 0, Math.PI * 2);
      ctx.fill();
    });

    const lakes = [
      { x: width * 0.65, y: height * 0.14, rx: width * 0.11, ry: height * 0.07 },
      { x: width * 0.48, y: height * 0.11, rx: width * 0.07, ry: height * 0.05 },
    ];
    lakes.forEach(l => {
      const g = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, Math.max(l.rx, l.ry));
      g.addColorStop(0, 'rgba(15, 28, 42, 0.88)');
      g.addColorStop(0.75, 'rgba(25, 42, 58, 0.55)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, Math.max(l.rx, l.ry), 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < 200; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 8;
      this._stampSmallCrater(ctx, cx, cy, r, 'rgba(50, 35, 18, 0.38)', 'rgba(255, 220, 160, 0.35)');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.titanTexture = texture;
    return texture;
  }

  generateTitanBump(width = 1024, height = 512) {
    if (this.cache.titanBump) return this.cache.titanBump;
    const pbr = this.generateSurfaceGroundPBR('titan', 1024);
    this.cache.titanBump = pbr.bumpMap;
    return pbr.bumpMap;
  }

  // --- Helper stamp methods ---
  _stampSmallCrater(ctx, x, y, r, shadow = 'rgba(20, 20, 22, 0.5)', highlight = 'rgba(220, 225, 230, 0.4)') {
    ctx.save();
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = highlight;
    ctx.lineWidth = Math.max(1, r * 0.25);
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI * 0.3, Math.PI * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  _stampCraterWithRays(ctx, x, y, r, rayLength, color) {
    ctx.save();
    const rays = 12;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const len = rayLength * (0.6 + Math.random() * 0.7);
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;

      const g = ctx.createLinearGradient(x, y, ex, ey);
      g.addColorStop(0, 'rgba(240, 245, 250, 0.6)');
      g.addColorStop(0.5, 'rgba(200, 210, 220, 0.25)');
      g.addColorStop(1, 'rgba(180, 190, 200, 0)');

      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    this._stampSmallCrater(ctx, x, y, r, 'rgba(25, 27, 30, 0.7)', color);
    ctx.restore();
  }

  _stampVolcano(ctx, x, y, r, baseColor, calderaColor) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, calderaColor);
    g.addColorStop(0.2, '#662817');
    g.addColorStop(0.6, baseColor);
    g.addColorStop(1, 'rgba(180, 80, 45, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#220c06';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Procedural High-Resolution Turkish Flag Texture (Türk Bayrağı - Al Bayrak)
   * Formulated according to official Turkish Flag Law (Türk Bayrağı Kanunu) geometric proportions
   */
  generateTurkishFlagTexture() {
    if (this.cache['turkish_flag']) return this.cache['turkish_flag'];

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 682; // 3:2 ratio
    const ctx = canvas.getContext('2d');
    const G = 682;
    const L = 1024;

    // Turkish Red Field (#E30A17)
    ctx.fillStyle = '#E30A17';
    ctx.fillRect(0, 0, L, G);

    // Crescent (Hilal)
    // Outer white circle
    const c1x = 0.5 * G;
    const c1y = 0.5 * G;
    const r1 = 0.25 * G;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(c1x, c1y, r1, 0, Math.PI * 2);
    ctx.fill();

    // Inner red circle
    const c2x = c1x + 0.0625 * G;
    const r2 = 0.20 * G;
    ctx.fillStyle = '#E30A17';
    ctx.beginPath();
    ctx.arc(c2x, c1y, r2, 0, Math.PI * 2);
    ctx.fill();

    // 5-Pointed Star (Yıldız)
    const starCenterX = c2x + (1 / 3) * G;
    const starCenterY = 0.5 * G;
    const outerR = 0.125 * G;
    const innerR = outerR * Math.sin(Math.PI / 10) / Math.sin(7 * Math.PI / 10);

    // Left vertex points directly at crescent opening (angle = Math.PI)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI + (i * Math.PI / 5);
      const r = (i % 2 === 0) ? outerR : innerR;
      const x = starCenterX + r * Math.cos(angle);
      const y = starCenterY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    if (typeof THREE !== 'undefined' && THREE.CanvasTexture) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      this.cache['turkish_flag'] = tex;
      return tex;
    }
    return canvas;
  }
}

window.CelestialTextures = new CelestialTextureGenerator();
window.ProceduralTextures = window.CelestialTextures;
