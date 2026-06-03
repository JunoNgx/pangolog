"use client";

import { Tabs } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useHotkey } from "@/lib/hooks/useHotkey";
import CategoriesClient from "./CategoriesClient";
import RecurringClient from "./RecurringClient";

type TabKey = "categories" | "recurring";

export default function ManageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = (searchParams.get("tab") ?? "categories") as TabKey;

    function handleTabChange(key: React.Key) {
        router.replace(`/manage?tab=${String(key)}`);
    }

    const toggleTab = useCallback(() => {
        const nextTab = activeTab === "categories" ? "recurring" : "categories";
        router.replace(`/manage?tab=${nextTab}`);
    }, [activeTab, router]);
    useHotkey("U", toggleTab, { hasMod: true, hasShift: true });

    return (
        <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            className="w-full justify-center"
        >
            <Tabs.ListContainer className="flex justify-center">
                <Tabs.List
                    aria-label="Manage sections"
                    className="w-fit whitespace-nowrap"
                >
                    <Tabs.Tab id="categories">
                        Categories
                        <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="recurring">
                        Recurring Rules
                        <Tabs.Indicator />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="categories">
                <CategoriesClient />
            </Tabs.Panel>
            <Tabs.Panel id="recurring">
                <RecurringClient />
            </Tabs.Panel>
        </Tabs>
    );
}
