"use client";

import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";
import LandingPage from "./LandingPage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
    const { hasUsedBefore } = useLocalSettingsStore();
    const router = useRouter();

    useEffect(() => {
        if (hasUsedBefore) {
            router.replace("/log");
        }
    }, [hasUsedBefore, router]);

    return <LandingPage/>;
};
