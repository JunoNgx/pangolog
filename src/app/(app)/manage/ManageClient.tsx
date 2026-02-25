"use client";

import { Tab, Tabs } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
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

    return (
        <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            aria-label="Manage sections"
        >
            <Tab key="categories" title="Categories">
                <CategoriesClient />
            </Tab>
            <Tab key="recurring" title="Recurring Rules">
                <RecurringClient />
            </Tab>
        </Tabs>
    );
}
