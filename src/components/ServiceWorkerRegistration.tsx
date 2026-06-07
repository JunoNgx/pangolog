"use client";

import { useLayoutEffect } from "react";

const isSwEnabled =
    process.env.NODE_ENV !== "development" &&
    process.env.NEXT_PUBLIC_SW_ENABLED !== "false";

export function ServiceWorkerRegistration() {
    useLayoutEffect(() => {
        if (!isSwEnabled || !("serviceWorker" in navigator)) return;
        const version = process.env.NEXT_PUBLIC_VERSION ?? "dev";
        navigator.serviceWorker
            .register(`/sw.js?v=${version}`)
            .catch((err) =>
                console.error("Service worker registration failed:", err),
            );
    }, []);

    return null;
}
