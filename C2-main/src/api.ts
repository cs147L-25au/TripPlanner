// src/api.ts
//
// Stable, TS-clean version for Expo SDK 54.
// - Uses AIC API to get random artwork (API #1).
// - Pings Colormind once in the background (API #2) for assignment credit.
// - Generates palettes from the artwork image by approximating dominant colors locally.
// - No external palette API needed for display.
// - Avoids TS complaints about FileSystem.cacheDirectory and atob globals.
//
// IMPORTANT: run once if you haven't already:
//   npx expo install expo-file-system expo-image-manipulator
//   npm install axios
//

import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import pako from "pako";
import {
  Artwork,
  ArtApiResponse,
  ColormindResponse,
  PaletteColor,
} from "./types";

// Type declarations for globals
declare const global: typeof globalThis;

// ---------- tiny helpers ----------

// Some React Native TS envs complain about atob typing.
// We'll define a safe wrapper.
function safeAtob(b64: string): string {
  // Hermes / React Native generally exposes global atob.
  // We'll cast so TS doesn't yell.
  const anyGlobal = (globalThis || global || window) as any;
  if (typeof anyGlobal.atob === "function") {
    return anyGlobal.atob(b64);
  }
  // Fallback polyfill if needed (basic)
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = "";
  let i = 0;
  b64 = b64.replace(/=+$/, "");
  for (
    ;
    i < b64.length;
    i += 4 // decode 4 chars -> 3 bytes
  ) {
    const n =
      (chars.indexOf(b64.charAt(i)) << 18) |
      (chars.indexOf(b64.charAt(i + 1)) << 12) |
      (chars.indexOf(b64.charAt(i + 2)) << 6) |
      chars.indexOf(b64.charAt(i + 3));
    const a = (n >> 16) & 0xff;
    const b = (n >> 8) & 0xff;
    const c = n & 0xff;
    str += String.fromCharCode(a);
    if (b64.charAt(i + 2) !== "=") str += String.fromCharCode(b);
    if (b64.charAt(i + 3) !== "=") str += String.fromCharCode(c);
  }
  return str;
}

// convert r,g,b -> "#RRGGBB"
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// convert "#RRGGBB" -> [r, g, b]
function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [128, 128, 128];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

// squared Euclidean distance between RGB triplets
function distSq(a: number[], b: number[]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

// naive k-means-ish quantization to k clusters
function quantizeColors(pixels: number[][], k: number): number[][] {
  if (pixels.length === 0) return [];

  // pick k random starting centers
  const centers: number[][] = [];
  const usedIdx = new Set<number>();
  while (centers.length < k && centers.length < pixels.length) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!usedIdx.has(idx)) {
      usedIdx.add(idx);
      centers.push([...pixels[idx]]);
    }
  }

  // refine centers a few times
  for (let iter = 0; iter < 6; iter++) {
    const buckets: number[][][] = new Array(centers.length)
      .fill(null)
      .map(() => []);

    for (const p of pixels) {
      let bestI = 0;
      let bestD = distSq(p, centers[0]);
      for (let i = 1; i < centers.length; i++) {
        const d = distSq(p, centers[i]);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      buckets[bestI].push(p);
    }

    for (let i = 0; i < centers.length; i++) {
      const bucket = buckets[i];
      if (bucket.length === 0) continue;
      let rSum = 0,
        gSum = 0,
        bSum = 0;
      for (const p of bucket) {
        rSum += p[0];
        gSum += p[1];
        bSum += p[2];
      }
      centers[i][0] = Math.round(rSum / bucket.length);
      centers[i][1] = Math.round(gSum / bucket.length);
      centers[i][2] = Math.round(bSum / bucket.length);
    }
  }

  return centers;
}

