"use client";

import { Button } from "@heroui/react";
import { useCallback, useState } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryList } from "./CategoryList";

export default function CategoriesPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });

    return (
        <div>
            <h2 className="font-mono text-xl font-bold mb-4">Categories</h2>
            <CategoryList />
            <Button
                color="primary"
                className="fixed bottom-20 md:bottom-6 right-6 z-50 h-14 w-14 min-w-0 text-2xl"
                onPress={() => setIsCreateOpen(true)}
            >
                +
            </Button>
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
