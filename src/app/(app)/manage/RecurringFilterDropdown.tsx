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

    const label = hasActiveFilter
        ? `Filter (${activeFilterCount}/4)`
        : "Filter";

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button
                    variant={hasActiveFilter ? "solid" : "flat"}
                    color={hasActiveFilter ? "primary" : "default"}
                    className="min-w-min"
                >
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
                <div className="flex flex-col gap-1 min-w-48">
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
                    <div className="flex gap-1 pt-2 mt-1 border-t border-default-200">
                        <Button
                            size="sm"
                            variant="light"
                            className="flex-1 text-xs"
                            onPress={() => {
                                onShowDimesChange(true);
                                onShowBucksChange(true);
                                onShowIncomeChange(true);
                                onHideInactiveChange(false);
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
