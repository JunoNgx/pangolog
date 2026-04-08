"use client";

import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { createAction } from "@/lib/createAction";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { CategoryList } from "./CategoryList";

export default function CategoriesClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });
    useEffect(
        () => createAction.register(openCreateDialog),
        [openCreateDialog],
    );

    const { isCategoryAlphabetical, setIsCategoryAlphabetical } =
        useProfileSettingsStore();

    return (
        <div>
            <div className="mt-2 mb-4">
                <ToggleSwitch
                    leftLabel="Custom order"
                    rightLabel="Alphabetical"
                    isSelectingRight={isCategoryAlphabetical}
                    onValueChange={setIsCategoryAlphabetical}
                />
            </div>
            <DemoDataBanner />
            <CategoryList />
            <div className="FloatingActionButtonContainer">
                <Tooltip
                    content={
                        <span className="text-center">Ctrl/Cmd + Enter</span>
                    }
                    placement="left"
                >
                    <Button
                        color="primary"
                        className="FloatingActionButton"
                        onPress={() => setIsCreateOpen(true)}
                    >
                        <Plus />
                        <span className="hidden md:inline">Category</span>
                    </Button>
                </Tooltip>
            </div>
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
