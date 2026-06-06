"use client";

import type { LucideIcon } from "lucide-react";

interface ToggleSwitchProps {
    label: string;
    leftLabel: string;
    rightLabel: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
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
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    isSelectingRight,
    onValueChange,
    shouldShowLabel = false,
    isDisabled = false,
    className = "",
}: ToggleSwitchProps) {
    const buttonClasses =
        "flex items-center justify-center gap-1.5 w-full rounded-md px-3 py-1 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus";

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span
                className={shouldShowLabel ? "text-muted text-sm" : "sr-only"}
            >
                {label}
            </span>
            <div className="border-foreground flex flex-1 items-center gap-1 rounded-xl border p-1">
                <label className="flex-1 cursor-pointer rounded-sm">
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
                                ? "bg-foreground text-background"
                                : "text-foreground hover:bg-surface bg-transparent"
                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        {LeftIcon && <LeftIcon size={16} />}
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
                                ? "bg-foreground text-background"
                                : "text-foreground hover:bg-surface bg-transparent"
                        } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        {RightIcon && <RightIcon size={16} />}
                        {rightLabel}
                    </span>
                </label>
            </div>
        </div>
    );
}
