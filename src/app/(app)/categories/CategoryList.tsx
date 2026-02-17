"use client";

import { Button, Chip, Spinner } from "@heroui/react";
import { useState } from "react";
import type { Category } from "@/lib/db/types";
import { useCategories, useDeleteCategory } from "@/lib/hooks/useCategories";
import { CategoryDialog } from "./CategoryDialog";

export function CategoryList() {
    const { data: categories, isLoading } = useCategories();
    const deleteCategory = useDeleteCategory();
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

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
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
            <ul className="flex flex-col gap-2">
                {categories.map((cat, index) => (
                    <li
                        key={cat.id}
                        className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3"
                    >
                        <span className="text-default-400 font-mono text-sm w-6 text-right">
                            {index + 1}
                        </span>
                        <span className="text-xl">{cat.icon || "·"}</span>
                        <span
                            className="h-4 w-4 rounded-full shrink-0"
                            style={{ backgroundColor: cat.colour }}
                        />
                        <span className="font-mono font-medium flex-1">
                            {cat.name}
                        </span>
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
                        <Button
                            size="sm"
                            variant="light"
                            onPress={() => handleEdit(cat)}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            isLoading={deleteCategory.isPending}
                            onPress={() => deleteCategory.mutate(cat.id)}
                        >
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                category={editingCategory}
            />
        </>
    );
}
