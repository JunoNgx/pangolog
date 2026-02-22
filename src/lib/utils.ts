import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

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

export const SELECT_CLASSES = `
    rounded-lg px-3 py-2
    text-sm text-foreground
    bg-default-100 border border-default-200
    cursor-pointer
`;

export function todayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function toDateInputValue(isoString: string): string {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function fromDateInputValue(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toISOString();
}

export function formatAmount(minorUnits: number): string {
    const { customCurrency, isPrefixCurrency } =
        useProfileSettingsStore.getState();
    const value = (minorUnits / 100).toFixed(2);

    if (!customCurrency) return value;
    if (isPrefixCurrency) return `${customCurrency}${value}`;
    return `${value} ${customCurrency}`;
}
