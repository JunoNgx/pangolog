"use client";

import { useCallback, useEffect, useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { CategoryList } from "./CategoryList";

export default function CategoriesClient() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const openCreateDialog = useCallback(() => setIsCreateOpen(true), []);
    useHotkey("Enter", openCreateDialog, { ctrlOrMeta: true });
    useEffect(() => {
        commandPaletteCreateActions.register(openCreateDialog);
        return () => commandPaletteCreateActions.unregister();
    }, [openCreateDialog]);

    const { isCategoryAlphabetical, setIsCategoryAlphabetical } =
        useProfileSettingsStore();

    return (
        <div>
            <ConfigWrapper>
                <div className="my-2">
                    <ToggleSwitch
                        label="Sort by"
                        shouldShowLabel={true}
                        leftLabel="Custom order"
                        rightLabel="Alphabetical"
                        isSelectingRight={isCategoryAlphabetical}
                        onValueChange={setIsCategoryAlphabetical}
                    />
                </div>
                <DemoDataBanner />
            </ConfigWrapper>
            <CategoryList />
            <FloatingActionButton
                label="Category"
                onPress={() => setIsCreateOpen(true)}
            />
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
