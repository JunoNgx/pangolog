"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { commandPaletteCreateActions } from "@/lib/commandPaletteActionRegistry";
import { useHotkey } from "@/lib/hooks/useHotkey";
import { useProfileSettingsStore } from "@/lib/store/useProfileSettingsStore";
import { CategoryList } from "./CategoryList";

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
            <ConfigWrapper className="mt-4 mb-4">
                <div className="flex w-full flex-wrap items-center gap-2">
                    <ToggleSwitch
                        label="Sort by"
                        shouldShowLabel={true}
                        leftLabel="Custom order"
                        rightLabel="Alphabetical"
                        isSelectingRight={isCategoryAlphabetical}
                        onValueChange={setIsCategoryAlphabetical}
                    />
                    <Button
                        variant="tertiary"
                        className="ml-auto"
                        onPress={() => setIsCreateOpen(true)}
                    >
                        <Plus />
                        <span>Category</span>
                    </Button>
                </div>
            </ConfigWrapper>
            <DemoDataBanner />
            <CategoryList />
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
