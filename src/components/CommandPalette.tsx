"use client";

import { Input, Modal, ModalBody, ModalContent } from "@heroui/react";
import {
    BookOpen,
    Download,
    Feather,
    Monitor,
    Moon,
    PieChart,
    Plus,
    RefreshCw,
    Repeat,
    Settings,
    Sun,
    Tag,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAction } from "@/lib/createAction";
import { exportJson } from "@/lib/export";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useSyncFn } from "@/lib/hooks/useSync";

type Command = {
    id: string;
    group: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
};

type GroupedItem =
    | { type: "header"; group: string }
    | { type: "command"; cmd: Command; idx: number };

function nextTheme(current: string | undefined): "light" | "dark" | "system" {
    if (current === "light") return "dark";
    if (current === "dark") return "system";
    return "light";
}

function themeIcon(current: string | undefined) {
    if (current === "dark") return <Moon size={16} />;
    if (current === "system") return <Monitor size={16} />;
    return <Sun size={16} />;
}

function themeLabel(current: string | undefined): string {
    if (current === "light") return "Switch to dark theme";
    if (current === "dark") return "Switch to system theme";
    return "Switch to light theme";
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathname = usePathname();
    const { isConnected } = useGoogleAuth();
    const { sync } = useSyncFn();
    const { theme, setTheme } = useTheme();

    const open = useCallback(() => {
        if (isOpen) return;
        setIsOpen(true);
        setQuery("");
        setSelectedIndex(0);
    }, [isOpen]);

    const close = useCallback(() => setIsOpen(false), []);

    useHotkey("k", open, { ctrlOrMeta: true });

    const createCommand = useMemo((): Command | null => {
        if (pathname === "/log") {
            return {
                id: "create",
                group: "Create",
                label: "New transaction",
                icon: <Plus size={16} />,
                action: () => createAction.trigger(),
            };
        }
        if (pathname === "/categories") {
            return {
                id: "create",
                group: "Create",
                label: "New category",
                icon: <Plus size={16} />,
                action: () => createAction.trigger(),
            };
        }
        if (pathname === "/recurring") {
            return {
                id: "create",
                group: "Create",
                label: "New recurring rule",
                icon: <Plus size={16} />,
                action: () => createAction.trigger(),
            };
        }
        return null;
    }, [pathname]);

    const commands = useMemo((): Command[] => {
        const navigate: Command[] = [
            {
                id: "nav-log",
                group: "Navigate",
                label: "Go to Log",
                icon: <Feather size={16} />,
                action: () => router.push("/log"),
            },
            {
                id: "nav-categories",
                group: "Navigate",
                label: "Go to Categories",
                icon: <Tag size={16} />,
                action: () => router.push("/categories"),
            },
            {
                id: "nav-summary",
                group: "Navigate",
                label: "Go to Summary",
                icon: <PieChart size={16} />,
                action: () => router.push("/summary"),
            },
            {
                id: "nav-recurring",
                group: "Navigate",
                label: "Go to Recurring",
                icon: <Repeat size={16} />,
                action: () => router.push("/recurring"),
            },
            {
                id: "nav-settings",
                group: "Navigate",
                label: "Go to Settings",
                icon: <Settings size={16} />,
                action: () => router.push("/settings"),
            },
            {
                id: "nav-help",
                group: "Navigate",
                label: "Go to Help",
                icon: <BookOpen size={16} />,
                action: () => router.push("/help"),
            },
        ];

        const create: Command[] = createCommand ? [createCommand] : [];

        const actions: Command[] = [
            ...(isConnected
                ? [
                      {
                          id: "sync",
                          group: "Actions",
                          label: "Sync now",
                          icon: <RefreshCw size={16} />,
                          action: () => sync(),
                      },
                  ]
                : []),
            {
                id: "export",
                group: "Actions",
                label: "Export JSON",
                icon: <Download size={16} />,
                action: () => exportJson(true),
            },
            {
                id: "theme",
                group: "Actions",
                label: themeLabel(theme),
                icon: themeIcon(theme),
                action: () => setTheme(nextTheme(theme)),
            },
        ];

        return [...navigate, ...create, ...actions];
    }, [router, createCommand, isConnected, sync, theme, setTheme]);

    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        const q = query.toLowerCase();
        return commands.filter((cmd) => cmd.label.toLowerCase().includes(q));
    }, [commands, query]);

    function handleQueryChange(val: string) {
        setQuery(val);
        setSelectedIndex(0);
    }

    const groupedItems = useMemo((): GroupedItem[] => {
        const items: GroupedItem[] = [];
        let currentGroup = "";
        let idx = 0;
        for (const cmd of filteredCommands) {
            if (cmd.group !== currentGroup) {
                currentGroup = cmd.group;
                items.push({ type: "header", group: cmd.group });
            }
            items.push({ type: "command", cmd, idx: idx++ });
        }
        return items;
    }, [filteredCommands]);

    useEffect(() => {
        const el = scrollRef.current?.querySelector(
            `[data-index="${selectedIndex}"]`,
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const execute = useCallback(
        (cmd: Command) => {
            close();
            cmd.action();
        },
        [close],
    );

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape") {
            close();
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                Math.min(prev + 1, filteredCommands.length - 1),
            );
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            const cmd = filteredCommands[selectedIndex];
            if (cmd) execute(cmd);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            hideCloseButton
            size="sm"
            classNames={{ base: "max-w-md" }}
        >
            <ModalContent>
                <ModalBody className="p-0 gap-0">
                    <Input
                        autoFocus
                        placeholder="Type a command..."
                        value={query}
                        onValueChange={handleQueryChange}
                        onKeyDown={handleKeyDown}
                        classNames={{
                            inputWrapper:
                                "shadow-none border-b border-default-200 rounded-none rounded-t-xl bg-transparent px-4",
                        }}
                        variant="flat"
                    />
                    <div
                        ref={scrollRef}
                        className="overflow-y-auto max-h-72 pb-2"
                    >
                        {filteredCommands.length === 0 && (
                            <p className="text-sm text-default-400 text-center py-6">
                                No commands found
                            </p>
                        )}
                        {groupedItems.map((item) => {
                            if (item.type === "header") {
                                return (
                                    <p
                                        key={`header-${item.group}`}
                                        className="text-xs font-medium text-default-400 px-3 pt-3 pb-1"
                                    >
                                        {item.group}
                                    </p>
                                );
                            }

                            const { cmd, idx } = item;
                            const isSelected = selectedIndex === idx;
                            const itemClasses = `
                                w-full
                                flex items-center gap-3 px-3 py-2
                                text-sm text-left
                                rounded-lg
                                cursor-pointer
                                ${isSelected ? "bg-default-100" : "hover:bg-default-50"}
                            `;

                            return (
                                <button
                                    key={cmd.id}
                                    type="button"
                                    data-index={idx}
                                    className={itemClasses}
                                    onClick={() => execute(cmd)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <span className="text-default-500 shrink-0">
                                        {cmd.icon}
                                    </span>
                                    {cmd.label}
                                </button>
                            );
                        })}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
