"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { type KeyboardEvent, useRef } from "react";
import type { Category } from "@/lib/db/types";

interface CategoryPickerProps {
    categories: Category[];
    selectedId: string | null;
    onChange: (id: string | null) => void;
    onAdd?: () => void;
    customOption?: {
        id: string;
        label: string;
    };
    customOptionDescription?: string;
}

export function CategoryPicker({
    categories,
    selectedId,
    onChange,
    onAdd,
    customOption,
    customOptionDescription,
}: CategoryPickerProps) {
    const categoryButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const customOptionOffset = customOption ? 1 : 0;
    const categoryNames = [
        ...(customOption ? [customOption.label] : []),
        ...categories.map((category) => category.name),
    ];

    // Bug: Pressing Escape does not close the parent modal when a category
    //      button has focus.
    // Why: HeroUI Button stops keydown propagation, so the modal's Escape
    //      handler never receives the event.
    // Fix: Handle category typeahead on keyup. This leaves keydown available
    //      for HeroUI and the modal while preserving focus cycling.
    // Todo: Prefer keydown when HeroUI no longer blocks the modal's Escape
    //       handling through propagation.
    function handleCategoryKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
        if (document.activeElement !== event.currentTarget) {
            return;
        }

        const key = event.key.toLowerCase();
        const isSingleCharacterKey = key.length === 1;
        const isAsciiLetter = isSingleCharacterKey && key >= "a" && key <= "z";
        const isAsciiDigit = isSingleCharacterKey && key >= "0" && key <= "9";
        const isAsciiAlphanumericKey = isAsciiLetter || isAsciiDigit;

        if (!isAsciiAlphanumericKey) {
            return;
        }

        const matchingCategoryIndexes = categoryNames.reduce<number[]>(
            (categoryIndexes, categoryName, index) => {
                if (categoryName.toLowerCase().startsWith(key)) {
                    categoryIndexes.push(index);
                }

                return categoryIndexes;
            },
            [],
        );

        if (matchingCategoryIndexes.length === 0) {
            return;
        }

        const focusedCategoryIndex = categoryButtonRefs.current.indexOf(
            event.currentTarget,
        );
        const nextCategoryIndex =
            matchingCategoryIndexes.find(
                (categoryIndex) => categoryIndex > focusedCategoryIndex,
            ) ?? matchingCategoryIndexes[0];

        event.preventDefault();
        categoryButtonRefs.current[nextCategoryIndex]?.focus();
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <p className="text-foreground text-sm">Category</p>
                {onAdd && (
                    <Button variant="ghost" size="sm" onPress={onAdd}>
                        <Plus size={12} />
                        Add
                    </Button>
                )}
            </div>
            {customOptionDescription && (
                <p className="text-muted mb-2 text-sm">
                    {customOptionDescription}
                </p>
            )}
            {categories.length === 0 && (
                <p className="text-muted text-sm">
                    {onAdd
                        ? "No categories yet. Press Add to create one."
                        : "No categories available. Add one from the Categories menu."}
                </p>
            )}
            <div className="flex flex-wrap gap-2 pb-2">
                {customOption && (
                    <Button
                        id="first-category"
                        className="h-7 gap-1.5 rounded-md px-2 sm:h-9 sm:rounded-lg"
                        size="sm"
                        variant={
                            selectedId === customOption.id
                                ? "primary"
                                : "outline"
                        }
                        onPress={() =>
                            onChange(
                                selectedId === customOption.id
                                    ? null
                                    : customOption.id,
                            )
                        }
                        onKeyUp={handleCategoryKeyUp}
                        ref={(button) => {
                            categoryButtonRefs.current[0] = button;
                        }}
                    >
                        <span>{customOption.label}</span>
                    </Button>
                )}
                {categories.map((category, index) => (
                    <Button
                        key={category.id}
                        ref={(button) => {
                            categoryButtonRefs.current[
                                index + customOptionOffset
                            ] = button;
                        }}
                        id={
                            category.id === categories[0]?.id && !customOption
                                ? "first-category"
                                : undefined
                        }
                        className="h-7 gap-1.5 rounded-md px-2 sm:h-9 sm:rounded-lg"
                        size="sm"
                        variant={
                            selectedId === category.id ? "primary" : "outline"
                        }
                        onPress={() =>
                            onChange(
                                selectedId === category.id ? null : category.id,
                            )
                        }
                        onKeyUp={handleCategoryKeyUp}
                    >
                        <span
                            className="inline-block h-5 w-1 sm:h-6"
                            style={{ backgroundColor: category.colour }}
                        />
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
