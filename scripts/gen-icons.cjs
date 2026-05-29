// Generates pwa-192x192.png and pwa-512x512.png using only Node.js built-ins
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf  = Buffer.allocUnsafe(4);  lenBuf.writeUInt32BE(data.length);
  const crcBuf  = Buffer.allocUnsafe(4);  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── PNG builder ────────────────────────────────────────────────────────────
function buildPNG(size, drawPixel) {
  // IHDR  (RGBA, 8-bit)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA

  // Raw pixel rows  (filter byte 0 + 4 bytes/pixel)
  const rowLen = 1 + size * 4;
  const raw    = Buffer.alloc(size * rowLen);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0;                    // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawPixel(x, y, size);
      const off = y * rowLen + 1 + x * 4;
      raw[off]     = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Icon design ────────────────────────────────────────────────────────────
// Smooth anti-aliased distance helper
function sdf(px, py, cx, cy, rx, ry, cr) {
  const qx = Math.abs(px - cx) - (rx - cr);
  const qy = Math.abs(py - cy) - (ry - cr);
  return Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) - cr;
}

function drawWalletIcon(x, y, S) {
  const u = S / 100; // 1 unit = 1% of icon size
  const cx = S / 2, cy = S / 2;

  // ── background rounded rectangle ─────────────────────────────────────
  const bgDist = sdf(x, y, cx, cy, S * 0.46, S * 0.46, S * 0.18);
  const bgAlpha = Math.min(255, Math.max(0, Math.round((0.5 - bgDist) * 3 + 255)));
  if (bgAlpha === 0) return [0, 0, 0, 0];

  // Background gradient: #1e40af → #1e3a8a top-to-bottom
  const t = y / S;
  const bgR = Math.round(30  + (30  - 30)  * t);   // stays 30
  const bgG = Math.round(64  + (58  - 64)  * t);
  const bgB = Math.round(175 + (138 - 175) * t);

  // ── wallet body  (white rounded rect, lower-center) ──────────────────
  const wBx = cx, wBy = cy + 5 * u;
  const wBrx = 30 * u, wBry = 20 * u, wBcr = 5 * u;
  const bodyDist = sdf(x, y, wBx, wBy, wBrx, wBry, wBcr);
  const bodyA = Math.min(1, Math.max(0, (1 - bodyDist) * 2));

  // ── wallet flap  (slightly smaller, upper portion) ───────────────────
  const wFx = cx - 4 * u, wFy = cy - 13 * u;
  const wFrx = 22 * u, wFry = 12 * u, wFcr = 4 * u;
  const flapDist = sdf(x, y, wFx, wFy, wFrx, wFry, wFcr);
  const flapA = Math.min(1, Math.max(0, (1 - flapDist) * 2));

  // ── coin circle ──────────────────────────────────────────────────────
  const coinDist = Math.sqrt((x - (cx + 16 * u)) ** 2 + (y - (cy + 5 * u)) ** 2) - 7 * u;
  const coinA = Math.min(1, Math.max(0, (1 - coinDist) * 2));

  // ── compose ──────────────────────────────────────────────────────────
  // Coin hole: subtract from body
  const isCoinHole = coinA > 0.5 && bodyA > 0.5;

  let fgA = 0;
  if (!isCoinHole) {
    fgA = Math.max(bodyA, flapA);
  }

  // Blend white foreground over background
  const fa = fgA * 0.95;
  const r = Math.round(bgR + (255 - bgR) * fa);
  const g = Math.round(bgG + (255 - bgG) * fa);
  const b = Math.round(bgB + (255 - bgB) * fa);

  return [r, g, b, bgAlpha];
}

// ── Generate both sizes ────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public');

for (const size of [192, 512]) {
  const buf = buildPNG(size, drawWalletIcon);
  const out = path.join(outDir, `pwa-${size}x${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`✓ ${out}  (${(buf.length / 1024).toFixed(1)} KB)`);
}
