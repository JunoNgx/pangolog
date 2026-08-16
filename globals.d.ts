// Ambient module declarations for non-code assets.
// tsc --noEmit does not know how Next.js/Turbopack resolves these
// at build time, so the type checker would fail with TS2307
// (e.g. "Cannot find module '@/assets/logo.svg'") without these shims.
// The build pipeline resolves them regardless; these declarations
// only exist to align static type checking with bundler behavior.
declare module "*.css";
declare module "*.png" {
    const content: import("next/dist/shared/lib/image-external").StaticImageData;
    export default content;
}
declare module "*.svg" {
    const src: string;
    export default src;
}
