import { useLayoutEffect, useState } from "react";

export function useOnlineStatus() {
    // navigator is unavailable during SSR -- accessing it directly causes a hydration
    // mismatch. Guard with a typeof check, defaulting to true (assume online) on the
    // server. Lazy init preserves the accurate client value on navigation without a
    // mount-time setState, which would cause a flash (see task 23b).
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator !== "undefined" ? navigator.onLine : true,
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
