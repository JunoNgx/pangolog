import { useLayoutEffect, useState } from "react";

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

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
