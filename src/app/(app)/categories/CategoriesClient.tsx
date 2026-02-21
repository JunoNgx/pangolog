"use client";

import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryList } from "./CategoryList";

export default function CategoriesClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });

    return (
        <div>
            <h2 className="text-xl font-bold mb-1">Categories</h2>
            <p className="text-sm text-default-400 mb-4">
                Drag to reorder. Order is reflected when choosing a category.
            </p>
            <CategoryList />
            <Tooltip
                content={
                    <span className="text-center">
                        Add a new category
                        <br />
                        (Ctrl/Cmd + Enter)
                    </span>
                }
                placement="left"
            >
                <Button
                    color="primary"
                    className="fixed bottom-20 md:bottom-6 right-6 z-50 h-14 w-14 min-w-0"
                    onPress={() => setIsCreateOpen(true)}
                >
                    <Plus />
                </Button>
            </Tooltip>
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
