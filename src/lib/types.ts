export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type ViewDisplayMode = "dimes" | "bucks" | "all";
export type TimeFormat = "12h" | "24h";

export interface ProfileSettings {
    customCurrency: string;
    isPrefixCurrency: boolean;
    isExpenseOnlyMode: boolean;
    isCategoryAlphabetical: boolean;
    updatedAt: string;
}
