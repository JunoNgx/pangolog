"use client";

import { SeedCarryoverDialog } from "./SeedCarryoverDialog";
import { useSync } from "@/lib/hooks/useSync";

export function SyncManager() {
    const { isAwaitingSeedDecision, resolveSeedDecision } = useSync();

    return (
        <SeedCarryoverDialog
            isOpen={isAwaitingSeedDecision}
            onResolve={resolveSeedDecision}
        />
    );
}
