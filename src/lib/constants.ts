import type { Frequency } from "@/lib/types";

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

/* DAY NAMES */
export const DAY_NAMES_FULL = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const DAY_NAMES_ABB = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* FREQUENCIES */
export const FREQUENCY_ORDER = {
    daily: 0,
    weekly: 1,
    monthly: 2,
    yearly: 3,
};

export const VALID_FREQUENCIES: Set<Frequency> = new Set([
    "daily",
    "weekly",
    "monthly",
    "yearly",
]);

/* GOOGLE AUTH */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

/* INDEXEDDB */
export const DB_NAME = "pangolog";
export const DB_VERSION = 4;
export const STORE_CATEGORIES = "categories";
export const STORE_RECURRING_RULES = "recurring-rules";
export const STORE_TRANSACTIONS = "transactions";
export const REQUIRED_STORES = [
    STORE_CATEGORIES,
    STORE_RECURRING_RULES,
    STORE_TRANSACTIONS,
];
export type StoreName =
    | typeof STORE_CATEGORIES
    | typeof STORE_RECURRING_RULES
    | typeof STORE_TRANSACTIONS;
export const RW: IDBTransactionMode = "readwrite";
export const RO: IDBTransactionMode = "readonly";

export const PURGE_DAYS = 60;

/* GOOGLE DRIVE */
export const DRIVE_API = "https://www.googleapis.com/drive/v3";
export const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
export const FOLDER_NAME = "Pangolog";
export const FOLDER_MIME = "application/vnd.google-apps.folder";

export const CATEGORIES_FILE = "categories.json";
export const RECURRING_RULES_FILE = "recurring-rules.json";
export const SETTINGS_FILE = "settings.json";

/* SYNC */
export const DEBOUNCE_MS = 10 * 1000;
export const RESTORE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/* MISC */
export const MIME_JSON = "application/json";
export const TRANSACTIONS_KEY = ["transactions"];
export const CATEGORIES_KEY = ["categories"];
export const RECURRING_RULES_KEY = ["recurring-rules"];
export const VIEW_DISPLAY_MODES = ["dimes", "bucks", "all"] as const;
export const UNCATEGORISED_ID = "__uncategorised__";
