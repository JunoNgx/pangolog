import { useLayoutEffect, useState } from "react";

export function useOnlineStatus() {
    // Default to true for SSR (navigator unavailable); lazy init reads the real
    // value on the client without a mount-time setState, avoiding flash on navigation.
    const [isOnline, setIsOnline] = useState(
        () => typeof navigator !== "undefined" && navigator.onLine,
    );

    useLayoutEffect(() => {
        function handleOnline() {
            setIsOnline(true);
        }

        function handleOffline() {
            setIsOnline(false);
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return { isOnline };
}
