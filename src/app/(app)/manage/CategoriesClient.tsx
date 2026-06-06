"use client";

import { useCallback, useEffect, useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { CategoryList } from "./CategoryList";
import { ManageSectionHeader } from "./ManageSectionHeader";

export default function CategoriesClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { hasMod: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const { isCategoryAlphabetical, setIsCategoryAlphabetical } =
        useProfileSettingsStore();

    return (
        <div>
            <ManageSectionHeader
                title="Categories"
                createLabel="Category"
                onCreate={() => setIsCreateOpen(true)}
            >
                <ToggleSwitch
                    label="Sort by"
                    shouldShowLabel={true}
                    leftLabel="Custom order"
                    rightLabel="Alphabetical"
                    isSelectingRight={isCategoryAlphabetical}
                    onValueChange={setIsCategoryAlphabetical}
                />
            </ManageSectionHeader>
            <DemoDataBanner />
            <CategoryList />
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
