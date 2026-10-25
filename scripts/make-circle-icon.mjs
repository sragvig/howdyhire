// Crops public/reveille-jr.png to its round artwork with a transparent background.
// Usage: node scripts/make-circle-icon.mjs [input] [output] [size] [background]
//   background: optional hex color to fill outside the circle instead of transparency
//   (needed for Apple touch icons, since iOS turns transparent pixels black).
// Regenerate the favicons with: npm run icons
// Uses sharp (installed with Next.js).
import sharp from "sharp";

const input = process.argv[2] ?? "public/reveille-jr.png";
const output = process.argv[3] ?? "public/reveille-circle.png";
const outSize = Number(process.argv[4] ?? 512);
const background = process.argv[5];

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const cx = Math.floor(width / 2);
const cy = Math.floor(height / 2);
const isBackground = (x, y) => {
  const i = (y * width + x) * channels;
  return data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245; // near-white margin
};

// The artwork is a disc on a white margin: walk in from each edge along the center lines to find
// where the disc starts, and use the smallest radius so no margin survives.
const edges = [
  () => { for (let x = 0; x < cx; x++) if (!isBackground(x, cy)) return cx - x; },
  () => { for (let x = width - 1; x > cx; x--) if (!isBackground(x, cy)) return x - cx; },
  () => { for (let y = 0; y < cy; y++) if (!isBackground(cx, y)) return cy - y; },
  () => { for (let y = height - 1; y > cy; y--) if (!isBackground(cx, y)) return y - cy; },
];
const found = edges.map((f) => f()).filter(Boolean);
const fullRadius = Math.min(cx, cy);
// Inset by 1% so anti-aliased margin pixels at the rim are cut off too.
const radius = Math.floor((found.length === 4 ? Math.min(...found) : fullRadius) * 0.99);

const side = radius * 2;
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${outSize}" height="${outSize}"><circle cx="${outSize / 2}" cy="${outSize / 2}" r="${outSize / 2}" fill="#fff"/></svg>`,
);

const circle = await sharp(input)
  .extract({ left: cx - radius, top: cy - radius, width: side, height: side })
  .resize(outSize, outSize)
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }]) // keep only pixels inside the circle
  .png()
  .toBuffer();

await (background ? sharp(circle).flatten({ background }) : sharp(circle)).png({ compressionLevel: 9 }).toFile(output);

console.log(
  `Wrote ${output}: ${outSize}×${outSize}, ${background ? `on ${background}` : "transparent corners"}, disc radius ${radius}px of ${fullRadius}px${
    found.length === 4 ? "" : " (no margin detected; used full image)"
  }`,
);