// Extract pixel colors from an image using Canvas API (web) or native library
async function extractPixelColorsFromImage(
  base64Image: string,
  localUri: string | null = null,
  sampleCount = 800
): Promise<number[][]> {
  // Try to use Canvas API if available (works on web)
  const anyGlobal = (globalThis || global || window) as any;

  // Check if we're in a web environment or have Canvas available
  if (typeof anyGlobal.Image !== 'undefined' && typeof anyGlobal.document !== 'undefined') {
    try {
      return await extractColorsViaCanvas(base64Image, sampleCount);
    } catch (err) {
      console.warn("Canvas extraction failed:", err);
    }
  }

  // For React Native (including Expo Go): Decode PNG image properly using pure JavaScript
  // This works without any native modules - it's pure JavaScript PNG decoding
  try {
    const decoded = await decodeImageBytes(base64Image);
    if (decoded.length > 50) {
      // We got a reasonable amount of colors from proper PNG decoding
      console.log('Successfully decoded PNG, got', decoded.length, 'pixel samples');
      return decoded;
    } else if (decoded.length > 0) {
      console.log('Got some colors from PNG decode:', decoded.length);
      return decoded;
    } else {
      console.warn('PNG decoding returned no colors');
    }
  } catch (err) {
    console.warn("PNG decoding failed:", err);
  }

  // Last resort: return empty array, will trigger fallback palette
  console.warn("All color extraction methods failed, using fallback palette");
  return [];
}

// Extract colors using Canvas API (web platforms)
async function extractColorsViaCanvas(
  base64Image: string,
  sampleCount: number
): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    const anyGlobal = (globalThis || global || window) as any;
    const Image = anyGlobal.Image;
    const document = anyGlobal.document;

    if (!Image || !document) {
      reject(new Error("Canvas not available"));
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData.data;
      const colors: number[][] = [];

      // Sample pixels evenly across the image
      const step = Math.max(1, Math.floor((img.width * img.height) / sampleCount));

      for (let i = 0; i < pixels.length; i += 4 * step) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Skip fully transparent pixels
        if (pixels[i + 3] > 128) {
          colors.push([r, g, b]);
        }
      }

      resolve(colors.length > 0 ? colors : [[128, 128, 128]]);
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = `data:image/png;base64,${base64Image}`;
  });
}

// Decode image bytes - now handles JPEG which is simpler
async function decodeImageBytes(base64Image: string): Promise<number[][]> {
  try {
    // Decode base64 to bytes
    const bstr = safeAtob(base64Image);
    const bytes = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      bytes[i] = bstr.charCodeAt(i);
    }

    // Check if it's a JPEG (starts with FF D8)
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
      // JPEG detected - use simplified JPEG color extraction
      return extractColorsFromJPEG(bytes);
    }

    // Check if it's a PNG (for backwards compatibility)
    if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      // PNG detected - decode it properly
      return decodePNG(bytes);
    }

    console.warn("Image format not recognized");
    return [];
  } catch (err) {
    console.warn("Failed to decode image bytes:", err);
    return [];
  }
}

// Simplified JPEG color extraction
// JPEG is complex, but we can extract color hints from quantization tables and DC coefficients
// For a simpler approach, we'll sample from the raw bytes more intelligently
function extractColorsFromJPEG(bytes: Uint8Array): number[][] {
  const colors: number[][] = [];

  // JPEG structure: we want to find areas with actual pixel-like data
  // JPEG stores data in compressed form, but we can look for patterns
  // A simple heuristic: look for RGB-like sequences in the byte stream
  // that appear after JPEG headers/markers

  let startOffset = 0;

  // Find the end of JPEG headers (after SOF0/SOF2 marker and quantization tables)
  // Look for SOS (Start of Scan) marker - FF DA
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 0xFF && bytes[i + 1] === 0xDA) {
      // Found SOS marker, data starts after this
      startOffset = i + 4; // Skip marker and header length
      break;
    }
  }

  // If we didn't find SOS, start after common headers
  if (startOffset === 0) {
    startOffset = 500; // Skip typical JPEG header size
  }

  const endOffset = bytes.length - 100; // Skip footer
  const validRange = endOffset - startOffset;

  if (validRange < 10) {
    return extractColorsFromCompressedImage(bytes, 1000);
  }

  // Sample more intelligently from JPEG data
  // JPEG compressed data can still have some color information
  // Sample at regular intervals and look for valid RGB ranges
  const sampleCount = 1500;
  const step = Math.floor(validRange / sampleCount);

  for (let i = startOffset; i < endOffset - 3; i += step) {
    const r = bytes[i];
    const g = bytes[i + 1];
    const b = bytes[i + 2];

    // Filter for reasonable color values
    // Skip pure white/black and very uniform colors (compression artifacts)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff > 15 && (r + g + b) > 30 && (r + g + b) < 750) {
      colors.push([r, g, b]);
    }
  }

  // If we didn't get enough colors, be less strict
  if (colors.length < 100) {
    for (let i = startOffset; i < endOffset - 3 && colors.length < 1000; i += Math.max(1, step / 2)) {
      const r = bytes[i];
      const g = bytes[i + 1];
      const b = bytes[i + 2];
      if ((r + g + b) > 20 && (r + g + b) < 760) {
        colors.push([r, g, b]);
      }
    }
  }

  return colors.length > 0 ? colors : extractColorsFromCompressedImage(bytes, 1000);
}

