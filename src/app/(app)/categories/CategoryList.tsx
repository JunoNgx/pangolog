"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Skeleton } from "@heroui/react";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import type { Category } from "@/lib/db/types";
import { useCategories, useReorderCategories } from "@/lib/hooks/useCategories";
import { CategoryDialog } from "./CategoryDialog";

interface SortableCategoryItemProps {
    cat: Category;
    index: number;
    onEdit: (cat: Category) => void;
}

function SortableCategoryItem({
    cat,
    index,
    onEdit,
}: SortableCategoryItemProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: cat.id,
        index,
        group: "categories",
    });

    return (
        <li
            ref={ref}
            className={`
                rounded-lg
                flex items-center
                bg-background
                border border-default-200
                overflow-hidden
                ${isDragging ? "opacity-50" : ""}
            `}
        >
            <button
                type="button"
                onClick={() => onEdit(cat)}
                className="
                    flex-1 min-w-0 px-4 py-3 text-left
                    flex items-center gap-3
                    cursor-pointer hover:bg-default-50
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                "
            >
                <span className="flex items-center gap-4 shrink-0">
                    <span
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: cat.colour }}
                    />
                    <span className="text-xl leading-none">
                        {cat.icon || "·"}
                    </span>
                </span>
                <span className="flex-1">{cat.name}</span>
                {cat.isIncomeOnly && (
                    <span className={`ChipLabel text-green-600`}>INCOME</span>
                )}
                {cat.isBuckOnly && (
                    <span className={`ChipLabel text-amber-500`}>BIG BUCK</span>
                )}
            </button>
            <button
                type="button"
                ref={handleRef}
                onClick={(e) => e.stopPropagation()}
                className="py-3 pr-4 text-default-400 cursor-grab active:cursor-grabbing select-none bg-transparent border-0"
            >
                <GripVertical />
            </button>
        </li>
    );
}

export function CategoryList() {
    const { data: categories, isLoading } = useCategories();
    const reorderCategories = useReorderCategories();
    const [editingCategory, setEditingCategory] = useState<
        Category | undefined
    >();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    function handleEdit(category: Category) {
        setEditingCategory(category);
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingCategory(undefined);
    }

    // biome-ignore lint/suspicious/noExplicitAny: dnd-kit event typing is complex
    function handleDragEnd(event: any) {
        if (event.canceled || !categories) return;

        const reordered = move(categories, event);
        const updates = reordered.map((cat: Category, i: number) => ({
            id: cat.id,
            priority: i,
        }));
        reorderCategories.mutate(updates);
    }

    if (isLoading) {
        return (
            <ul className="MainListContainer gap-2">
                {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
                    <Skeleton key={key} className="h-12 w-full rounded-lg" />
                ))}
            </ul>
        );
    }

    if (!categories?.length) {
        return (
            <>
                <p className="text-center text-default-400 py-12">
                    No categories yet. Tap + to create one.
                </p>
                <CategoryDialog
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                    category={editingCategory}
                />
            </>
        );
    }

    return (
        <>
            <DragDropProvider onDragEnd={handleDragEnd}>
                <ul className="MainListContainer gap-2">
                    {categories.map((cat, index) => (
                        <SortableCategoryItem
                            key={cat.id}
                            cat={cat}
                            index={index}
                            onEdit={handleEdit}
                        />
                    ))}
                </ul>
            </DragDropProvider>
            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                category={editingCategory}
            />
        </>
    );
}
