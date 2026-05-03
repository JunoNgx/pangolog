"use client";

import { Button } from "@heroui/react";

interface ToggleSwitchProps {
    label?: string;
    leftLabel: string;
    rightLabel: string;
    isSelectingRight: boolean;
    onValueChange: (value: boolean) => void;
    isDisabled?: boolean;
    className?: string;
}

export function ToggleSwitch({
    label,
    leftLabel,
    rightLabel,
    isSelectingRight,
    onValueChange,
    isDisabled = false,
    className = "",
}: ToggleSwitchProps) {
    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className="inline-flex items-center gap-1 rounded-md border border-default-200 p-1">
                <legend className="sr-only">{`${label}: ${leftLabel} or ${rightLabel}`}</legend>
                <Button
                    size="sm"
                    variant={!isSelectingRight ? "solid" : "light"}
                    color={!isSelectingRight ? "primary" : "default"}
                    isDisabled={isDisabled}
                    onPress={() => !isDisabled && onValueChange(false)}
                    className="min-w-16 rounded-sm px-3 py-1"
                >
                    {leftLabel}
                </Button>
                <Button
                    size="sm"
                    variant={isSelectingRight ? "solid" : "light"}
                    color={isSelectingRight ? "primary" : "default"}
                    isDisabled={isDisabled}
                    onPress={() => !isDisabled && onValueChange(true)}
                    className="min-w-16 rounded-sm px-3 py-1"
                >
                    {rightLabel}
                </Button>
            </div>
        </div>
    );
}
