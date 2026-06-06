"use client";

import { Button, Checkbox, Label, Popover } from "@heroui/react";
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
                    variant={hasActiveFilter ? "primary" : "outline"}
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
                            onChange={onShowDimesChange}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Small dimes</Label>
                            </Checkbox.Content>
                        </Checkbox>
                        <Checkbox
                            isSelected={shouldShowBucks}
                            onChange={onShowBucksChange}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Big bucks</Label>
                            </Checkbox.Content>
                        </Checkbox>
                        <Checkbox
                            isSelected={shouldShowIncome}
                            onChange={onShowIncomeChange}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Income</Label>
                            </Checkbox.Content>
                        </Checkbox>
                        <Checkbox
                            isSelected={shouldHideInactive}
                            onChange={onHideInactiveChange}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                                <Label>Hide inactive</Label>
                            </Checkbox.Content>
                        </Checkbox>
                        <div className="mt-1 flex gap-1 border-t pt-2">
                            <Button
                                size="sm"
                                variant="outline"
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
