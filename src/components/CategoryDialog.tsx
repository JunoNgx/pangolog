"use client";

import {
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";
import { EmojiPicker, type EmojiPickerListComponents } from "frimousse";
import { Shuffle } from "lucide-react";
import { type SubmitEventHandler, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { DialogFooter } from "@/components/DialogFooter";
import type { Category } from "@/lib/db/types";
import {
    useCreateCategory,
    useDeleteCategory,
    useRestoreCategory,
    useUpdateCategory,
} from "@/lib/hooks/useCategories";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { showDeleteToast } from "@/lib/utils";

// biome-ignore-start format: Formatting is intentional
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
// biome-ignore-end format: Formatting is intentional

function randomEmoji() {
    return EMOJI_DEFAULTS[Math.floor(Math.random() * EMOJI_DEFAULTS.length)];
}

function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;
}

import { FORM_MODAL_CLASS_NAMES } from "@/lib/constants";

const iconTriggerClasses = `
    rounded-lg
    h-10 flex items-center justify-center px-3
    bg-default-100
    hover:bg-default-200 transition-colors cursor-pointer
`;

const emojiPickerRootClasses = `
    w-75 h-90 rounded-lg overflow-hidden
    flex flex-col
    bg-content1 text-foreground
`;

const emojiPickerSearchClasses = `
    mx-2 mt-2
    rounded-md px-2.5 py-2
    bg-default-100 text-sm text-foreground placeholder:text-foreground-400
    outline-none focus:bg-default-200
`;

const emojiButtonClasses = `
    size-9
    flex items-center justify-center
    text-lg rounded-md
    data-active:bg-default-200 hover:bg-default-100
`;

const colourTriggerClasses = `
    flex-1 rounded-lg
    flex items-center gap-3 px-3 py-2
    bg-default-100
    hover:bg-default-200 transition-colors cursor-pointer
`;

const randomColourButtonClasses = `
    size-10 shrink-0 rounded-lg
    flex items-center justify-center
    bg-default-100 text-default-500
    hover:bg-default-200 transition-colors cursor-pointer
`;

const emojiPickerComponents: EmojiPickerListComponents = {
    CategoryHeader: ({ category: cat, ...props }) => (
        <div
            className="text-foreground-500 bg-content1 px-3 pt-3 pb-1.5 text-xs font-medium"
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
        <button type="button" className={emojiButtonClasses} {...props}>
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
            <span className="text-foreground-500 text-xs">Icon</span>
            <Popover
                placement="bottom-start"
                isOpen={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
            >
                <PopoverTrigger>
                    <button
                        type="button"
                        className={iconTriggerClasses}
                        aria-label="Choose icon"
                    >
                        <span className="text-xl">{icon}</span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <EmojiPicker.Root
                        onEmojiSelect={handleEmojiSelect}
                        className={emojiPickerRootClasses}
                    >
                        <EmojiPicker.Search
                            className={emojiPickerSearchClasses}
                        />
                        <EmojiPicker.Viewport className="relative flex-1 outline-none">
                            <EmojiPicker.Loading className="text-foreground-400 absolute inset-0 flex items-center justify-center text-sm">
                                Loading...
                            </EmojiPicker.Loading>
                            <EmojiPicker.Empty className="text-foreground-400 absolute inset-0 flex items-center justify-center text-sm">
                                No emoji found.
                            </EmojiPicker.Empty>
                            <EmojiPicker.List
                                className="pb-1.5 select-none"
                                components={emojiPickerComponents}
                            />
                        </EmojiPicker.Viewport>
                    </EmojiPicker.Root>
                </PopoverContent>
            </Popover>
        </div>
    );

    const colourPickerSection = (
        <div className="flex w-2/3 flex-col gap-1">
            <span className="text-foreground-500 text-xs">Colour</span>
            <div className="flex gap-2">
                <Popover placement="bottom-end">
                    <PopoverTrigger>
                        <button
                            type="button"
                            className={colourTriggerClasses}
                            aria-label={`Choose colour, currently ${colour}`}
                        >
                            <div
                                className="size-6 shrink-0 rounded-full"
                                style={{ backgroundColor: colour }}
                            />
                            <span className="text-foreground-500 text-sm">
                                {colour}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="flex flex-col gap-2 p-2">
                            <HexColorPicker
                                color={colour}
                                onChange={setColour}
                                style={{ width: "100%" }}
                            />
                            <div className="flex gap-2">
                                <Input
                                    label="Hex"
                                    size="sm"
                                    value={colour}
                                    onValueChange={handleColourHexChange}
                                    maxLength={7}
                                    className="flex-1"
                                />
                                <div
                                    className="flex-1 rounded"
                                    style={{ backgroundColor: colour }}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <button
                    type="button"
                    onClick={() => setColour(randomHexColor())}
                    className={randomColourButtonClasses}
                    aria-label="Random colour"
                >
                    <Shuffle size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNames={FORM_MODAL_CLASS_NAMES}
        >
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {isEditing ? "Edit Category" : "New Category"}
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <Input
                            label="Name"
                            value={name}
                            onValueChange={setName}
                            isRequired
                            autoFocus
                        />
                        <div className="flex justify-between">
                            {emojiPickerSection}
                            {colourPickerSection}
                        </div>
                        <Checkbox
                            isSelected={isBuckOnly}
                            onValueChange={setIsBuckOnly}
                        >
                            Big-buck only
                        </Checkbox>
                        {!isExpenseOnlyMode && (
                            <Checkbox
                                isSelected={isIncomeOnly}
                                onValueChange={setIsIncomeOnly}
                            >
                                Income only
                            </Checkbox>
                        )}
                    </ModalBody>
                    <DialogFooter
                        isEditing={isEditing}
                        onCancel={onClose}
                        onDelete={isEditing ? handleDelete : undefined}
                        isSubmitting={isPending}
                        isDeleting={deleteCategory.isPending}
                    />
                </form>
            </ModalContent>
        </Modal>
    );
}
