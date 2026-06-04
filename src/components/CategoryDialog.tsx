"use client";

import { Button, Checkbox, Input, Label, Modal, Popover } from "@heroui/react";
import { EmojiPicker, type EmojiPickerListComponents } from "frimousse";
import { Shuffle } from "lucide-react";
import { type SubmitEventHandler, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { DialogFooter } from "@/components/DialogFooter";
import type { Category } from "@/lib/db/types";
import {
    useCreateCategory,
    useDeleteCategory,
    useRestoreCategory,
    useUpdateCategory,
} from "@/lib/hooks/useCategories";
import { useDelayedAutoFocus } from "@/lib/hooks/useDelayedAutoFocus";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { showDeleteToast } from "@/lib/utils";

const EMOJI_DEFAULTS = [
    "🍽️",
    "🛒",
    "☕",
    "🍺",
    "🍔",
    "🍜",
    "🍕",
    "🥗",
    "🎮",
    "🎬",
    "🎵",
    "📖",
    "🎁",
    "🎭",
    "🎨",
    "🎯",
    "✈️",
    "🚗",
    "🚌",
    "⛽",
    "🧳",
    "🚕",
    "🛵",
    "🚲",
    "🏠",
    "💡",
    "💊",
    "🏋️",
    "👗",
    "💄",
    "🐾",
    "🌿",
    "💰",
    "💳",
    "💼",
    "📱",
    "💻",
    "🎓",
    "🏦",
    "📦",
];

function randomEmoji() {
    return EMOJI_DEFAULTS[Math.floor(Math.random() * EMOJI_DEFAULTS.length)];
}

function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;
}

const emojiPickerComponents: EmojiPickerListComponents = {
    CategoryHeader: ({ category: cat, ...props }) => (
        <div
            className="text-muted bg-surface px-3 pt-3 pb-1.5 text-xs font-medium"
            {...props}
        >
            {cat.label}
        </div>
    ),
    Row: ({ children, ...props }) => (
        <div className="px-1.5" {...props}>
            {children}
        </div>
    ),
    Emoji: ({ emoji: e, ...props }) => (
        <button
            type="button"
            className="data-active:bg-surface-secondary hover:bg-surface flex size-9 items-center justify-center rounded-md text-lg"
            {...props}
        >
            {e.emoji}
        </button>
    ),
};

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
    onCreated?: (id: string) => void;
}

