import type { Frequency } from "@/lib/types";

/* APP CONFIG */
export const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://pangolog.app";
export const DEVELOPER_WEBSITE = "https://junongx.com";
export const DESIGNER_WEBSITE = "https://caseykwokdinata.webflow.io/";
export const GITHUB_REPO = "https://github.com/JunoNgx/pangolog";

/* CLASSNAMES */
export const SELECT_CLASSES = `
    rounded-lg px-3 py-2
    text-sm text-foreground
    bg-surface border
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
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export const DAY_NAMES_ABB = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

/* SYNC FILES */
export const DATA_FILE = "data.json";

export const MIME_JSON = "application/json";

/* SYNC */
export const DEBOUNCE_MS = 10 * 1000;
export const RESTORE_SYNC_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/* DISPLAY */
export const VIEW_DISPLAY_MODES = ["dimes", "bucks", "all"] as const;
export const UNCATEGORISED_ID = "__uncategorised__";

/* PERSIST STORES */
export const PERSIST_SUMMARY_VIEW = "pangolog-summary-view-settings";
export const PERSIST_LOG_VIEW = "pangolog-log-view-settings";
export const PERSIST_PROFILE = "pangolog-profile-settings";
export const PERSIST_LOCAL_USER = "pangolog-local-user-settings";
export const PERSIST_LOCAL_APP_DATA = "pangolog-local-app-data";
export const PERSIST_LOCAL_SYNC = "pangolog-local-settings";
export const PERSIST_SESSION = "pangolog-session";

/* QUERY KEYS */
export const TRANSACTIONS_KEY = ["transactions"];
export const CATEGORIES_KEY = ["categories"];
export const RECURRING_RULES_KEY = ["recurring-rules"];
