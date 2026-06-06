import { toast } from "@heroui/react";
import { DateTime } from "luxon";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import type { TimeFormat } from "@/lib/types";

export function isAndroid(): boolean {
    if (typeof window === "undefined") return false;
    return /android/i.test(navigator.userAgent);
}

export function getLocaleDateFormat(): string {
    if (typeof window === "undefined") return "";
    return new Intl.DateTimeFormat(navigator.language, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .formatToParts(new Date(2000, 0, 15))
        .map((p) => {
            if (p.type === "year") return "YYYY";
            if (p.type === "month") return "MM";
            if (p.type === "day") return "DD";
            return p.value;
        })
        .join("");
}

export function utcNowString(): string {
    const result = DateTime.now().toUTC().toISO();
    if (!result) {
        throw new Error("Failed to generate UTC timestamp");
    }
    return result;
}

export function toIsoString(dt: DateTime): string {
    const result = dt.toISO();
    if (!result) {
        throw new Error("Failed to generate ISO timestamp");
    }
    return result;
}

export function toIsoDateString(dt: DateTime): string {
    const result = dt.toISODate();
    if (!result) {
        throw new Error("Failed to generate ISO date string");
    }
    return result;
}

export function todayDateString(): string {
    return toIsoDateString(DateTime.now());
}

export function toDateInputValue(isoString: string): string {
    return toIsoDateString(DateTime.fromISO(isoString).toLocal());
}

export function fromDateInputValue(dateStr: string): string {
    return toIsoString(
        DateTime.fromISO(dateStr, { zone: "local" }).set({
            hour: 12,
            minute: 0,
            second: 0,
            millisecond: 0,
        }),
    );
}

export function detectSystemTimeFormat(): TimeFormat {
    try {
        const isSystemUsing12h = new Intl.DateTimeFormat(navigator.language, {
            hour: "numeric",
        })
            .formatToParts(new Date())
            .some((p) => p.type === "dayPeriod");
        return isSystemUsing12h ? "12h" : "24h";
    } catch {
        return "24h";
    }
}

export function getTimeFormatOptions(
    format: TimeFormat,
): Intl.DateTimeFormatOptions {
    return { ...DateTime.TIME_SIMPLE, hour12: format === "12h" };
}

export function formatAmount(minorUnits: number): string {
    const { customCurrency, isPrefixCurrency } =
        useProfileSettingsStore.getState();
    const value = (minorUnits / 100).toFixed(2);

    if (!customCurrency) return value;
    if (isPrefixCurrency) return `${customCurrency}${value}`;
    return `${value} ${customCurrency}`;
}

export function formatAmountShort(minorUnits: number): string {
    const { customCurrency, isPrefixCurrency } =
        useProfileSettingsStore.getState();

    let value: string;
    if (minorUnits >= 100_000_000) {
        value = `${(minorUnits / 100_000_000).toFixed(1)}M`;
    } else if (minorUnits >= 100_000) {
        value = `${(minorUnits / 100_000).toFixed(1)}K`;
    } else {
        value = (minorUnits / 100).toFixed(2);
    }

    if (!customCurrency) return value;
    if (isPrefixCurrency) return `${customCurrency}${value}`;
    return `${value} ${customCurrency}`;
}

export function showDeleteToast(entityName: string, undoFn: () => void) {
    toast(`${entityName} deleted`, {
        timeout: 5000,
        actionProps: { children: "Undo", onPress: undoFn },
    });
}
