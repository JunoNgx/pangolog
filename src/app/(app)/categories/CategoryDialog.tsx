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
import { type FormEvent, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { Category } from "@/lib/db/types";
import {
    useCreateCategory,
    useUpdateCategory,
} from "@/lib/hooks/useCategories";

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
    const [colour, setColour] = useState("#6366f1");
    const [icon, setIcon] = useState("");

    const [isIncomeOnly, setIsIncomeOnly] = useState(false);
    const [isBuckOnly, setIsBuckOnly] = useState(false);
    const { resolvedTheme } = useTheme();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

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
            setColour("#6366f1");
            setIcon("");

            setIsIncomeOnly(false);
            setIsBuckOnly(false);
        }
    }, [category]);

    function handleSubmit(e: FormEvent) {
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
                { onSuccess: onClose },
            );
        } else {
            createCategory.mutate(input, { onSuccess: onClose });
        }
    }

    const isPending = createCategory.isPending || updateCategory.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                                <Popover placement="bottom-start">
                                    <PopoverTrigger>
                                        <button
                                            type="button"
                                            className={`
                                                rounded-lg

                                                flex items-center justify-center
                                                px-3 py-2

                                                bg-default-100

                                                hover:bg-default-200
                                                transition-colors cursor-pointer
                                            `}
                                        >
                                            <span className="text-xl">
                                                {icon || "😀"}
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
                                            onEmojiSelect={(emoji: {
                                                native: string;
                                            }) => setIcon(emoji.native)}
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

                                            flex items-center gap-3
                                            px-3 py-2

                                            bg-default-100

                                            hover:bg-default-200
                                            transition-colors cursor-pointer
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
                                            />
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
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            isLoading={isPending}
                        >
                            {isEditing ? "Save" : "Create"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