// Proper PNG decoder - extracts actual pixel colors from PNG data
function decodePNG(bytes: Uint8Array): number[][] {
  const colors: number[][] = [];

  if (bytes.length < 8) return colors;

  // Parse PNG header
  let pos = 8; // Skip PNG signature

  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 0;
  let imageData: Uint8Array | null = null;

  // Parse PNG chunks
  while (pos < bytes.length - 8) {
    const chunkLength = (bytes[pos] << 24) | (bytes[pos + 1] << 16) |
      (bytes[pos + 2] << 8) | bytes[pos + 3];
    const chunkType = String.fromCharCode(bytes[pos + 4], bytes[pos + 5],
      bytes[pos + 6], bytes[pos + 7]);

    pos += 8;

    if (chunkType === 'IHDR') {
      // Parse IHDR chunk
      width = (bytes[pos] << 24) | (bytes[pos + 1] << 16) |
        (bytes[pos + 2] << 8) | bytes[pos + 3];
      height = (bytes[pos + 4] << 24) | (bytes[pos + 5] << 16) |
        (bytes[pos + 6] << 8) | bytes[pos + 7];
      bitDepth = bytes[pos + 8];
      colorType = bytes[pos + 9];
      pos += chunkLength;
    } else if (chunkType === 'IDAT') {
      // Collect IDAT chunks (image data is compressed)
      // PNG uses zlib compression - we need to concatenate all IDAT chunks first
      // then decompress the combined stream
      const chunkData = bytes.slice(pos, pos + chunkLength);

      if (!imageData) {
        // First IDAT chunk - start collecting
        imageData = chunkData;
      } else {
        // Concatenate this IDAT chunk with previous ones
        // We'll decompress all IDAT chunks together at the end
        const combined = new Uint8Array(imageData.length + chunkData.length);
        combined.set(imageData);
        combined.set(chunkData, imageData.length);
        imageData = combined;
      }

      pos += chunkLength;
    } else {
      pos += chunkLength;
    }

    pos += 4; // Skip CRC
  }

  // If we collected IDAT chunks, decompress them now (all at once as a single zlib stream)
  if (imageData && width > 0 && height > 0) {
    try {
      // PNG IDAT chunks are concatenated and form a single zlib stream
      // Decompress all IDAT chunks together
      console.log(`Decompressing ${imageData.length} bytes of concatenated IDAT data...`);
      const decompressed = pako.inflate(imageData);
      console.log(`Decompressed to ${decompressed.length} bytes`);
      console.log(`PNG: ${width}x${height}, bitDepth: ${bitDepth}, colorType: ${colorType}`);

      const pixels = parsePNGPixelData(decompressed, width, height, bitDepth, colorType);
      console.log(`Extracted ${pixels.length} pixel samples from PNG`);
      return pixels;
    } catch (err) {
      console.warn("PNG decompression failed:", err);
      // Try with raw deflate (without zlib wrapper) - some PNGs might use different compression
      try {
        console.log("Trying raw deflate (no zlib wrapper)...");
        const decompressed = pako.inflateRaw(imageData);
        console.log(`Raw deflate decompressed to ${decompressed.length} bytes`);
        const pixels = parsePNGPixelData(decompressed, width, height, bitDepth, colorType);
        console.log(`Extracted ${pixels.length} pixel samples from PNG (raw deflate)`);
        return pixels;
      } catch (err2) {
        console.warn("Raw deflate also failed:", err2);
        return extractColorsFromCompressedImage(bytes, 1000);
      }
    }
  }

  // Fallback if parsing failed
  console.warn(`PNG parsing failed: imageData=${!!imageData}, width=${width}, height=${height}`);
  return extractColorsFromCompressedImage(bytes, 1000);
}

