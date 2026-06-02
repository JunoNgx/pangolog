"use client";

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLayoutEffect, useState } from "react";

const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [isMounted, setMounted] = useState(false);
    const CurrentIcon = themes.find((t) => t.key === theme)?.icon ?? Monitor;

    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Button isIconOnly variant="tertiary" size="sm" aria-label="Theme">
                <div className="size-4.5" />
            </Button>
        );
    }

    return (
        <Dropdown
            classNames={{
                content: "min-w-0 w-fit",
            }}
        >
            <DropdownTrigger>
                <Button isIconOnly variant="tertiary" size="sm" aria-label="Theme">
                    <CurrentIcon size={18} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Theme selection"
                selectionMode="single"
                selectedKeys={new Set([theme ?? "system"])}
                onSelectionChange={(keys) => {
                    const selectedKey = [...keys][0] as string;
                    setTheme(selectedKey);
                }}
            >
                {themes.map((t) => (
                    <DropdownItem
                        key={t.key}
                        startContent={<t.icon size={16} />}
                    >
                        {t.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
