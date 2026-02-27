"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { AuthToken } from "@/lib/auth/types";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCOPE = "https://www.googleapis.com/auth/drive.file email";
const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

function loadGis(): Promise<void> {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error("Failed to load Google Identity Services"));
        document.head.appendChild(script);
    });
}

function isTokenValid(token: AuthToken): boolean {
    return token.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now();
}

export function useGoogleAuth() {
    const { authToken, setAuthToken } = useLocalSettingsStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = authToken !== null && isTokenValid(authToken);

    const connect = useCallback(async () => {
        if (!CLIENT_ID) {
            setError("Google Client ID is not configured.");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            await loadGis();
        } catch {
            setError("Failed to load Google Identity Services.");
            setIsConnecting(false);
            return;
        }

        const client = window.google?.accounts.oauth2.initCodeClient({
            client_id: CLIENT_ID,
            scope: SCOPE,
            ux_mode: "popup",
            prompt: "consent",
            callback: async (response) => {
                if (response.error) {
                    setError(response.error_description ?? response.error);
                    setIsConnecting(false);
                    return;
                }
                try {
                    const res = await fetch("/api/auth/callback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: response.code }),
                    });
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error ?? "Authentication failed.");
                    }
                    const data = await res.json();
                    setAuthToken({
                        id: "google",
                        accessToken: data.accessToken,
                        expiresAt: data.expiresAt,
                        email: data.email,
                    });
                    toast.success(`Connected as ${data.email}`);
                } catch (err) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Authentication failed.",
                    );
                } finally {
                    setIsConnecting(false);
                }
            },
            error_callback: (err) => {
                if (err.type !== "popup_closed") {
                    setError(err.message ?? "Authentication failed.");
                }
                setIsConnecting(false);
            },
        });

        if (!client) {
            setError("Failed to initialise Google Identity Services.");
            setIsConnecting(false);
            return;
        }

        client.requestCode();
    }, [setAuthToken]);

    const disconnect = useCallback(async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setAuthToken(null);
    }, [setAuthToken]);

    const getValidToken = useCallback(
        async (shouldForceRefresh = false): Promise<string | null> => {
            if (!authToken) return null;
            if (!shouldForceRefresh && isTokenValid(authToken)) {
                return authToken.accessToken;
            }

            const res = await fetch("/api/auth/refresh", { method: "POST" });
            if (!res.ok) return null;

            const data = await res.json();
            const updated: AuthToken = {
                ...authToken,
                accessToken: data.accessToken,
                expiresAt: data.expiresAt,
            };
            setAuthToken(updated);
            return updated.accessToken;
        },
        [authToken, setAuthToken],
    );

    return {
        authToken,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        getValidToken,
    };
}
