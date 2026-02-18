export interface AuthToken {
    id: "google";
    accessToken: string;
    expiresAt: number; // Unix timestamp ms
    email: string;
}

export interface GisTokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: GisTokenResponse) => void;
    error_callback?: (error: GisTokenError) => void;
}

export interface GisTokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

export interface GisTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    error?: string;
    error_description?: string;
}

export interface GisTokenError {
    type: string;
    message?: string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (
                        config: GisTokenClientConfig,
                    ) => GisTokenClient;
                    revoke: (token: string, callback?: () => void) => void;
                };
            };
        };
    }
}
