"use client";

import { Checkbox } from "@heroui/react";

interface TransactionTypeCheckboxesProps {
    shouldShowSmallDimes: boolean;
    onSmallDimesChange: (value: boolean) => void;
    shouldShowBigBucks: boolean;
    onBigBucksChange: (value: boolean) => void;
}

export function TransactionTypeCheckboxes({
    shouldShowSmallDimes,
    onSmallDimesChange,
    shouldShowBigBucks,
    onBigBucksChange,
}: TransactionTypeCheckboxesProps) {
    return (
        <div className="flex items-center gap-4 self-end sm:self-auto">
            <Checkbox
                isSelected={shouldShowSmallDimes}
                onValueChange={onSmallDimesChange}
                size="md"
            >
                <span className="text-sm">Small Dimes</span>
            </Checkbox>
            <Checkbox
                isSelected={shouldShowBigBucks}
                onValueChange={onBigBucksChange}
                size="md"
            >
                <span className="text-sm">Big Bucks</span>
            </Checkbox>
        </div>
    );
}
