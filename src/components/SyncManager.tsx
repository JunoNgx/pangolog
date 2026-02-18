"use client";

import { useSync } from "@/lib/hooks/useSync";
import { SeedCarryoverDialog } from "./SeedCarryoverDialog";

export function SyncManager() {
    const { isAwaitingSeedDecision, resolveSeedDecision } = useSync();

    return (
        <SeedCarryoverDialog
            isOpen={isAwaitingSeedDecision}
            onResolve={resolveSeedDecision}
        />
    );
}
