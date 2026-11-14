/**
 * Procedural & Dynamic Texture Generator for Moon, Mars, Venus, Titan & Spacecraft PBR Foil
 * Guarantees 100% offline compatibility, zero CORS issues, and realistic topography.
 */

class CelestialTextureGenerator {
  constructor() {
    this.cache = {};
  }

  // Pseudo-random noise helper
  static createNoise(width, height) {
    const size = width * height;
    const noise = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      noise[i] = Math.random();
    }
    return noise;
  }

  /**
   * Generates a realistic crinkled Kapton Gold Foil bump/normal map for 3D spacecraft models
   */
  generateKaptonFoilBump(width = 512, height = 512) {
    if (this.cache.kaptonBump) return this.cache.kaptonBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Crinkled multi-directional Mylar/Kapton thermal blanket folds
    for (let i = 0; i < 420; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const len = 15 + Math.random() * 55;
      const ang = Math.random() * Math.PI * 2;
      const x2 = x1 + Math.cos(ang) * len;
      const y2 = y1 + Math.sin(ang) * len;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.5, 'rgba(30, 30, 30, 0.35)');
      grad.addColorStop(1, 'rgba(220, 220, 220, 0.25)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Subtle quilted thermal blanket grid seams
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.45)';
    ctx.lineWidth = 1.5;
    const step = 64;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    this.cache.kaptonBump = texture;
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

    // Individual photovoltaic cells
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

    // Gold busbars
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

  /**
   * Generates a high-detail procedural Moon surface texture
   */
  generateMoonTexture(width = 2048, height = 1024) {
    if (this.cache.moonTexture) return this.cache.moonTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#53565b');
    baseGrad.addColorStop(0.5, '#696c72');
    baseGrad.addColorStop(1, '#53565b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

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

    const maria = [
      { x: width * 0.56, y: height * 0.48, rx: width * 0.12, ry: height * 0.16, opacity: 0.65 },
      { x: width * 0.42, y: height * 0.38, rx: width * 0.08, ry: height * 0.12, opacity: 0.70 },
      { x: width * 0.35, y: height * 0.42, rx: width * 0.05, ry: height * 0.07, opacity: 0.60 },
      { x: width * 0.32, y: height * 0.49, rx: width * 0.06, ry: height * 0.07, opacity: 0.68 },
      { x: width * 0.23, y: height * 0.45, rx: width * 0.04, ry: height * 0.05, opacity: 0.72 },
      { x: width * 0.39, y: height * 0.62, rx: width * 0.07, ry: height * 0.09, opacity: 0.58 },
      { x: width * 0.48, y: height * 0.55, rx: width * 0.06, ry: height * 0.08, opacity: 0.60 },
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

    this._stampCraterWithRays(ctx, width * 0.46, height * 0.73, 18, 120, '#d8dcde');
    this._stampCraterWithRays(ctx, width * 0.44, height * 0.44, 22, 90, '#c8cdd0');
    this._stampCraterWithRays(ctx, width * 0.52, height * 0.46, 14, 60, '#bcc0c4');

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

  generateMoonBump(width = 1024, height = 512) {
    if (this.cache.moonBump) return this.cache.moonBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

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

    for (let i = 0; i < 300; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 8;
      ctx.strokeStyle = 'rgba(230, 230, 230, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
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
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const n = (Math.random() - 0.5) * 30;
        data[idx] = Math.min(255, Math.max(0, data[idx] + n));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + n * 0.8));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + n * 0.5));
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
      ctx.scale(f.rx / Math.max(f.rx, f.ry), mScale(f.ry, f.rx));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(f.rx, f.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    function mScale(a, b) {
      return a / Math.max(a, b);
    }

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

  generateMarsBump(width = 1024, height = 512) {
    if (this.cache.marsBump) return this.cache.marsBump;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    const oGrad = ctx.createRadialGradient(width * 0.18, height * 0.40, 3, width * 0.18, height * 0.40, 26);
    oGrad.addColorStop(0, '#ffffff');
    oGrad.addColorStop(0.3, '#d8d8d8');
    oGrad.addColorStop(1, '#808080');
    ctx.fillStyle = oGrad;
    ctx.beginPath();
    ctx.arc(width * 0.18, height * 0.40, 26, 0, Math.PI * 2);
    ctx.fill();

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

  /**
   * Generates a Magellan Radar & Sulfuric Acid Cloud Texture for VENUS
   * Combines golden-amber volcanic highlands (Ishtar Terra, Aphrodite Terra, Phoebe Regio)
   * with super-rotating sulfur cloud bands.
   */
  generateVenusTexture(width = 2048, height = 1024) {
    if (this.cache.venusTexture) return this.cache.venusTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Base Venusian amber-ochre basalt & sulfur gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#9a5b13');
    baseGrad.addColorStop(0.25, '#c87d20');
    baseGrad.addColorStop(0.5, '#e09b35');
    baseGrad.addColorStop(0.75, '#c2741b');
    baseGrad.addColorStop(1, '#8c4f10');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Magellan radar highland continents (Aphrodite Terra, Ishtar Terra, Beta & Phoebe Regio)
    const continents = [
      { x: width * 0.52, y: height * 0.55, rx: width * 0.24, ry: height * 0.11, col: 'rgba(255, 210, 110, 0.55)' }, // Aphrodite Terra
      { x: width * 0.35, y: height * 0.22, rx: width * 0.16, ry: height * 0.09, col: 'rgba(255, 225, 130, 0.65)' }, // Ishtar Terra / Maxwell Montes
      { x: width * 0.78, y: height * 0.42, rx: width * 0.10, ry: height * 0.14, col: 'rgba(245, 190, 90, 0.50)' },  // Beta & Phoebe Regio (Venera 13)
      { x: width * 0.22, y: height * 0.62, rx: width * 0.13, ry: height * 0.12, col: 'rgba(110, 50, 10, 0.55)' },   // Lavinia Planitia basin
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

    // 3. Swirling V-shaped sulfuric acid cloud chevron bands
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

    // 4. Volcanic coronae & lava domes (Maat Mons, Theia Mons)
    for (let i = 0; i < 120; i++) {
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

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Maxwell Montes & volcanic rifts
    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 3 + Math.random() * 16;
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
      g.addColorStop(0, '#dcdcdc');
      g.addColorStop(0.5, '#969696');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.venusBump = texture;
    return texture;
  }

  /**
   * Generates a Cassini VIMS / Radar Texture for TITAN & Outer System Worlds
   * Features golden organic tholin haze, dark hydrocarbon seas (Kraken Mare, Ligeia Mare),
   * Shangri-La dark equatorial sand dunes, and bright Xanadu water-ice continent.
   */
  generateTitanTexture(width = 2048, height = 1024) {
    if (this.cache.titanTexture) return this.cache.titanTexture;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Base Titan orange-gold nitrogen/methane tholin surface
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#805b36');
    baseGrad.addColorStop(0.25, '#b88648');
    baseGrad.addColorStop(0.5, '#d49e54');
    baseGrad.addColorStop(0.75, '#b37f40');
    baseGrad.addColorStop(1, '#755230');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Dark equatorial hydrocarbon dune fields (Shangri-La, Fensal, Aztlan)
    const dunes = [
      { x: width * 0.46, y: height * 0.54, rx: width * 0.18, ry: height * 0.09, col: 'rgba(48, 32, 18, 0.72)' }, // Shangri-La (Huygens Landing)
      { x: width * 0.72, y: height * 0.48, rx: width * 0.15, ry: height * 0.08, col: 'rgba(52, 35, 20, 0.65)' }, // Fensal / Belet
      { x: width * 0.22, y: height * 0.56, rx: width * 0.14, ry: height * 0.07, col: 'rgba(45, 30, 16, 0.68)' }, // Senkyo
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

    // 3. Bright Xanadu & Adiri water-ice highlands
    const highlands = [
      { x: width * 0.32, y: height * 0.54, rx: width * 0.12, ry: height * 0.08 }, // Xanadu
      { x: width * 0.42, y: height * 0.53, rx: width * 0.06, ry: height * 0.05 }, // Adiri coast
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

    // 4. North Polar Liquid Methane/Ethane Seas (Kraken Mare & Ligeia Mare)
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

    // 5. Fine organic haze grain & river channels
    for (let i = 0; i < 160; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 7;
      this._stampSmallCrater(ctx, cx, cy, r, 'rgba(50, 35, 18, 0.35)', 'rgba(255, 220, 160, 0.3)');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.titanTexture = texture;
    return texture;
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
}

window.CelestialTextures = new CelestialTextureGenerator();
