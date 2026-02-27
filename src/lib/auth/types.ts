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

export interface GisCodeClientConfig {
    client_id: string;
    scope: string;
    ux_mode: "popup" | "redirect";
    prompt?: string;
    callback: (response: GisCodeResponse) => void;
    error_callback?: (error: GisTokenError) => void;
}

export interface GisCodeClient {
    requestCode: () => void;
}

export interface GisCodeResponse {
    code: string;
    error?: string;
    error_description?: string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (
                        config: GisTokenClientConfig,
                    ) => GisTokenClient;
                    initCodeClient: (
                        config: GisCodeClientConfig,
                    ) => GisCodeClient;
                    revoke: (token: string, callback?: () => void) => void;
                };
            };
        };
    }
}
