"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import type { LogViewDisplayMode } from "@/lib/store/useLocalAppDataStore";

interface TransactionTypeDropdownProps {
    logViewDisplayMode: LogViewDisplayMode;
    setLogViewDisplayMode: (mode: LogViewDisplayMode) => void;
}

const MODE_OPTIONS: { key: LogViewDisplayMode; label: string }[] = [
    { key: "dimes", label: "Small Dimes" },
    { key: "bucks", label: "Big Bucks" },
    { key: "both", label: "Both" },
];

export function TransactionTypeDropdown({
    logViewDisplayMode,
    setLogViewDisplayMode,
}: TransactionTypeDropdownProps) {
    const modeLabel =
        MODE_OPTIONS.find((opt) => opt.key === logViewDisplayMode)?.label ??
        "Small Dimes";

    function handleSelectionChange(keys: "all" | Set<React.Key>) {
        if (keys === "all") return;
        const key = Array.from(keys)[0] as LogViewDisplayMode;
        setLogViewDisplayMode(key);
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
                selectedKeys={new Set([logViewDisplayMode])}
                onSelectionChange={handleSelectionChange}
            >
                {MODE_OPTIONS.map((opt) => (
                    <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
