import { DateTime } from "luxon";
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
    (_, i) => DateTime.now().year - 10 + i,
);

export const SELECT_CLASSES = `
    rounded-lg px-3 py-2
    text-sm text-foreground
    bg-default-100 border border-default-200
    cursor-pointer
`;

export function todayDateString(): string {
    return DateTime.now().toISODate()!;
}

export function toDateInputValue(isoString: string): string {
    return DateTime.fromISO(isoString).toLocal().toISODate()!;
}

export function fromDateInputValue(dateStr: string): string {
    return DateTime.fromISO(dateStr, { zone: "local" })
        .set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
        .toISO()!;
}

export function formatAmount(minorUnits: number): string {
    const { customCurrency, isPrefixCurrency } =
        useProfileSettingsStore.getState();
    const value = (minorUnits / 100).toFixed(2);

    if (!customCurrency) return value;
    if (isPrefixCurrency) return `${customCurrency}${value}`;
    return `${value} ${customCurrency}`;
}
