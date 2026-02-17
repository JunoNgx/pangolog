import { Switch } from "@heroui/react";
import type { SwitchProps } from "@heroui/react";
import { useId } from "react";

interface ToggleSwitchProps extends Omit<SwitchProps, 'children' | 'onChange'> {
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
    leftColor = "text-danger-600",
    rightColor = "text-success-600",
    id,
    ...props
}: ToggleSwitchProps) {
    const uniqueId = useId();
    const toggleId = id || `toggle-${uniqueId}`;
    const leftLabelId = `left-label-${uniqueId}`;
    const rightLabelId = `right-label-${uniqueId}`;
    const isSelectingRightActive = isSelectingRight && !isDisabled;

    const handleLeftLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onValueChange(false);
        }
    };

    const handleRightLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onValueChange(true);
        }
    };

    return (
        <div
            className={`flex items-center gap-1 min-h-[44px] ${className}`}
            role="group"
            aria-labelledby={`${leftLabelId} ${rightLabelId}`}
        >
            <span
                id={leftLabelId}
                className={`
                    flex items-center gap-1
                    font-mono text-sm transition-all cursor-pointer
                    px-2 py-1 rounded
                    hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-primary-300 focus-visible:ring-offset-2
                    ${!isSelectingRightActive ? "text-default-600" : "text-default-400"}
                    ${isDisabled ? "cursor-not-allowed opacity-50" : ""}
                `}
                role="button"
                tabIndex={isSelectingRightActive ? 0 : -1}
                aria-pressed={!isSelectingRight}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && onValueChange(false)}
                onKeyDown={handleLeftLabelKeyDown}
            >
                {!isSelectingRightActive && (
                    <span className="text-xs" aria-hidden="true">✓</span>
                )}
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
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `,
                    wrapper: `
                        ${leftColor}
                        group-data-[selected=true]:${rightColor}
                    `,
                    thumb: "bg-white",
                }}
                aria-label={`${leftLabel} ${rightLabel} toggle`}
                aria-labelledby={`${leftLabelId} ${rightLabelId}`}
                {...props}
            />

            <span
                id={rightLabelId}
                className={`
                    flex items-center gap-1
                    font-mono text-sm transition-all cursor-pointer
                    px-2 py-1 rounded
                    hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-primary-300 focus-visible:ring-offset-2
                    ${isSelectingRightActive ? "text-default-600" : "text-default-400"}
                    ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                `}
                role="button"
                tabIndex={!isSelectingRightActive ? 0 : -1}
                aria-pressed={isSelectingRight}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && onValueChange(true)}
                onKeyDown={handleRightLabelKeyDown}
            >
                {isSelectingRightActive && (
                    <span className="text-xs" aria-hidden="true">✓</span>
                )}
                {rightLabel}
            </span>
        </div>
    );
}