"use client";

import { Modal } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Kbd } from "@/components/Kbd";
import { commandPaletteShortcutsActions } from "@/lib/commandPaletteActionRegistry";
import { useHotkey } from "@/lib/hooks/useHotkey";

type Shortcut = {
    keys: string[];
    description: string;
};

type ShortcutGroup = {
    title: string;
    shortcuts: Shortcut[];
};

const SHORTCUT_GROUPS: ShortcutGroup[] = [
    {
        title: "Universal",
        shortcuts: [
            { keys: ["Ctrl/Cmd", "K"], description: "Open command palette" },
            { keys: ["Ctrl/Cmd", "/"], description: "Show keyboard shortcuts" },
            { keys: ["Ctrl/Cmd", "]"], description: "Go to next page" },
            { keys: ["Ctrl/Cmd", "["], description: "Go to previous page" },
            { keys: ["Ctrl/Cmd", "."], description: "Go to Settings" },
        ],
    },
    {
        title: "Transaction view",
        shortcuts: [
            { keys: ["Ctrl/Cmd", "Enter"], description: "Open create dialog" },
            { keys: ["Ctrl/Cmd", "F"], description: "Enter search mode" },
            { keys: ["["], description: "Go to previous period" },
            { keys: ["]"], description: "Go to next period" },
            {
                keys: ["Ctrl/Cmd", "Shift", "U"],
                description: "Cycle display mode",
            },
            {
                keys: ["Ctrl/Cmd", "S"],
                description: "Manually trigger sync",
            },
        ],
    },
    {
        title: "Transaction dialog",
        shortcuts: [
            {
                keys: ["Ctrl/Cmd", "Enter"],
                description: "Submit form from anywhere in dialog",
            },
        ],
    },
    {
        title: "Summary view",
        shortcuts: [
            { keys: ["["], description: "Go to previous period" },
            { keys: ["]"], description: "Go to next period" },
            {
                keys: ["Ctrl/Cmd", "Shift", "Y"],
                description: "Switch monthly / yearly view",
            },
            {
                keys: ["Ctrl/Cmd", "Shift", "U"],
                description: "Cycle display mode",
            },
        ],
    },
    {
        title: "Categories / Recurring view",
        shortcuts: [
            { keys: ["Ctrl/Cmd", "Enter"], description: "Open create dialog" },
            {
                keys: ["Ctrl/Cmd", "Shift", "U"],
                description: "Switch between tabs",
            },
        ],
    },
];

export function ShortcutsDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    useEffect(() => {
        commandPaletteShortcutsActions.register(open);
        return () => commandPaletteShortcutsActions.unregister();
    }, [open]);
    useHotkey("/", toggle, { hasMod: true });

    return (
        <Modal>
            <Modal.Backdrop
                isOpen={isOpen}
                onOpenChange={(open) => { if (!open) close(); }}
            >
                <Modal.Container size="md" scroll="inside">
                    <Modal.Dialog>
                        <Modal.CloseTrigger className="cursor-pointer" />
                        <Modal.Header>
                            <Modal.Heading className="text-base">
                                Keyboard shortcuts
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="gap-6 pb-6">
                            {SHORTCUT_GROUPS.map((group) => (
                                <div key={group.title}>
                                    <p className="text-muted mb-2 text-xs font-medium tracking-wide uppercase">
                                        {group.title}
                                    </p>
                                    <ul className="flex flex-col gap-2">
                                        {group.shortcuts.map((shortcut) => (
                                            <li
                                                key={shortcut.description}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <span className="text-default-600 text-sm">
                                                    {shortcut.description}
                                                </span>
                                                <span className="flex shrink-0 items-center gap-1">
                                                    {shortcut.keys.map((key) => (
                                                        <Kbd key={key}>{key}</Kbd>
                                                    ))}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
