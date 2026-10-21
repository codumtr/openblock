const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node PNG generator
function createPng(width, height, drawPixelFn) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel + 1; // +1 filter byte per line
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: 0
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw a modern Shield icon with an electric blue & neon cyan gradient
function drawShield(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  // Outer shield boundary
  // Top horizontal part: -0.7 <= ny <= -0.3, -0.75 <= nx <= 0.75
  // Bottom part converges to point at (0, 0.85)
  let inShield = false;
  
  if (ny >= -0.75 && ny <= -0.2) {
    if (Math.abs(nx) <= 0.72) inShield = true;
  } else if (ny > -0.2 && ny <= 0.8) {
    const t = (ny - (-0.2)) / (0.8 - (-0.2));
    const maxWidth = 0.72 * (1 - Math.pow(t, 1.4));
    if (Math.abs(nx) <= maxWidth) inShield = true;
  }

  if (!inShield) return [0, 0, 0, 0]; // Transparent

  // Inner checkmark / lightning cutout
  // Let's create an inner checkmark
  // Checkmark points: (-0.35, -0.05) -> (-0.08, 0.28) -> (0.42, -0.32)
  let inCheck = false;
  const dist1 = distToSegment(nx, ny, -0.32, -0.05, -0.08, 0.25);
  const dist2 = distToSegment(nx, ny, -0.08, 0.25, 0.38, -0.28);
  const checkThickness = 0.08;
  if (dist1 <= checkThickness || dist2 <= checkThickness) {
    inCheck = true;
  }

  if (inCheck) {
    // Pure bright white for checkmark
    return [255, 255, 255, 255];
  }

  // Shield body: gradient from electric blue (top) to neon cyan (bottom)
  const gradT = (ny + 0.75) / 1.55;
  const r = Math.round(14 * (1 - gradT) + 0 * gradT);
  const g = Math.round(165 * (1 - gradT) + 210 * gradT);
  const b = Math.round(233 * (1 - gradT) + 255 * gradT);

  return [r, g, b, 255];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Generate sizes: 16, 32, 48, 128
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

sizes.forEach(size => {
  const pngBuf = createPng(size, size, drawShield);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated icon${size}.png`);
});