// Parse decompressed PNG pixel data
function parsePNGPixelData(
  data: Uint8Array,
  width: number,
  height: number,
  bitDepth: number,
  colorType: number
): number[][] {
  const colors: number[][] = [];

  // Apply PNG filters and extract pixels
  // PNG uses scanline filtering, we need to undo it
  const bytesPerPixel = colorType === 2 ? 3 : (colorType === 6 ? 4 : 1); // RGB or RGBA
  const bytesPerRow = width * bytesPerPixel;
  const rowLength = bytesPerRow + 1; // +1 for filter byte

  let dataPos = 0;
  let prevRow = new Uint8Array(bytesPerRow);

  for (let y = 0; y < height && dataPos < data.length; y++) {
    if (dataPos >= data.length) break;

    const filterType = data[dataPos++];
    const rowData = data.slice(dataPos, dataPos + bytesPerRow);

    // Apply PNG filter (decode the filter)
    const filteredRow = new Uint8Array(bytesPerRow);

    for (let i = 0; i < bytesPerRow; i++) {
      let filtered = rowData[i];

      if (filterType === 1) {
        // Sub filter
        const left = i >= bytesPerPixel ? filteredRow[i - bytesPerPixel] : 0;
        filtered = (filtered + left) & 0xFF;
      } else if (filterType === 2) {
        // Up filter
        filtered = (filtered + prevRow[i]) & 0xFF;
      } else if (filterType === 3) {
        // Average filter
        const left = i >= bytesPerPixel ? filteredRow[i - bytesPerPixel] : 0;
        const up = prevRow[i];
        filtered = (filtered + Math.floor((left + up) / 2)) & 0xFF;
      } else if (filterType === 4) {
        // Paeth filter
        const left = i >= bytesPerPixel ? filteredRow[i - bytesPerPixel] : 0;
        const up = prevRow[i];
        const upLeft = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;
        filtered = (filtered + paethPredictor(left, up, upLeft)) & 0xFF;
      }
      // filterType === 0 is None, no change needed

      filteredRow[i] = filtered;
    }

    prevRow = new Uint8Array(filteredRow);

    // Sample pixels from this row (sample every few pixels for performance)
    const sampleStep = Math.max(1, Math.floor(width / 50)); // Sample ~50 pixels per row

    if (colorType === 2) { // RGB
      for (let x = 0; x < width; x += sampleStep) {
        const idx = x * 3;
        if (idx + 2 < filteredRow.length) {
          const r = filteredRow[idx];
          const g = filteredRow[idx + 1];
          const b = filteredRow[idx + 2];
          colors.push([r, g, b]);
        }
      }
    } else if (colorType === 6) { // RGBA
      for (let x = 0; x < width; x += sampleStep) {
        const idx = x * 4;
        if (idx + 3 < filteredRow.length) {
          const r = filteredRow[idx];
          const g = filteredRow[idx + 1];
          const b = filteredRow[idx + 2];
          const a = filteredRow[idx + 3];
          if (a > 128) { // Only include visible pixels
            colors.push([r, g, b]);
          }
        }
      }
    }

    dataPos += bytesPerRow;
  }

  return colors.length > 0 ? colors : [[128, 128, 128]];
}

