"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { type SubmitEventHandler, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { Category } from "@/lib/db/types";
import {
    useCreateCategory,
    useDeleteCategory,
    useUpdateCategory,
} from "@/lib/hooks/useCategories";

// biome-ignore-start format: Formatting is intentional
const EMOJI_DEFAULTS = [
    "😀","😎","🤩","🥳","😍","🤔","😤","🥹",
    "🐶","🐱","🦊","🐼","🦁","🐸","🐙","🦋",
    "🍕","🍣","🍜","🍎","🍓","🧁","🍩","☕",
    "⚽","🎮","🎵","🎨","📚","🏋","🎯","🚀",
    "💰","💳","🏠","🚗","✈️","🌍","🌈","⚡",
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

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
}

export function CategoryDialog({
    isOpen,
    onClose,
    category,
}: CategoryDialogProps) {
    const [name, setName] = useState("");
    const [colour, setColour] = useState(randomHexColor);
    const [icon, setIcon] = useState(randomEmoji());

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isIncomeOnly, setIsIncomeOnly] = useState(false);
    const [isBuckOnly, setIsBuckOnly] = useState(false);
    const { resolvedTheme } = useTheme();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

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

    function handleEmojiSelect(emoji: { native: string }) {
        setIcon(emoji.native);
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

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const input = {
            name,
            colour,
            icon,
            priority: category?.priority ?? 0,
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

        createCategory.mutate(input, { onSuccess: handleClose });
    };

    const isPending = createCategory.isPending || updateCategory.isPending;

    function handleDelete() {
        if (!category) return;
        deleteCategory.mutate(category.id, { onSuccess: handleClose });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} classNames={{ closeButton: "cursor-pointer" }}>
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
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-foreground-500">
                                    Icon
                                </span>
                                <Popover
                                    placement="bottom-start"
                                    isOpen={isEmojiPickerOpen}
                                    onOpenChange={setIsEmojiPickerOpen}
                                >
                                    <PopoverTrigger>
                                        <button
                                            type="button"
                                            className={`
                                                rounded-lg
                                                flex items-center justify-center px-3 py-2
                                                bg-default-100
                                                hover:bg-default-200 transition-colors cursor-pointer
                                            `}
                                        >
                                            <span className="text-xl">
                                                {icon}
                                            </span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Picker
                                            data={data}
                                            theme={
                                                resolvedTheme === "dark"
                                                    ? "dark"
                                                    : "light"
                                            }
                                            onEmojiSelect={handleEmojiSelect}
                                            previewPosition="none"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex w-1/2 flex-col gap-1">
                                <span className="text-xs text-foreground-500">
                                    Colour
                                </span>
                                <Popover placement="bottom-end">
                                    <PopoverTrigger>
                                        <button
                                            type="button"
                                            className={`
                                                w-full rounded-lg
                                                flex items-center gap-3 px-3 py-2
                                                bg-default-100
                                                hover:bg-default-200 transition-colors cursor-pointer
                                            `}
                                        >
                                            <div
                                                className={`
                                                    size-6 shrink-0 rounded-full
                                                    border border-default-300
                                                `}
                                                style={{
                                                    backgroundColor: colour,
                                                }}
                                            />
                                            <span className="text-sm text-foreground-500">
                                                {colour}
                                            </span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <div className="flex flex-col gap-2 p-2">
                                            <HexColorPicker
                                                color={colour}
                                                onChange={setColour}
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    label="Hex"
                                                    size="sm"
                                                    value={colour}
                                                    onValueChange={(v) =>
                                                        setColour(
                                                            v.startsWith("#")
                                                                ? v
                                                                : `#${v}`,
                                                        )
                                                    }
                                                    maxLength={7}
                                                    className="w-1/2"
                                                />
                                                <div
                                                    className="w-1/2 rounded"
                                                    style={{
                                                        backgroundColor: colour,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <Checkbox
                            isSelected={isIncomeOnly}
                            onValueChange={setIsIncomeOnly}
                        >
                            Income only
                        </Checkbox>
                        <Checkbox
                            isSelected={isBuckOnly}
                            onValueChange={setIsBuckOnly}
                        >
                            Big-buck only
                        </Checkbox>
                    </ModalBody>
                    <ModalFooter>
                        {isEditing && (
                            <Button
                                variant="light"
                                color="danger"
                                isLoading={deleteCategory.isPending}
                                onPress={handleDelete}
                                className="mr-auto"
                            >
                                Delete
                            </Button>
                        )}
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isPending}
                        >
                            {isEditing ? "Save" : "Create"}
                        </Button>
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
