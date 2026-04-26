/* APP CONFIG */
export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://pangolog.app";

/* MODAL CLASS NAMES */
export const FORM_MODAL_CLASS_NAMES = {
    closeButton: "cursor-pointer",
    body: "overflow-y-auto max-h-[calc(var(--visual-viewport-height,100svh)-10rem)]",
};

export const DEFAULT_MODAL_CLASS_NAMES = {
    closeButton: "cursor-pointer",
};
