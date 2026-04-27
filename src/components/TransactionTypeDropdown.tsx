"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import type { ViewDisplayMode } from "@/lib/store/useLogViewSettingsStore";

interface TransactionTypeDropdownProps {
    displayMode: ViewDisplayMode;
    setDisplayMode: (mode: ViewDisplayMode) => void;
}

const MODE_OPTIONS: { key: ViewDisplayMode; label: string }[] = [
    { key: "dimes", label: "Small Dimes" },
    { key: "bucks", label: "Big Bucks" },
    { key: "both", label: "Both" },
];

export function TransactionTypeDropdown({
    displayMode,
    setDisplayMode,
}: TransactionTypeDropdownProps) {
    const modeLabel =
        MODE_OPTIONS.find((opt) => opt.key === displayMode)?.label ??
        "Small Dimes";

    function handleSelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0] as ViewDisplayMode;
        setDisplayMode(key);
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
                selectedKeys={new Set([displayMode])}
                onSelectionChange={handleSelectionChange}
            >
                {MODE_OPTIONS.map((opt) => (
                    <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
