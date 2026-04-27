"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { Banknote, Coins, HandCoins } from "lucide-react";
import type { ViewDisplayMode } from "@/lib/store/useLogViewSettingsStore";

interface TransactionTypeDropdownProps {
    displayMode: ViewDisplayMode;
    setDisplayMode: (mode: ViewDisplayMode) => void;
}

const MODE_OPTIONS: {
    key: ViewDisplayMode;
    label: string;
    icon: LucideIcon;
}[] = [
    { key: "dimes", label: "Small Dimes", icon: Coins },
    { key: "bucks", label: "Big Bucks", icon: Banknote },
    { key: "both", label: "All", icon: HandCoins },
];

export function TransactionTypeDropdown({
    displayMode,
    setDisplayMode,
}: TransactionTypeDropdownProps) {
    const currentOption = MODE_OPTIONS.find((opt) => opt.key === displayMode);
    const CurrentIcon = currentOption?.icon ?? Coins;
    const modeLabel = currentOption?.label ?? "Small Dimes";

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
                <Button variant="ghost" size="md" aria-label={modeLabel}>
                    <CurrentIcon size={16} />
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
                    <DropdownItem
                        key={opt.key}
                        startContent={<opt.icon size={16} />}
                    >
                        {opt.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