export function CategoryDialog({
    isOpen,
    onClose,
    category,
    onCreated,
}: CategoryDialogProps) {
    const [name, setName] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    useDelayedAutoFocus(isOpen, nameInputRef);
    const [colour, setColour] = useState(randomHexColor);
    const [icon, setIcon] = useState(randomEmoji());

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isIncomeOnly, setIsIncomeOnly] = useState(false);
    const [isBuckOnly, setIsBuckOnly] = useState(false);
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const restoreCategory = useRestoreCategory();

    const isEditing = !!category;

    useEffect(() => {
        if (category) {
            setName(category.name);
            setColour(category.colour);
            setIcon(category.icon);

            setIsIncomeOnly(category.isIncomeOnly);
            setIsBuckOnly(category.isBuckOnly);
        } else {
            setName("");
            setColour(randomHexColor());
            setIcon(randomEmoji());

            setIsIncomeOnly(false);
            setIsBuckOnly(false);
        }
    }, [category]);

    function handleEmojiSelect({ emoji }: { emoji: string }) {
        setIcon(emoji);
        setIsEmojiPickerOpen(false);
    }

    function handleClose() {
        setName("");
        setColour(randomHexColor());
        setIcon(randomEmoji());
        setIsEmojiPickerOpen(false);
        setIsIncomeOnly(false);
        setIsBuckOnly(false);
        onClose();
    }

    function handleColourHexChange(v: string) {
        setColour(v.startsWith("#") ? v : `#${v}`);
    }

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const input = {
            name,
            colour,
            icon,
            priority: category?.priority ?? -1,
            isIncomeOnly,
            isBuckOnly,
        };

        if (isEditing) {
            updateCategory.mutate(
                { id: category.id, input },
                { onSuccess: handleClose },
            );
            return;
        }

        createCategory.mutate(input, {
            onSuccess: (created) => {
                handleClose();
                onCreated?.(created.id);
            },
        });
    };

    const { isExpenseOnlyMode } = useProfileSettingsStore();
    const isPending = createCategory.isPending || updateCategory.isPending;

    function handleDelete() {
        if (!category) return;
        const id = category.id;
        deleteCategory.mutate(id, {
            onSuccess: () => {
                handleClose();
                showDeleteToast("Category", () => restoreCategory.mutate(id));
            },
        });
    }

    const emojiPickerSection = (
        <div className="flex flex-col gap-1">
            <span className="text-foreground text-sm">Icon</span>
            <Popover
                isOpen={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
            >
                <Popover.Trigger>
                    <Button
                        variant="tertiary"
                        aria-label="Choose icon"
                        className="h-10"
                    >
                        <span className="text-xl">{icon}</span>
                    </Button>
                </Popover.Trigger>
                <Popover.Content placement="bottom start" className="p-0">
                    <Popover.Dialog>
                        <EmojiPicker.Root
                            onEmojiSelect={handleEmojiSelect}
                            className="bg-surface text-foreground flex h-90 w-75 flex-col overflow-hidden rounded-lg"
                        >
                            <EmojiPicker.Search className="bg-surface text-foreground placeholder:text-muted focus:bg-surface-secondary mx-2 mt-2 rounded-md px-2.5 py-2 text-sm outline-none" />
                            <EmojiPicker.Viewport className="relative flex-1 outline-none">
                                <EmojiPicker.Loading className="text-muted absolute inset-0 flex items-center justify-center text-sm">
                                    Loading...
                                </EmojiPicker.Loading>
                                <EmojiPicker.Empty className="text-muted absolute inset-0 flex items-center justify-center text-sm">
                                    No emoji found.
                                </EmojiPicker.Empty>
                                <EmojiPicker.List
                                    className="pb-1.5 select-none"
                                    components={emojiPickerComponents}
                                />
                            </EmojiPicker.Viewport>
                        </EmojiPicker.Root>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        </div>
    );

    const colourPickerSection = (
        <div className="flex w-2/3 flex-col gap-1">
            <span className="text-foreground text-sm">Colour</span>
            <div className="flex gap-2">
                <Popover>
                    <Popover.Trigger className="flex-1">
                        <Button
                            variant="tertiary"
                            className="flex w-full justify-start gap-3 px-3 py-2"
                            aria-label={`Choose colour, currently ${colour}`}
                        >
                            <div
                                className="size-6 shrink-0 rounded-full"
                                style={{ backgroundColor: colour }}
                            />
                            <span className="text-muted text-sm">{colour}</span>
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content placement="bottom end">
                        <Popover.Dialog>
                            <div className="flex flex-col gap-2 p-2">
                                <HexColorPicker
                                    color={colour}
                                    onChange={setColour}
                                    style={{ width: "100%" }}
                                />
                                <div className="flex gap-2">
                                    <div className="flex flex-1 flex-col gap-1">
                                        <span>Hex</span>
                                        <Input
                                            value={colour}
                                            onChange={(e) =>
                                                handleColourHexChange(
                                                    e.target.value,
                                                )
                                            }
                                            maxLength={7}
                                            className="flex-1"
                                        />
                                    </div>
                                    <div
                                        className="flex-1 rounded"
                                        style={{ backgroundColor: colour }}
                                    />
                                </div>
                            </div>
                        </Popover.Dialog>
                    </Popover.Content>
                </Popover>
                <Button
                    variant="tertiary"
                    isIconOnly
                    onPress={() => setColour(randomHexColor())}
                    aria-label="Random colour"
                >
                    <Shuffle size={16} />
                </Button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <Modal.Trigger>
                <span hidden />
            </Modal.Trigger>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <div tabIndex={-1} className="sr-only" />
                        <Modal.CloseTrigger className="cursor-pointer" />
                        <form onSubmit={handleSubmit}>
                            <Modal.Header>
                                <Modal.Heading>
                                    {isEditing
                                        ? "Edit Category"
                                        : "New Category"}
                                </Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="name" className="sr-only">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        ref={nameInputRef}
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="flex justify-between pb-4">
                                    {emojiPickerSection}
                                    {colourPickerSection}
                                </div>
                                <Checkbox
                                    isSelected={isBuckOnly}
                                    onChange={setIsBuckOnly}
                                >
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <Checkbox.Content>
                                        <Label>Big-buck only</Label>
                                    </Checkbox.Content>
                                </Checkbox>
                                {!isExpenseOnlyMode && (
                                    <Checkbox
                                        isSelected={isIncomeOnly}
                                        onChange={setIsIncomeOnly}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label>Income only</Label>
                                        </Checkbox.Content>
                                    </Checkbox>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <DialogFooter
                                    isEditing={isEditing}
                                    onCancel={onClose}
                                    onDelete={
                                        isEditing ? handleDelete : undefined
                                    }
                                    isSubmitting={isPending}
                                    isDeleting={deleteCategory.isPending}
                                />
                            </Modal.Footer>
                        </form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
