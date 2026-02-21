"use client";

import { Button } from "@heroui/react";
import type { Category } from "@/lib/db/types";

interface CategoryPickerProps {
    categories: Category[];
    selectedId: string | null;
    onChange: (id: string | null) => void;
}

export function CategoryPicker({
    categories,
    selectedId,
    onChange,
}: CategoryPickerProps) {
    return (
        <div>
            <p className="text-sm text-default-500 mb-2">Category</p>
            {categories.length === 0 && (
                <p className="text-sm text-default-400">
                    No categories available. Add one from the Categories menu.
                </p>
            )}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        size="sm"
                        variant={selectedId === cat.id ? "solid" : "flat"}
                        color={selectedId === cat.id ? "primary" : "default"}
                        onPress={() =>
                            onChange(selectedId === cat.id ? null : cat.id)
                        }
                        endContent={
                            <span
                                className="h-3 w-3 rounded-full inline-block"
                                style={{ backgroundColor: cat.colour }}
                            />
                        }
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
