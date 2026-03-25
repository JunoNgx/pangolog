"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { shortcutsAction } from "@/lib/shortcutsAction";

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
                description: "Toggle Small Dimes / Big Bucks",
            },
            {
                keys: ["Ctrl/Cmd", "Shift", "I"],
                description: 'Toggle "Include Big Bucks"',
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
                description: "Toggle Small Dimes",
            },
            {
                keys: ["Ctrl/Cmd", "Shift", "I"],
                description: "Toggle Big Bucks",
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

function Kbd({ children }: { children: React.ReactNode }) {
    return (
        <kbd
            className={`
                /* CONTAINER */
                inline-block

                /* CONTENT STYLES */
                font-mono text-xs

                /* VISUAL EFFECTS */
                bg-default-100 border border-default-200 rounded px-1.5 py-0.5
            `}
        >
            {children}
        </kbd>
    );
}

export function ShortcutsDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    useEffect(() => shortcutsAction.register(open), [open]);
    useHotkey("/", toggle, { ctrlOrMeta: true });

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            size="md"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="text-base">
                    Keyboard shortcuts
                </ModalHeader>
                <ModalBody className="pb-6 gap-6">
                    {SHORTCUT_GROUPS.map((group) => (
                        <div key={group.title}>
                            <p className="text-xs font-medium text-default-400 uppercase tracking-wide mb-2">
                                {group.title}
                            </p>
                            <ul className="flex flex-col gap-2">
                                {group.shortcuts.map((shortcut) => (
                                    <li
                                        key={shortcut.description}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <span className="text-sm text-default-600">
                                            {shortcut.description}
                                        </span>
                                        <span className="flex items-center gap-1 shrink-0">
                                            {shortcut.keys.map((key) => (
                                                <Kbd key={key}>{key}</Kbd>
                                            ))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
