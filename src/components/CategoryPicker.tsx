"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
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
    customOptionNotice?: string;
}

export function CategoryPicker({
    categories,
    selectedId,
    onChange,
    onAdd,
    customOption,
    customOptionNotice,
}: CategoryPickerProps) {
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
            {customOptionNotice && (
                <p className="text-muted mb-2 text-sm">{customOptionNotice}</p>
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
                    >
                        <span>{customOption.label}</span>
                    </Button>
                )}
                {categories.map((cat, index) => (
                    <Button
                        key={cat.id}
                        id={
                            index === 0 && !customOption
                                ? "first-category"
                                : undefined
                        }
                        className="h-7 gap-1.5 rounded-md px-2 sm:h-9 sm:rounded-lg"
                        size="sm"
                        variant={selectedId === cat.id ? "primary" : "outline"}
                        onPress={() =>
                            onChange(selectedId === cat.id ? null : cat.id)
                        }
                    >
                        <span
                            className="inline-block h-5 w-1 sm:h-6"
                            style={{ backgroundColor: cat.colour }}
                        />
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
