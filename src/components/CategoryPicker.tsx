"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import type { Category } from "@/lib/db/types";

interface CategoryPickerProps {
    categories: Category[];
    selectedId: string | null;
    onChange: (id: string | null) => void;
    onAdd?: () => void;
}

export function CategoryPicker({
    categories,
    selectedId,
    onChange,
    onAdd,
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
            {categories.length === 0 && (
                <p className="text-muted text-sm">
                    {onAdd
                        ? "No categories yet. Press Add to create one."
                        : "No categories available. Add one from the Categories menu."}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        className="pl-2"
                        size="sm"
                        variant={selectedId === cat.id ? "primary" : "tertiary"}
                        onPress={() =>
                            onChange(selectedId === cat.id ? null : cat.id)
                        }
                    >
                        <span
                            className="inline-block h-6 w-1"
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
