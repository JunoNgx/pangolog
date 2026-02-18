"use client";

import { useSync } from "@/lib/hooks/useSync";

export function SyncManager() {
    useSync();
    return null;
}
