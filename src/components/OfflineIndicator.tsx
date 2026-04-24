"use client";

import { WifiOff } from "lucide-react";
import { useGoogleAuth } from "@/lib/hooks/useGoogleAuth";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

type OfflineIndicatorProps = {
    variant: "icon" | "banner";
    isSuppressedWhenDisconnected?: boolean;
};

export function OfflineIndicator({
    variant,
    isSuppressedWhenDisconnected = false,
}: OfflineIndicatorProps) {
    const { isOnline } = useOnlineStatus();
    const { isConnected } = useGoogleAuth();

    if (isOnline) return null;
    if (isSuppressedWhenDisconnected && !isConnected) return null;

    if (variant === "icon") {
        return <WifiOff size={14} className="text-warning-500" />;
    }

    return (
        <p className="text-xs text-warning-600 dark:text-warning-400">
            You are offline.
        </p>
    );
}
