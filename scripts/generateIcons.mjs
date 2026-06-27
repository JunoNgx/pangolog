import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BG_COL = "#1d1d16";
const OUT_DIR = "public/icons";
const SOURCE_FILE = "src/assets/logo.svg";

const GEN_PURPOSE_SIZE = 128;
const FAVICON_SIZE = 32;
const ANY_PURPOSE_SIZES = [
    [192, "icon-192.png"],
    [512, "icon-512.png"],
    [180, "apple-touch-icon.png"],
];
const MASKABLE_SIZE = 512;
const MASKABLE_SAFE_ZONE_RATIO = 0.8;

const sourceBuf = await readFile(SOURCE_FILE);

async function generateGeneralPurposeNoBgIcon() {
    await sharp(sourceBuf)
        .resize(GEN_PURPOSE_SIZE, GEN_PURPOSE_SIZE)
        .png()
        .toFile(join(OUT_DIR, "gen-purpose-no-bg-icon.png"));
}

async function generateFavicons() {
    await writeFile(join(OUT_DIR, "favicon.svg"), sourceBuf);
    await sharp(sourceBuf)
        .resize(FAVICON_SIZE, FAVICON_SIZE)
        .png()
        .toFile(join(OUT_DIR, `favicon-${FAVICON_SIZE}.png`));
}

async function generateIconsWithBg() {
    for (const [size, name] of ANY_PURPOSE_SIZES) {
        const mark = await sharp(sourceBuf).resize(size, size).png().toBuffer();
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: BG_COL,
            },
        })
            .composite([{ input: mark, left: 0, top: 0 }])
            .png()
            .toFile(join(OUT_DIR, name));
    }
}

async function generateMaskableIcon() {
    const inner = Math.round(MASKABLE_SIZE * MASKABLE_SAFE_ZONE_RATIO);
    const offset = Math.round((MASKABLE_SIZE - inner) / 2);
    const mark = await sharp(sourceBuf).resize(inner, inner).png().toBuffer();
    await sharp({
        create: {
            width: MASKABLE_SIZE,
            height: MASKABLE_SIZE,
            channels: 4,
            background: BG_COL,
        },
    })
        .composite([{ input: mark, left: offset, top: offset }])
        .png()
        .toFile(join(OUT_DIR, `icon-maskable-${MASKABLE_SIZE}.png`));
}

await generateGeneralPurposeNoBgIcon();
await generateFavicons();
await generateIconsWithBg();
await generateMaskableIcon();

console.log("Icons generated.");
