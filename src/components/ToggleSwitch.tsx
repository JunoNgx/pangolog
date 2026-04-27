import type { SwitchProps } from "@heroui/react";
import { Switch } from "@heroui/react";
import { useId } from "react";

interface ToggleSwitchProps extends Omit<SwitchProps, "children" | "onChange"> {
    leftLabel: string;
    rightLabel: string;
    isSelectingRight: boolean;
    onValueChange: (value: boolean) => void;
    isDisabled?: boolean;
    className?: string;
    leftColor?: string;
    rightColor?: string;
}

export function ToggleSwitch({
    leftLabel,
    rightLabel,
    isSelectingRight,
    onValueChange,
    isDisabled = false,
    className = "",
    id,
    ...props
}: ToggleSwitchProps) {
    const uniqueId = useId();
    const toggleId = id || `toggle-${uniqueId}`;
    const leftLabelId = `left-label-${uniqueId}`;
    const rightLabelId = `right-label-${uniqueId}`;
    const isSelectingRightActive = isSelectingRight && !isDisabled;

    const handleLeftLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onValueChange(false);
        }
    };

    const handleRightLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onValueChange(true);
        }
    };

    return (
        <fieldset
            className={`flex min-h-[11] items-center gap-1 ${className}`}
            aria-labelledby={`${leftLabelId} ${rightLabelId}`}
        >
            <span
                id={leftLabelId}
                className={`hover:bg-default-100 focus-visible:ring-primary-300 flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-right text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${!isSelectingRightActive ? "" : "text-default-400"} ${isDisabled ? "cursor-not-allowed opacity-50" : ""} `}
                tabIndex={isSelectingRightActive ? 0 : -1}
                role="switch"
                aria-checked={!isSelectingRight}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && onValueChange(false)}
                onKeyDown={handleLeftLabelKeyDown}
            >
                {leftLabel}
            </span>

            <Switch
                id={toggleId}
                isSelected={isSelectingRight}
                onValueChange={onValueChange}
                isDisabled={isDisabled}
                size="sm"
                classNames={{
                    base: `
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    `,
                    wrapper: `
                        bg-primary
                        group-data-[selected=true]:bg-primary
                    `,
                    thumb: "bg-white",
                }}
                aria-label={`${leftLabel} ${rightLabel} toggle`}
                aria-labelledby={`${leftLabelId} ${rightLabelId}`}
                {...props}
            />

            <span
                id={rightLabelId}
                className={`hover:bg-default-100 focus-visible:ring-primary-300 flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${isSelectingRightActive ? "" : "text-default-400"} ${isDisabled ? "cursor-not-allowed opacity-50" : ""} `}
                tabIndex={!isSelectingRightActive ? 0 : -1}
                role="switch"
                aria-checked={isSelectingRight}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && onValueChange(true)}
                onKeyDown={handleRightLabelKeyDown}
            >
                {rightLabel}
            </span>
        </fieldset>
    );
}