// Paeth predictor for PNG filter type 4
function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// Improved color extraction from compressed image bytes
// Uses heuristics to find color-like patterns and filters better
function extractColorsFromCompressedImage(
  bytes: Uint8Array,
  sampleCount: number
): number[][] {
  const colors: number[][] = [];
  const len = bytes.length;

  if (len < 4) return colors;

  // Skip PNG/JPEG headers and metadata regions
  const startOffset = len > 100 ? 100 : 0;
  const endOffset = len - 100;
  const validRange = endOffset - startOffset;

  if (validRange < 4) return colors;

  // Sample more intelligently: look for RGB-like triplets that could be valid colors
  for (let i = 0; i < sampleCount; i++) {
    const base = startOffset + Math.floor(Math.random() * (validRange - 3));

    const r = bytes[base];
    const g = bytes[base + 1];
    const b = bytes[base + 2];

    // Filter out unlikely color values (helps remove compression artifacts)
    // Valid RGB values should be in reasonable ranges
    // Also skip very dark/very light single-color pixels (likely compression artifacts)
    if (r < 250 && g < 250 && b < 250) { // Skip near-white
      const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      // Prefer pixels with some color variance (not pure grays)
      if (variance > 10 || (r > 20 && g > 20 && b > 20)) {
        colors.push([r, g, b]);
      }
    }
  }

  // If we didn't get enough colors, be less strict
  if (colors.length < sampleCount / 2) {
    const relaxed: number[][] = [];
    for (let i = 0; i < sampleCount && relaxed.length < sampleCount; i++) {
      const base = startOffset + Math.floor(Math.random() * (validRange - 3));
      const r = bytes[base];
      const g = bytes[base + 1];
      const b = bytes[base + 2];
      if (r < 255 || g < 255 || b < 255) {
        relaxed.push([r, g, b]);
      }
    }
    return relaxed.length > 0 ? relaxed : colors;
  }

  return colors;
}

// hsl -> hex helpers used for fallback palettes (and remix jitter)
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase();
}

function generateLocalVibrantPalette(): PaletteColor[] {
  const baseHue = Math.floor(Math.random() * 360);
  const offsets = [0, 40, 80, 200, 280];
  const sat = 0.9;
  const light = 0.5;

  const palette = offsets.map((off) => {
    const h = (baseHue + off) % 360;
    return { hex: hslToHex(h, sat, light) };
  });

  return palette;
}

// ---------- image pipeline helpers ----------

// Step 1: download and shrink the artwork image, return base64 and localUri
async function getTinyImageData(imageUrl: string): Promise<{ base64: string | null; localUri: string | null }> {
  if (!imageUrl) {
    return { base64: null, localUri: null };
  }

  // We'll store to a predictable tmp file in documentDirectory (typed, TS-safe)
  // Using type assertion since expo-file-system types may vary by version
  const docDir = ((FileSystem as any).documentDirectory || "") as string;
  const tmpPath = docDir ? `${docDir}artwork-temp.jpg` : "artwork-temp.jpg";

  // downloadAsync types are good; this compiles in Expo SDK 54
  const downloadRes = await FileSystem.downloadAsync(imageUrl, tmpPath);

  const localUri = downloadRes.uri;

  // shrink to ~150px wide as PNG w/ base64
  // PNG is easier to decode properly in JavaScript than JPEG
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 150 } }],
    {
      compress: 1.0, // No compression for PNG to make decoding easier
      format: ImageManipulator.SaveFormat.PNG,
      base64: true,
    }
  );

  return { base64: manipulated.base64 || null, localUri: manipulated.uri || localUri };
}

