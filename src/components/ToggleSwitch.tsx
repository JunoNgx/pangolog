"use client";

import { Button } from "@heroui/react";

interface ToggleSwitchProps {
    leftLabel: string;
    rightLabel: string;
    isSelectingRight: boolean;
    onValueChange: (value: boolean) => void;
    isDisabled?: boolean;
    className?: string;
}

export function ToggleSwitch({
    leftLabel,
    rightLabel,
    isSelectingRight,
    onValueChange,
    isDisabled = false,
    className = "",
}: ToggleSwitchProps) {
    return (
        <fieldset
            className={`inline-flex gap-1 rounded-md border border-default-200 p-1 ${className}`}
        >
            <legend className="sr-only">{`${leftLabel} or ${rightLabel}`}</legend>
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
        </fieldset>
    );
}
