"use client";

import {
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";

interface RecurringFilterDropdownProps {
    shouldShowDimes: boolean;
    shouldShowBucks: boolean;
    shouldShowIncome: boolean;
    shouldHideInactive: boolean;
    onShowDimesChange: (value: boolean) => void;
    onShowBucksChange: (value: boolean) => void;
    onShowIncomeChange: (value: boolean) => void;
    onHideInactiveChange: (value: boolean) => void;
}

export function RecurringFilterDropdown({
    shouldShowDimes,
    shouldShowBucks,
    shouldShowIncome,
    shouldHideInactive,
    onShowDimesChange,
    onShowBucksChange,
    onShowIncomeChange,
    onHideInactiveChange,
}: RecurringFilterDropdownProps) {
    const activeFilterCount =
        (!shouldShowDimes ? 1 : 0) +
        (!shouldShowBucks ? 1 : 0) +
        (!shouldShowIncome ? 1 : 0) +
        (shouldHideInactive ? 1 : 0);
    const hasActiveFilter = activeFilterCount > 0;

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    variant={hasActiveFilter ? "solid" : "flat"}
                    color={hasActiveFilter ? "primary" : "default"}
                    className="w-min"
                >
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
                <div className="flex flex-col gap-1 pr-4">
                    <Checkbox
                        isSelected={shouldShowDimes}
                        onValueChange={onShowDimesChange}
                    >
                        <span className="text-default-500 text-sm">
                            Small dimes
                        </span>
                    </Checkbox>
                    <Checkbox
                        isSelected={shouldShowBucks}
                        onValueChange={onShowBucksChange}
                    >
                        <span className="text-default-500 text-sm">
                            Big bucks
                        </span>
                    </Checkbox>
                    <Checkbox
                        isSelected={shouldShowIncome}
                        onValueChange={onShowIncomeChange}
                    >
                        <span className="text-default-500 text-sm">Income</span>
                    </Checkbox>
                    <Checkbox
                        isSelected={shouldHideInactive}
                        onValueChange={onHideInactiveChange}
                    >
                        <span className="text-default-500 text-sm">
                            Hide inactive
                        </span>
                    </Checkbox>
                </div>
            </PopoverContent>
        </Popover>
    );
}
