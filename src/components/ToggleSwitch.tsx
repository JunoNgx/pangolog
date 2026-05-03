"use client";

interface ToggleSwitchProps {
    label: string;
    leftLabel: string;
    rightLabel: string;
    isSelectingRight: boolean;
    onValueChange: (value: boolean) => void;
    shouldShowLabel?: boolean;
    isDisabled?: boolean;
    className?: string;
}

export function ToggleSwitch({
    label,
    leftLabel,
    rightLabel,
    isSelectingRight,
    onValueChange,
    shouldShowLabel = true,
    isDisabled = false,
    className = "",
}: ToggleSwitchProps) {
    return (
        <div
            className={`inline-flex items-center gap-2 rounded-md ${className}`}
        >
            <span
                className={
                    shouldShowLabel ? "text-default-500 text-sm" : "sr-only"
                }
            >
                {label}
            </span>
            <div className="inline-flex items-center gap-1 rounded-md border border-default-200 p-1">
                <label className="cursor-pointer rounded-sm">
                    <input
                        type="radio"
                        name={`toggle-${leftLabel}-${rightLabel}`}
                        checked={!isSelectingRight}
                        onChange={() => !isDisabled && onValueChange(false)}
                        disabled={isDisabled}
                        className="sr-only peer"
                    />
                    <span
                        className={`inline-block min-w-16 rounded-sm px-3 py-1 text-center text-sm transition-colors  ${
                            !isSelectingRight
                                ? "bg-primary text-primary-foreground"
                                : "bg-transparent text-default-700 hover:bg-default-100"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {leftLabel}
                    </span>
                </label>
                <label className="cursor-pointer">
                    <input
                        type="radio"
                        name={`toggle-${leftLabel}-${rightLabel}`}
                        checked={isSelectingRight}
                        onChange={() => !isDisabled && onValueChange(true)}
                        disabled={isDisabled}
                        className="sr-only peer"
                    />
                    <span
                        className={`inline-block min-w-16 rounded-sm px-3 py-1 text-center text-sm transition-colors  ${
                            isSelectingRight
                                ? "bg-primary text-primary-foreground"
                                : "bg-transparent text-default-700 hover:bg-default-100"
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {rightLabel}
                    </span>
                </label>
            </div>
        </div>
    );
}
