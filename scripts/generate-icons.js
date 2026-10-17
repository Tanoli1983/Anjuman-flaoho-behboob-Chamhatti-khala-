import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#065f46" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />

  <!-- Outer Ring -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="url(#goldGrad)" stroke-width="8" opacity="0.85" />
  <circle cx="256" cy="256" r="202" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,6" opacity="0.6" />

  <!-- Inner Badge Circle -->
  <circle cx="256" cy="256" r="170" fill="#064e3b" stroke="url(#goldGrad)" stroke-width="5" />

  <!-- Crescent & Star -->
  <path d="M 270 145 A 75 75 0 1 0 345 220 A 62 62 0 1 1 270 145 Z" fill="url(#goldGrad)" />
  <polygon points="325,160 332,175 348,175 335,185 340,200 327,190 315,200 320,185 307,175 323,175" fill="url(#goldGrad)" />

  <!-- Text / Monogram -->
  <text x="256" y="268" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">AFB</text>
  <text x="256" y="306" font-family="'Noto Sans Arabic', system-ui, sans-serif" font-size="24" font-weight="bold" fill="#fef08a" text-anchor="middle">انجمن چمہٹی کھلابٹ</text>
  <text x="256" y="334" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#a7f3d0" text-anchor="middle" letter-spacing="3">KARACHI</text>
  <text x="256" y="358" font-family="monospace, sans-serif" font-size="11" font-weight="bold" fill="#e2e8f0" text-anchor="middle">REG: K/2018 DSW(4347)</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
console.log('Created public/icon.svg');

// 2. Generate PNG images using PNGJS
function createPngIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = isMaskable ? size * 0.38 : size * 0.44;
  const innerRadius = radius * 0.78;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = 4, g = 95, b = 70, a = 255; // #045f46
      if (y < size * 0.4) {
        r = 6; g = 78; b = 59; // slightly darker emerald at top
      }

      if (!isMaskable) {
        // Corner roundedness
        const cornerRadius = size * 0.2;
        const inCornerX = x < cornerRadius || x > size - cornerRadius;
        const inCornerY = y < cornerRadius || y > size - cornerRadius;
        if (inCornerX && inCornerY) {
          const cx = x < cornerRadius ? cornerRadius : size - cornerRadius;
          const cy = y < cornerRadius ? cornerRadius : size - cornerRadius;
          const cDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (cDist > cornerRadius) {
            a = 0;
          }
        }
      }

      if (a > 0) {
        // Outer decorative ring
        if (Math.abs(dist - radius) < size * 0.016) {
          // Gold ring
          r = 245; g = 158; b = 11;
        } else if (dist < radius && dist > innerRadius) {
          // Mid zone
          r = 6; g = 95; b = 70;
        } else if (Math.abs(dist - innerRadius) < size * 0.012) {
          // Inner gold ring
          r = 251; g = 191; b = 36;
        } else if (dist < innerRadius) {
          // Center core
          r = 6; g = 78; b = 59;

          // Simple decorative crescent shape in upper half
          const moonDx = dx - size * 0.02;
          const moonDy = dy + size * 0.12;
          const moonDist1 = Math.sqrt(moonDx * moonDx + moonDy * moonDy);
          const moonDist2 = Math.sqrt((moonDx - size * 0.04) ** 2 + (moonDy - size * 0.02) ** 2);
          if (moonDist1 < size * 0.14 && moonDist2 > size * 0.11) {
            r = 253; g = 224; b = 71; // gold crescent
          }

          // Central badge text region
          if (Math.abs(dy) < size * 0.05 && Math.abs(dx) < size * 0.22) {
            // "AFB" bar
            r = 255; g = 255; b = 255;
          }
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngIcon(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPngIcon(64, false));

console.log('Successfully generated all PWA icons in /public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.ico');
