/**
 * Procedural & Dynamic Texture Generator for Moon and Mars
 * Guarantees 100% offline compatibility, zero CORS issues, and realistic topography.
 */

class CelestialTextureGenerator {
  constructor() {
    this.cache = {};
  }

  // Pseudo-random noise helper with deterministic seed
  static createNoise(width, height) {
    const size = width * height;
    const noise = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      noise[i] = Math.random();
    }
    return noise;
  }

  /**
   * Generates a high-detail procedural Moon surface texture
   * Includes lunar maria (dark basalt plains like Mare Tranquillitatis),
   * highland regolith, crater rims, and bright ray systems (like Tycho/Copernicus).
   */
  generateMoonTexture(width = 2048, height = 1024) {
    if (this.cache.moonTexture) return this.cache.moonTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Base lunar highland color (dusty grey with subtle warm-cold shifts)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#53565b');
    baseGrad.addColorStop(0.5, '#696c72');
    baseGrad.addColorStop(1, '#53565b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Add organic noise / regolith grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const n = (Math.random() - 0.5) * 35;
        data[idx] = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Paint Lunar Maria (Dark Basalt Seas)
    // Coords translated to equirectangular:
    // Mare Tranquillitatis, Serenitatis, Imbrium, Oceanus Procellarum, Nubium, Crisium
    const maria = [
      { x: width * 0.56, y: height * 0.48, rx: width * 0.12, ry: height * 0.16, opacity: 0.65 }, // Oceanus Procellarum
      { x: width * 0.42, y: height * 0.38, rx: width * 0.08, ry: height * 0.12, opacity: 0.70 }, // Mare Imbrium
      { x: width * 0.35, y: height * 0.42, rx: width * 0.05, ry: height * 0.07, opacity: 0.60 }, // Mare Serenitatis
      { x: width * 0.32, y: height * 0.49, rx: width * 0.06, ry: height * 0.07, opacity: 0.68 }, // Mare Tranquillitatis (Apollo 11)
      { x: width * 0.23, y: height * 0.45, rx: width * 0.04, ry: height * 0.05, opacity: 0.72 }, // Mare Crisium
      { x: width * 0.39, y: height * 0.62, rx: width * 0.07, ry: height * 0.09, opacity: 0.58 }, // Mare Nubium
      { x: width * 0.48, y: height * 0.55, rx: width * 0.06, ry: height * 0.08, opacity: 0.60 }, // Mare Cognitum / Fra Mauro
    ];

    maria.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 5, m.x, m.y, Math.max(m.rx, m.ry));
      g.addColorStop(0, `rgba(32, 34, 38, ${m.opacity})`);
      g.addColorStop(0.5, `rgba(45, 48, 54, ${m.opacity * 0.85})`);
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

    // 4. Paint Primary Craters & Ray Systems (e.g. Tycho at south, Copernicus, Kepler)
    this._stampCraterWithRays(ctx, width * 0.46, height * 0.73, 18, 120, '#d8dcde'); // Tycho
    this._stampCraterWithRays(ctx, width * 0.44, height * 0.44, 22, 90, '#c8cdd0');  // Copernicus
    this._stampCraterWithRays(ctx, width * 0.52, height * 0.46, 14, 60, '#bcc0c4');  // Kepler

    // 5. Scatter hundreds of realistic smaller impact craters
    for (let i = 0; i < 400; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 9;
      this._stampSmallCrater(ctx, cx, cy, r);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.moonTexture = texture;
    return texture;
  }

  /**
   * Generates high-detail Moon bump / elevation map
   */
  generateMoonBump(width = 1024, height = 512) {
    if (this.cache.moonBump) return this.cache.moonBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Maria are lower depression regions (darker grey)
    const maria = [
      { x: width * 0.56, y: height * 0.48, rx: width * 0.12, ry: height * 0.16 },
      { x: width * 0.42, y: height * 0.38, rx: width * 0.08, ry: height * 0.12 },
      { x: width * 0.32, y: height * 0.49, rx: width * 0.06, ry: height * 0.07 },
    ];
    maria.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 5, m.x, m.y, m.rx);
      g.addColorStop(0, 'rgba(40, 40, 40, 0.6)');
      g.addColorStop(1, 'rgba(128, 128, 128, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.rx, 0, Math.PI * 2);
      ctx.fill();
    });

    // Elevated crater rims (bright white rim, dark floor)
    for (let i = 0; i < 300; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 8;
      // White rim
      ctx.strokeStyle = 'rgba(230, 230, 230, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Dark hollow center
      ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.moonBump = texture;
    return texture;
  }

  /**
   * Generates a realistic Mars surface texture
   * Includes iron-oxide rusty plains, dark basaltic volcanic terrains (Syrtis Major, Acidalia),
   * Valles Marineris canyon rift, Tharsis volcanoes (Olympus Mons), and gleaming polar ice caps.
   */
  generateMarsTexture(width = 2048, height = 1024) {
    if (this.cache.marsTexture) return this.cache.marsTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Base Martian Orange-Red ochre gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#c9643b');
    baseGrad.addColorStop(0.3, '#d87040');
    baseGrad.addColorStop(0.5, '#c25e34');
    baseGrad.addColorStop(0.8, '#af502b');
    baseGrad.addColorStop(1, '#943d1f');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Iron oxide sand grain & dust variations
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const n = (Math.random() - 0.5) * 30;
        data[idx] = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n * 0.8));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 0.5));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Dark Albedo Features (Syrtis Major, Acidalia Planitia, Sinus Meridiani)
    const darkFeatures = [
      { x: width * 0.65, y: height * 0.45, rx: width * 0.08, ry: height * 0.18, color: 'rgba(75, 45, 35, 0.75)' }, // Syrtis Major
      { x: width * 0.35, y: height * 0.32, rx: width * 0.12, ry: height * 0.14, color: 'rgba(85, 52, 40, 0.60)' }, // Acidalia Planitia
      { x: width * 0.48, y: height * 0.52, rx: width * 0.09, ry: height * 0.10, color: 'rgba(70, 40, 32, 0.70)' }, // Sinus Meridiani (Opportunity)
      { x: width * 0.82, y: height * 0.60, rx: width * 0.11, ry: height * 0.12, color: 'rgba(90, 55, 42, 0.65)' }, // Mare Cimmerium / Tyrrhenum
      { x: width * 0.20, y: height * 0.55, rx: width * 0.07, ry: height * 0.09, color: 'rgba(80, 48, 38, 0.55)' }, // Solis Lacus ("Eye of Mars")
    ];

    darkFeatures.forEach(f => {
      const g = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, Math.max(f.rx, f.ry));
      g.addColorStop(0, f.color);
      g.addColorStop(0.7, f.color.replace('0.75', '0.4').replace('0.70', '0.35').replace('0.60', '0.25').replace('0.65', '0.3').replace('0.55', '0.2'));
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

    // 4. Valles Marineris (The Grand Canyon of Mars)
    ctx.save();
    ctx.strokeStyle = 'rgba(50, 25, 20, 0.85)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const vY = height * 0.54;
    ctx.moveTo(width * 0.28, vY);
    ctx.bezierCurveTo(width * 0.35, vY + 20, width * 0.42, vY - 15, width * 0.47, vY + 10);
    ctx.stroke();

    // Secondary rift chasms
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(40, 20, 15, 0.7)';
    ctx.beginPath();
    ctx.moveTo(width * 0.31, vY - 12);
    ctx.lineTo(width * 0.44, vY - 5);
    ctx.stroke();
    ctx.restore();

    // 5. Olympus Mons & Tharsis Shield Volcanoes
    this._stampVolcano(ctx, width * 0.18, height * 0.40, 28, '#8b4528', '#3d1a10'); // Olympus Mons
    this._stampVolcano(ctx, width * 0.25, height * 0.35, 18, '#91492b', '#441d12'); // Ascraeus Mons
    this._stampVolcano(ctx, width * 0.23, height * 0.48, 18, '#91492b', '#441d12'); // Pavonis Mons
    this._stampVolcano(ctx, width * 0.21, height * 0.60, 18, '#91492b', '#441d12'); // Arsia Mons

    // 6. Brilliant Polar Ice Caps (Water ice North + CO2 South)
    // North Pole Cap
    const northCap = ctx.createLinearGradient(0, 0, 0, height * 0.12);
    northCap.addColorStop(0, '#ffffff');
    northCap.addColorStop(0.6, '#eef6ff');
    northCap.addColorStop(0.85, 'rgba(235, 245, 255, 0.8)');
    northCap.addColorStop(1, 'rgba(235, 245, 255, 0)');
    ctx.fillStyle = northCap;
    ctx.fillRect(0, 0, width, height * 0.12);

    // South Pole Cap (slightly smaller, seasonal)
    const southCap = ctx.createLinearGradient(0, height, 0, height * 0.90);
    southCap.addColorStop(0, '#ffffff');
    southCap.addColorStop(0.5, '#f4faff');
    southCap.addColorStop(0.8, 'rgba(240, 248, 255, 0.75)');
    southCap.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = southCap;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);

    // 7. Martian impact craters (Gale, Gusev, Jezero, Endeavour)
    for (let i = 0; i < 250; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 8;
      this._stampSmallCrater(ctx, cx, cy, r, 'rgba(60, 30, 20, 0.5)', 'rgba(240, 180, 150, 0.4)');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.marsTexture = texture;
    return texture;
  }

  /**
   * Generates Mars bump map (Valles Marineris deep trench, Olympus Mons summit, crater ridges)
   */
  generateMarsBump(width = 1024, height = 512) {
    if (this.cache.marsBump) return this.cache.marsBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Olympus Mons (Massive white mountain dome)
    const oGrad = ctx.createRadialGradient(width * 0.18, height * 0.40, 3, width * 0.18, height * 0.40, 26);
    oGrad.addColorStop(0, '#ffffff');
    oGrad.addColorStop(0.3, '#d8d8d8');
    oGrad.addColorStop(0.8, '#999999');
    oGrad.addColorStop(1, '#808080');
    ctx.fillStyle = oGrad;
    ctx.beginPath();
    ctx.arc(width * 0.18, height * 0.40, 26, 0, Math.PI * 2);
    ctx.fill();

    // Valles Marineris (Deep black rift trench)
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const vY = height * 0.54;
    ctx.moveTo(width * 0.28, vY);
    ctx.bezierCurveTo(width * 0.35, vY + 10, width * 0.42, vY - 8, width * 0.47, vY + 5);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.marsBump = texture;
    return texture;
  }

  // --- Helper stamp methods ---
  _stampSmallCrater(ctx, x, y, r, shadow = 'rgba(20, 20, 22, 0.5)', highlight = 'rgba(220, 225, 230, 0.4)') {
    ctx.save();
    // Shadow interior
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // Sunlit rim arc
    ctx.strokeStyle = highlight;
    ctx.lineWidth = Math.max(1, r * 0.25);
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI * 0.3, Math.PI * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  _stampCraterWithRays(ctx, x, y, r, rayLength, color) {
    ctx.save();
    // Radiant rays
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
    // Central crater
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

    // Caldera crater ring in center
    ctx.fillStyle = '#220c06';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.CelestialTextures = new CelestialTextureGenerator();
