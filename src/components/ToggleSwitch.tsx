"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const leftLabelRef = useRef<HTMLLabelElement>(null);
    const rightLabelRef = useRef<HTMLLabelElement>(null);
    const [sliderStyle, setSliderStyle] = useState<{
        left: number;
        width: number;
    }>({ left: 0, width: 0 });

    useEffect(() => {
        const container = containerRef.current;
        const selectedLabel = isSelectingRight
            ? rightLabelRef.current
            : leftLabelRef.current;
        if (!container || !selectedLabel) return;

        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedLabel.getBoundingClientRect();

        setSliderStyle({
            left: selectedRect.left - containerRect.left,
            width: selectedRect.width,
        });
    }, [isSelectingRight]);

    const buttonClasses =
        "flex items-center justify-center gap-1.5 w-full rounded-md px-3 py-1 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus";

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span
                className={shouldShowLabel ? "text-muted text-sm" : "sr-only"}
            >
                {label}
            </span>
            <div
                ref={containerRef}
                className="border-foreground relative flex flex-1 items-center gap-1 rounded-xl border p-1"
            >
                <div
                    className="bg-foreground absolute top-1 bottom-1 rounded-md transition-[left,width] duration-200 ease-in-out motion-reduce:transition-none"
                    style={{
                        left: sliderStyle.left,
                        width: sliderStyle.width,
                    }}
                />
                <label
                    ref={leftLabelRef}
                    className="relative z-10 flex-1 cursor-pointer rounded-sm"
                >
                    <input
                        type="radio"
                        name={`toggle-${leftLabel}-${rightLabel}`}
                        checked={!isSelectingRight}
                        onChange={() => !isDisabled && onValueChange(false)}
                        disabled={isDisabled}
                        className="peer sr-only"
                    />
                    <span
                        className={`${buttonClasses} ${isDisabled ? "cursor-not-allowed opacity-50" : ""} ${!isSelectingRight ? "text-background" : "hover:bg-surface"}`}
                    >
                        {LeftIcon && <LeftIcon size={16} />}
                        {leftLabel}
                    </span>
                </label>
                <label
                    ref={rightLabelRef}
                    className="relative z-10 cursor-pointer"
                >
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
                            isDisabled ? "cursor-not-allowed opacity-50" : ""
                        } ${isSelectingRight ? "text-background" : "hover:bg-surface"}`}
                    >
                        {RightIcon && <RightIcon size={16} />}
                        {rightLabel}
                    </span>
                </label>
            </div>
        </div>
    );
}
