"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLocalSyncDataStore } from "@/lib/store/useLocalSyncDataStore";
import { googleProvider } from "@/lib/sync/googleProvider";
import type {
    SyncAuthToken,
    SyncTokenResult,
} from "@/lib/sync/syncProviderTypes";

const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

function isTokenValid(token: SyncAuthToken): boolean {
    return token.expiresAt - TOKEN_EXPIRY_BUFFER_MS > Date.now();
}

export function useSyncProvider() {
    const { authToken, setAuthToken } = useLocalSyncDataStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConnected = authToken !== null;

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError(null);

        try {
            const token = await googleProvider.connect();
            setAuthToken(token);
            toast.success(`Connected as ${token.email}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Authentication failed.",
            );
        } finally {
            setIsConnecting(false);
        }
    }, [setAuthToken]);

    const disconnect = useCallback(async () => {
        await googleProvider.disconnect();
        setAuthToken(null);
    }, [setAuthToken]);

    const getValidToken = useCallback(
        async (shouldForceRefresh = false): Promise<SyncTokenResult> => {
            if (!authToken) return null;
            if (!shouldForceRefresh && isTokenValid(authToken)) {
                return authToken.accessToken;
            }

            try {
                const refreshed =
                    await googleProvider.refreshAuthToken(authToken);
                const updatedToken: SyncAuthToken = {
                    ...authToken,
                    accessToken: refreshed.accessToken,
                    expiresAt: refreshed.expiresAt,
                };
                setAuthToken(updatedToken);
                return updatedToken.accessToken;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Token refresh failed";
                return { expired: message };
            }
        },
        [authToken, setAuthToken],
    );

    return {
        provider: googleProvider,
        authToken,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        getValidToken,
    };
}
