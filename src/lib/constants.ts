/* APP CONFIG */
export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://pangolog.app";

/* CLASSNAMES */
export const FORM_MODAL_CLASS_NAMES = {
    closeButton: "cursor-pointer",
    body: "overflow-y-auto max-h-[calc(var(--visual-viewport-height,100svh)-10rem)]",
};

export const DEFAULT_MODAL_CLASS_NAMES = {
    closeButton: "cursor-pointer",
};

export const SELECT_CLASSES = `
    rounded-lg px-3 py-2
    text-sm text-foreground
    bg-default-100 border border-default-200
    cursor-pointer
`;

/* CONSTANTS */
export const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export const YEAR_OPTIONS = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i,
);
