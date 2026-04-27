"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";

interface TransactionTypeDropdownProps {
    shouldShowSmallDimes: boolean;
    onSmallDimesChange: (value: boolean) => void;
    shouldShowBigBucks: boolean;
    onBigBucksChange: (value: boolean) => void;
}

export function TransactionTypeDropdown({
    shouldShowSmallDimes,
    onSmallDimesChange,
    shouldShowBigBucks,
    onBigBucksChange,
}: TransactionTypeDropdownProps) {
    const logViewMode =
        shouldShowSmallDimes && shouldShowBigBucks
            ? "both"
            : shouldShowBigBucks
              ? "bucks"
              : "dimes";

    const modeLabel =
        logViewMode === "dimes"
            ? "Small Dimes"
            : logViewMode === "bucks"
              ? "Big Bucks"
              : "Both";

    function handleSelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0];
        if (key === "both") {
            onSmallDimesChange(true);
            onBigBucksChange(true);
        } else if (key === "bucks") {
            onSmallDimesChange(false);
            onBigBucksChange(true);
        } else {
            onSmallDimesChange(true);
            onBigBucksChange(false);
        }
    }

    return (
        <Dropdown
            classNames={{
                content: "min-w-0 w-fit",
            }}
        >
            <DropdownTrigger>
                <Button variant="ghost" size="sm" aria-label={modeLabel}>
                    {modeLabel}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Transaction type display mode"
                selectionMode="single"
                selectedKeys={new Set([logViewMode])}
                onSelectionChange={handleSelectionChange}
            >
                <DropdownItem key="dimes">Small Dimes</DropdownItem>
                <DropdownItem key="bucks">Big Bucks</DropdownItem>
                <DropdownItem key="both">Both</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