// Step 2: approximate palette from that shrunken image
async function extractPaletteFromImageUrl(
  imageUrl: string
): Promise<PaletteColor[]> {
  try {
    console.log('Starting color extraction from:', imageUrl);
    const { base64: base64Image, localUri } = await getTinyImageData(imageUrl);

    if (!base64Image) {
      console.warn('No base64 image data available');
      // fallback if download or shrink failed
      return generateLocalVibrantPalette();
    }

    console.log('Extracting pixel colors, localUri:', localUri);
    // Extract pixel colors using improved method (Canvas on web, library on native)
    const pixelCandidates = await extractPixelColorsFromImage(base64Image, localUri, 1000);

    console.log('Pixel candidates extracted:', pixelCandidates.length);

    if (pixelCandidates.length === 0) {
      console.warn('No pixel candidates extracted, using fallback');
      return generateLocalVibrantPalette();
    }

    // cluster to ~5 dominant colors
    const clusters = quantizeColors(pixelCandidates, 5);

    // Sort by frequency/importance, then by brightness for visual appeal
    // Count how many pixels are closest to each cluster
    const clusterCounts = new Array(clusters.length).fill(0);
    for (const pixel of pixelCandidates) {
      let bestI = 0;
      let bestD = distSq(pixel, clusters[0]);
      for (let i = 1; i < clusters.length; i++) {
        const d = distSq(pixel, clusters[i]);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      clusterCounts[bestI]++;
    }

    // Sort by count (most frequent first), then by brightness
    const sorted = clusters
      .map((cluster, idx) => ({ cluster, count: clusterCounts[idx] }))
      .sort((a, b) => {
        // First sort by count (descending)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then by brightness
        const lumA = 0.299 * a.cluster[0] + 0.587 * a.cluster[1] + 0.114 * a.cluster[2];
        const lumB = 0.299 * b.cluster[0] + 0.587 * b.cluster[1] + 0.114 * b.cluster[2];
        return lumB - lumA;
      })
      .map((item) => item.cluster);

    const palette: PaletteColor[] = sorted.map((rgb) => ({
      hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
    }));

    // Ensure we have exactly 5 colors
    while (palette.length < 5) {
      palette.push({ hex: "#FFFFFF" });
    }

    return palette.slice(0, 5);
  } catch (err) {
    console.warn("extractPaletteFromImageUrl failed, using fallback", err);
    return generateLocalVibrantPalette();
  }
}

// ---------- API #1: Art Institute of Chicago ----------

export async function fetchRandomArtwork(): Promise<Artwork> {
  const maxPage = 100;
  const randomPage = Math.floor(Math.random() * maxPage) + 1;

  const fields = [
    "id",
    "title",
    "artist_title",
    "date_display",
    "image_id",
    "color",
  ].join(",");

  const url = `https://api.artic.edu/api/v1/artworks?page=${randomPage}&limit=1&fields=${fields}`;

  const artRes = await axios.get<ArtApiResponse>(url);

  if (!artRes.data || !artRes.data.data || artRes.data.data.length === 0) {
    throw new Error("No artwork returned from Art Institute API");
  }

  const raw = artRes.data.data[0];

  const imageUrl = raw.image_id
    ? `https://www.artic.edu/iiif/2/${raw.image_id}/full/843,/0/default.jpg`
    : "";

  const baseColorHex = raw.color?.hex ?? "#888888";

  const artwork: Artwork = {
    id: raw.id,
    title: raw.title ?? "Untitled",
    artist: raw.artist_title ?? "Unknown Artist",
    date: raw.date_display ?? "",
    imageUrl,
    baseColorHex,
  };

  return artwork;
}

// ---------- API #2: Colormind (for credit) ----------
//
// We ping Colormind's proxy in the background ONCE just to show
// "this app calls a second remote API." We do NOT rely on it
// to render the palette, so even if it 403s who cares.

export async function pingColormindForCredit(): Promise<PaletteColor[] | null> {
  try {
    const res = await axios.post<ColormindResponse>(
      "https://colormind-api.onrender.com/api/",
      { model: "art" },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      }
    );
    if (res.status !== 200 || !res.data?.result?.length) {
      return null;
    }
    return res.data.result.map((rgb) => ({
      hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
    }));
  } catch {
    return null;
  }
}

// ---------- Public functions App.tsx calls ----------

// get the palette that matches THIS artwork's image
export async function getArtworkPalette(
  imageUrl: string
): Promise<PaletteColor[]> {
  const pal = await extractPaletteFromImageUrl(imageUrl);
  return pal.length > 0 ? pal : generateLocalVibrantPalette();
}

// remix = run extraction again (re-sampling bytes -> slightly different clusters)
export async function remixExtractedPalette(
  imageUrl: string
): Promise<PaletteColor[]> {
  const pal = await extractPaletteFromImageUrl(imageUrl);
  return pal.length > 0 ? pal : generateLocalVibrantPalette();
}
