"use client";

import { useCallback, useEffect, useState } from "react";
import { CategoryDialog } from "@/components/CategoryDialog";
import { ConfigWrapper } from "@/components/ConfigWrapper";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
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
            <div className="mx-auto w-full max-w-lg flex justify-end mb-4">
                <Button color="default" onPress={() => setIsCreateOpen(true)}>
                    <Plus />
                    <span>Category</span>
                </Button>
            </div>
            <CategoryList />
            <CategoryDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
