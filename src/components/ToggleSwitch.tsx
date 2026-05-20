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
    shouldShowLabel = false,
    isDisabled = false,
    className = "",
}: ToggleSwitchProps) {
    const buttonClasses =
        "inline-block min-w-16 rounded-sm px-3 py-1 text-center text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-primary";

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span
                className={
                    shouldShowLabel ? "text-default-500 text-sm" : "sr-only"
                }
            >
                {label}
            </span>
            <div className="border-default-200 inline-flex items-center gap-1 rounded-lg border p-1">
                <label className="cursor-pointer rounded-sm">
                    <input
                        type="radio"
                        name={`toggle-${leftLabel}-${rightLabel}`}
                        checked={!isSelectingRight}
                        onChange={() => !isDisabled && onValueChange(false)}
                        disabled={isDisabled}
                        className="peer sr-only"
                    />
                    <span
                        className={`${buttonClasses} ${
                            !isSelectingRight
                                ? "bg-primary text-primary-foreground"
                                : "text-default-700 hover:bg-default-100 bg-transparent"
                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
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
                        className="peer sr-only"
                    />
                    <span
                        className={`${buttonClasses} ${
                            isSelectingRight
                                ? "bg-primary text-primary-foreground"
                                : "text-default-700 hover:bg-default-100 bg-transparent"
                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        {rightLabel}
                    </span>
                </label>
            </div>
        </div>
    );
}
