import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

export function formatAmount(minorUnits: number): string {
    const { customCurrency, isPrefixCurrency } =
        useProfileSettingsStore.getState();
    const value = (minorUnits / 100).toFixed(2);

    if (!customCurrency) return value;
    if (isPrefixCurrency) return `${customCurrency}${value}`;
    return `${value} ${customCurrency}`;
}
