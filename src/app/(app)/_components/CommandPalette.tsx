"use client";

import { Input, Modal } from "@heroui/react";
import {
    BookOpen,
    Download,
    Feather,
    Keyboard,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    commandPaletteCreateActions,
    commandPaletteShortcutsActions,
} from "@/lib/commandPaletteActionRegistry";
import { exportJson } from "@/lib/export";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useSyncFn } from "@/lib/hooks/useSync";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";

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

const THEME_OPTIONS = [
    { value: "light" as const, label: "Switch to light theme", Icon: Sun },
    { value: "dark" as const, label: "Switch to dark theme", Icon: Moon },
    {
        value: "system" as const,
        label: "Switch to system theme",
        Icon: Monitor,
    },
];

export function CommandPalette({ children }: { children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isConnected } = useSyncProvider();
    const { sync } = useSyncFn();
    const { theme, setTheme } = useTheme();

    const open = useCallback(() => {
        if (isOpen) return;
        setIsOpen(true);
        setQuery("");
        setSelectedIndex(0);
    }, [isOpen]);

    const close = useCallback(() => setIsOpen(false), []);

    useHotkey("k", open, { hasMod: true });

    const goToSettings = useCallback(() => router.push("/settings"), [router]);
    useHotkey(".", goToSettings, { hasMod: true });

    const NAV_ROUTES = ["/log", "/summary", "/manage", "/settings"];

    const goToNextRoute = useCallback(() => {
        const currentIndex = NAV_ROUTES.indexOf(pathname);
        const nextIndex = (currentIndex + 1) % NAV_ROUTES.length;
        router.push(NAV_ROUTES[nextIndex]);
    }, [pathname, router]);

    const goToPrevRoute = useCallback(() => {
        const currentIndex = NAV_ROUTES.indexOf(pathname);
        const prevIndex =
            (currentIndex - 1 + NAV_ROUTES.length) % NAV_ROUTES.length;
        router.push(NAV_ROUTES[prevIndex]);
    }, [pathname, router]);

    useHotkey("]", goToNextRoute, { hasMod: true });
    useHotkey("[", goToPrevRoute, { hasMod: true });

    const createCommand = useMemo((): Command | null => {
        if (pathname === "/log") {
            return {
                id: "create",
                group: "Create",
                label: "New transaction",
                icon: <Plus size={16} />,
                action: () => commandPaletteCreateActions.trigger(),
            };
        }
        if (pathname === "/manage") {
            const tab = searchParams.get("tab") ?? "categories";
            return {
                id: "create",
                group: "Create",
                label:
                    tab === "recurring" ? "New recurring rule" : "New category",
                icon: <Plus size={16} />,
                action: () => commandPaletteCreateActions.trigger(),
            };
        }
        return null;
    }, [pathname, searchParams]);

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
                id: "nav-summary",
                group: "Navigate",
                label: "Go to Summary",
                icon: <PieChart size={16} />,
                action: () => router.push("/summary"),
            },
            {
                id: "nav-categories",
                group: "Navigate",
                label: "Go to Manage > Categories",
                icon: <Tag size={16} />,
                action: () => router.push("/manage?tab=categories"),
            },
            {
                id: "nav-recurring",
                group: "Navigate",
                label: "Go to Manage > Recurring Rules",
                icon: <Repeat size={16} />,
                action: () => router.push("/manage?tab=recurring"),
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
                : [
                      {
                          id: "connect-drive",
                          group: "Actions",
                          label: "Connect Google Drive to sync",
                          icon: <RefreshCw size={16} />,
                          action: () => router.push("/settings"),
                      },
                  ]),
            {
                id: "shortcuts",
                group: "Actions",
                label: "Show keyboard shortcuts",
                icon: <Keyboard size={16} />,
                action: () => commandPaletteShortcutsActions.trigger(),
            },
            {
                id: "export",
                group: "Actions",
                label: "Export JSON",
                icon: <Download size={16} />,
                action: () => exportJson(true),
            },
            ...THEME_OPTIONS.filter((t) => t.value !== theme).map((t) => ({
                id: `theme-${t.value}`,
                group: "Actions",
                label: t.label,
                icon: <t.Icon size={16} />,
                action: () => setTheme(t.value),
            })),
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
    const modalBody = (
        <>
            <Input
                autoFocus
                placeholder="Type a command..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-none border-0 border-b bg-transparent shadow-none"
            />
            <div ref={scrollRef} className="max-h-128 overflow-y-auto pb-2">
                {filteredCommands.length === 0 && (
                    <p className="text-muted py-6 text-center text-sm">
                        No commands found
                    </p>
                )}
                {groupedItems.map((item) => {
                    if (item.type === "header") {
                        return (
                            <p
                                key={`header-${item.group}`}
                                className="text-muted px-3 pt-3 pb-1 text-xs font-medium"
                            >
                                {item.group}
                            </p>
                        );
                    }

                    const { cmd, idx } = item;
                    const isSelected = selectedIndex === idx;
                    return (
                        <button
                            key={cmd.id}
                            type="button"
                            data-index={idx}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${isSelected ? "bg-surface-secondary" : "hover:bg-surface-tertiary"}`}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                        >
                            <span className="text-muted shrink-0">
                                {cmd.icon}
                            </span>
                            {cmd.label}
                        </button>
                    );
                })}
            </div>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (open) setIsOpen(true);
                else close();
            }}
        >
            {children && (
                <Modal.Trigger className="block" tabIndex={-1}>
                    {children}
                </Modal.Trigger>
            )}
            <Modal.Backdrop>
                <Modal.Container size="sm">
                    <Modal.Dialog className="max-w-md">
                        <Modal.Body className="gap-0">{modalBody}</Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
