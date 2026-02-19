"use client";

import { useCallback, useState } from "react";
import type { AuthToken } from "@/lib/auth/types";
import { useLocalSettingsStore } from "@/lib/store/useLocalSettingsStore";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCOPE =
    "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly email";
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

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

async function fetchUserEmail(accessToken: string): Promise<string> {
    const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) throw new Error("Failed to fetch user info");
    const data = await response.json();
    return data.email as string;
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

        const client = window.google?.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPE,
            callback: async (response) => {
                if (response.error) {
                    setError(response.error_description ?? response.error);
                    setIsConnecting(false);
                    return;
                }
                try {
                    const email = await fetchUserEmail(response.access_token);
                    setAuthToken({
                        id: "google",
                        accessToken: response.access_token,
                        expiresAt: Date.now() + response.expires_in * 1000,
                        email,
                    });
                } catch {
                    setError("Failed to retrieve user information.");
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

        client.requestAccessToken();
    }, [setAuthToken]);

    const disconnect = useCallback(() => {
        if (!authToken) return;
        window.google?.accounts.oauth2.revoke(authToken.accessToken);
        setAuthToken(null);
    }, [authToken, setAuthToken]);

    const getValidToken = useCallback(async (): Promise<string | null> => {
        if (!authToken) return null;
        if (isTokenValid(authToken)) return authToken.accessToken;

        if (!window.google || !CLIENT_ID) {
            setAuthToken(null);
            return null;
        }

        return new Promise((resolve) => {
            const client = window.google!.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPE,
                callback: (response) => {
                    if (response.error) {
                        setAuthToken(null);
                        resolve(null);
                        return;
                    }
                    const updated: AuthToken = {
                        ...authToken,
                        accessToken: response.access_token,
                        expiresAt: Date.now() + response.expires_in * 1000,
                    };
                    setAuthToken(updated);
                    resolve(updated.accessToken);
                },
                error_callback: () => {
                    setAuthToken(null);
                    resolve(null);
                },
            });
            client.requestAccessToken({ prompt: "" });
        });
    }, [authToken, setAuthToken]);

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
