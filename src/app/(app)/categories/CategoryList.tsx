"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Button, Chip, Skeleton } from "@heroui/react";
import { useState } from "react";
import type { Category } from "@/lib/db/types";
import {
    useCategories,
    useDeleteCategory,
    useReorderCategories,
} from "@/lib/hooks/useCategories";
import { CategoryDialog } from "./CategoryDialog";

interface SortableCategoryItemProps {
    cat: Category;
    index: number;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

function SortableCategoryItem({
    cat,
    index,
    onEdit,
    onDelete,
    isDeleting,
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
                rounded-lg px-4 py-3
                flex items-center gap-3
                bg-background
                border border-default-200
                ${isDragging ? "opacity-50" : ""}
            `}
        >
            <span
                ref={handleRef}
                className="text-default-400 cursor-grab active:cursor-grabbing select-none font-mono"
            >
                ⠿
            </span>
            <span className="text-xl">{cat.icon || "·"}</span>
            <span
                className="h-4 w-4 rounded-full shrink-0"
                style={{ backgroundColor: cat.colour }}
            />
            <span className="font-mono font-medium flex-1">{cat.name}</span>
            {cat.isIncomeOnly && (
                <Chip size="sm" variant="flat" color="success">
                    income
                </Chip>
            )}
            {cat.isBuckOnly && (
                <Chip size="sm" variant="flat" color="warning">
                    buck
                </Chip>
            )}
            <Button size="sm" variant="light" onPress={() => onEdit(cat)}>
                Edit
            </Button>
            <Button
                size="sm"
                variant="light"
                color="danger"
                isLoading={isDeleting}
                onPress={() => onDelete(cat.id)}
            >
                Delete
            </Button>
        </li>
    );
}

export function CategoryList() {
    const { data: categories, isLoading } = useCategories();
    const deleteCategory = useDeleteCategory();
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
            <ul className="flex flex-col gap-2">
                {["s1", "s2", "s3", "s4"].map((key) => (
                    <li
                        key={key}
                        className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 bg-background"
                    >
                        <Skeleton className="h-5 w-4 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 flex-1 rounded" />
                        <Skeleton className="h-8 w-12 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                    </li>
                ))}
            </ul>
        );
    }

    if (!categories?.length) {
        return (
            <>
                <p className="text-center text-default-400 py-12 font-mono">
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
                <ul className="flex flex-col gap-2">
                    {categories.map((cat, index) => (
                        <SortableCategoryItem
                            key={cat.id}
                            cat={cat}
                            index={index}
                            onEdit={handleEdit}
                            onDelete={(id) => deleteCategory.mutate(id)}
                            isDeleting={deleteCategory.isPending}
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
