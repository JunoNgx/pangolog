"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { useSyncProvider } from "@/lib/sync/useSyncProvider";

type OfflineIndicatorProps = {
    variant: "icon" | "banner";
    isSuppressedWhenDisconnected?: boolean;
};

export function OfflineIndicator({
    variant,
    isSuppressedWhenDisconnected = false,
}: OfflineIndicatorProps) {
    const { isOnline } = useOnlineStatus();
    const { isConnected } = useSyncProvider();

    if (isOnline) return null;
    if (isSuppressedWhenDisconnected && !isConnected) return null;

    if (variant === "icon") {
        return <WifiOff size={14} className="text-warning-500" />;
    }

    return (
        <p className="text-warning-600 dark:text-warning-400 text-xs">
            You are offline.
        </p>
    );
}
