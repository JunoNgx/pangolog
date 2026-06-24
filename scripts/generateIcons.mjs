import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BG_COL = "#1d1d16";
const OUT_DIR = "public/icons";
const SOURCE_FILE = "assets/logo.svg";

const sourceBuf = await readFile(SOURCE_FILE);

await writeFile(join(OUT_DIR, "favicon.svg"), sourceBuf);
await sharp(sourceBuf)
    .resize(32, 32)
    .png()
    .toFile(join(OUT_DIR, "favicon-32.png"));

const withBgSizes = [
    [192, "icon-192.png"],
    [512, "icon-512.png"],
    [180, "apple-touch-icon.png"],
];
for (const [size, name] of withBgSizes) {
    const mark = await sharp(sourceBuf).resize(size, size).png().toBuffer();
    await sharp({
        create: { width: size, height: size, channels: 4, background: BG_COL },
    })
        .composite([{ input: mark, left: 0, top: 0 }])
        .png()
        .toFile(join(OUT_DIR, name));
}

const MASKABLE_SIZE = 512;
const innerSize = Math.round(MASKABLE_SIZE * 0.8);
const offset = Math.round((MASKABLE_SIZE - innerSize) / 2);
const innerMark = await sharp(sourceBuf).resize(innerSize, innerSize).png().toBuffer();
await sharp({
    create: {
        width: MASKABLE_SIZE,
        height: MASKABLE_SIZE,
        channels: 4,
        background: BG_COL,
    },
})
    .composite([{ input: innerMark, left: offset, top: offset }])
    .png()
    .toFile(join(OUT_DIR, `icon-maskable-${MASKABLE_SIZE}.png`));

console.log("Icons generated.");
