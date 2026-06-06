"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { ChipLabel } from "@/components/ChipLabel";
import { MainListContainer } from "@/components/MainListContainer";
import type { Category } from "@/lib/db/types";
import { useCategories, useReorderCategories } from "@/lib/hooks/useCategories";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";

interface SortableCategoryItemProps {
    cat: Category;
    index: number;
    onEdit: (cat: Category) => void;
    isDragEnabled: boolean;
}

function SortableCategoryItem({
    cat,
    index,
    onEdit,
    isDragEnabled,
}: SortableCategoryItemProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: cat.id,
        index,
        group: "categories",
    });

    return (
        <li
            ref={ref}
            style={{ borderLeftColor: cat.colour }}
            className={`bg-background hover:border-foreground flex items-center rounded-none border-b border-l-4 transition ${isDragging ? "opacity-50" : ""} `}
        >
            <button
                type="button"
                onClick={() => onEdit(cat)}
                className="focus:ring-accent flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none focus:ring-offset-2 focus-visible:ring-2"
            >
                <span className="flex shrink-0 items-center gap-4">
                    <span className="text-xl leading-none">
                        {cat.icon || "·"}
                    </span>
                </span>
                <span className="flex-1">{cat.name}</span>
                {cat.isIncomeOnly && (
                    <ChipLabel className="text-green-600">INCOME</ChipLabel>
                )}
                {cat.isBuckOnly && (
                    <ChipLabel className="text-amber-500">BIG BUCK</ChipLabel>
                )}
            </button>
            {isDragEnabled && (
                <button
                    type="button"
                    ref={handleRef}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Drag to reorder ${cat.name}`}
                    className="text-muted mr-2 cursor-grab border-0 bg-transparent py-3 select-none active:cursor-grabbing"
                >
                    <GripVertical />
                </button>
            )}
        </li>
    );
}

export function CategoryList() {
    const { data: categories } = useCategories();
    const reorderCategories = useReorderCategories();
    const { isCategoryAlphabetical } = useProfileSettingsStore();
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

    if (!categories?.length) {
        return (
            <>
                <p className="text-muted py-12 text-center">
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

    const alphabeticalList = (
        <MainListContainer className="gap-2">
            {categories.map((cat) => (
                <li
                    key={cat.id}
                    className="bg-background hover:border-foreground flex items-center rounded-none border-b border-l-4 transition-[border-color]"
                    style={{ borderLeftColor: cat.colour }}
                >
                    <button
                        type="button"
                        onClick={() => handleEdit(cat)}
                        className="focus:ring-accent flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none focus:ring-2 focus:ring-offset-2"
                    >
                        <span className="flex shrink-0 items-center gap-4">
                            <span className="text-xl leading-none">
                                {cat.icon || "·"}
                            </span>
                        </span>
                        <span className="flex-1">{cat.name}</span>
                        {cat.isIncomeOnly && (
                            <ChipLabel className="text-green-600">
                                INCOME
                            </ChipLabel>
                        )}
                        {cat.isBuckOnly && (
                            <ChipLabel className="text-amber-500">
                                BIG BUCK
                            </ChipLabel>
                        )}
                    </button>
                </li>
            ))}
        </MainListContainer>
    );

    const customSortList = (
        <DragDropProvider onDragEnd={handleDragEnd}>
            <MainListContainer className="gap-2">
                {categories.map((cat, index) => (
                    <SortableCategoryItem
                        key={cat.id}
                        cat={cat}
                        index={index}
                        onEdit={handleEdit}
                        isDragEnabled={true}
                    />
                ))}
            </MainListContainer>
        </DragDropProvider>
    );

    return (
        <>
            {isCategoryAlphabetical ? alphabeticalList : customSortList}
            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                category={editingCategory}
            />
        </>
    );
}
