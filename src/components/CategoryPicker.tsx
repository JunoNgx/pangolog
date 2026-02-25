"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/lib/db/types";

const COLLAPSED_LIMIT = 10;

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
    const [isExpanded, setIsExpanded] = useState(false);

    const hasMore = categories.length > COLLAPSED_LIMIT;
    const displayedCategories = isExpanded
        ? categories
        : categories.slice(0, COLLAPSED_LIMIT);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-default-500">Category</p>
                {onAdd && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className={`
                            rounded px-1.5 py-0.5
                            flex items-center gap-1
                            text-xs text-default-400
                            hover:text-default-600 hover:bg-default-100 transition-colors cursor-pointer
                        `}
                    >
                        <Plus size={12} />
                        Add
                    </button>
                )}
            </div>
            {categories.length === 0 && (
                <p className="text-sm text-default-400">
                    {onAdd
                        ? "No categories yet. Press Add to create one."
                        : "No categories available. Add one from the Categories menu."}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                {displayedCategories.map((cat) => (
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
                {hasMore && (
                    <Button
                        size="sm"
                        variant="light"
                        onPress={() => setIsExpanded((prev) => !prev)}
                    >
                        {isExpanded
                            ? "Show less"
                            : `+${categories.length - COLLAPSED_LIMIT} more`}
                    </Button>
                )}
            </div>
        </div>
    );
}
