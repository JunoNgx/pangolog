"use client";

import {
    Button,
    Checkbox,
    Popover,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

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
        <Popover>
            <Popover.Trigger>
                <Button
                    variant={hasActiveFilter ? "primary" : "tertiary"}
                    className="w-min"
                >
                    Filter
                    <ChevronDown className="size-3" />
                </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom end" className="p-2">
                <Popover.Dialog>
                    <div className="flex min-w-32 flex-col gap-1">
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
                        <div className="border-default-200 mt-1 flex gap-1 border-t pt-2">
                            <Button
                                size="sm"
                                variant="tertiary"
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
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
