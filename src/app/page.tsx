"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import LandingPage from "./LandingPage";

export default function RootPage() {
    const { hasUsedBefore } = useLocalSettingsStore();
    const router = useRouter();

    useEffect(() => {
        if (hasUsedBefore) {
            router.replace("/log");
        }
    }, [hasUsedBefore, router]);

    return <LandingPage />;
}
