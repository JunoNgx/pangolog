import { GOOGLE_CLIENT_ID, MIME_JSON } from "@/lib/constants";
import type { SyncAuthToken, SyncProvider } from "@/lib/sync/syncProviderTypes";

const SCOPE = "https://www.googleapis.com/auth/drive.file email";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_NAME = "Pangolog";
const FOLDER_MIME = "application/vnd.google-apps.folder";

const BOUNDARY = "pangolog_boundary";

interface GisTokenError {
    type: string;
    message?: string;
}

interface GisCodeResponse {
    code: string;
    error?: string;
    error_description?: string;
}

interface GisCodeClientConfig {
    client_id: string;
    scope: string;
    ux_mode: "popup" | "redirect";
    prompt?: string;
    callback: (response: GisCodeResponse) => void;
    error_callback?: (error: GisTokenError) => void;
}

interface GisCodeClient {
    requestCode: () => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initCodeClient: (
                        config: GisCodeClientConfig,
                    ) => GisCodeClient;
                };
            };
        };
    }
}

interface DriveFileList {
    files: DriveFile[];
}

interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
}

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

function authHeader(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

async function expectOk(response: Response): Promise<Response> {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Drive API error ${response.status}: ${text}`);
    }
    return response;
}

function buildMultipart(
    metadata: Record<string, unknown>,
    content: string,
): { body: string; boundary: string } {
    const boundary = BOUNDARY;
    const body = [
        `--${boundary}`,
        "Content-Type: application/json; charset=UTF-8",
        "",
        JSON.stringify(metadata),
        `--${boundary}`,
        "Content-Type: application/json",
        "",
        content,
        `--${boundary}--`,
    ].join("\r\n");
    return { body, boundary };
}

async function postAuthCallback(code: string): Promise<SyncAuthToken> {
    const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": MIME_JSON },
        body: JSON.stringify({ code }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Authentication failed.");
    }

    const data = await res.json();
    return {
        provider: "google",
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        email: data.email,
    };
}

async function postAuthRefresh(): Promise<
    Pick<SyncAuthToken, "accessToken" | "expiresAt">
> {
    const res = await fetch("/api/auth/refresh", { method: "POST" });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Token refresh failed");
    }

    const data = await res.json();
    return {
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
    };
}

async function postAuthLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
}

async function getOrCreatePangoFolder(token: string): Promise<string> {
    const query = encodeURIComponent(
        `name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`,
    );
    const listRes = await expectOk(
        await fetch(`${DRIVE_API}/files?q=${query}&fields=files(id)`, {
            headers: authHeader(token),
        }),
    );
    const { files } = (await listRes.json()) as DriveFileList;

    if (files.length > 0) return files[0].id;

    const createRes = await expectOk(
        await fetch(`${DRIVE_API}/files`, {
            method: "POST",
            headers: {
                ...authHeader(token),
                "Content-Type": MIME_JSON,
            },
            body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
        }),
    );
    const folder = (await createRes.json()) as DriveFile;
    return folder.id;
}

async function listDriveFiles(
    token: string,
    folderId: string,
): Promise<DriveFile[]> {
    const query = encodeURIComponent(
        `'${folderId}' in parents and trashed=false`,
    );
    const res = await expectOk(
        await fetch(
            `${DRIVE_API}/files?q=${query}&fields=files(id,name,modifiedTime)`,
            { headers: authHeader(token) },
        ),
    );
    const { files } = (await res.json()) as DriveFileList;
    return files;
}

async function findDriveFile(
    token: string,
    folderId: string,
    name: string,
): Promise<string | null> {
    const query = encodeURIComponent(
        `name='${name}' and '${folderId}' in parents and trashed=false`,
    );
    const res = await expectOk(
        await fetch(`${DRIVE_API}/files?q=${query}&fields=files(id)`, {
            headers: authHeader(token),
        }),
    );
    const { files } = (await res.json()) as DriveFileList;
    return files.length > 0 ? files[0].id : null;
}

async function downloadDriveFile<T>(token: string, fileId: string): Promise<T> {
    const res = await expectOk(
        await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
            headers: authHeader(token),
        }),
    );
    return res.json() as Promise<T>;
}

async function createDriveFile(
    token: string,
    folderId: string,
    name: string,
    data: unknown,
): Promise<string> {
    const { body, boundary } = buildMultipart(
        { name, parents: [folderId] },
        JSON.stringify(data, null, 2),
    );
    const res = await expectOk(
        await fetch(
            `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`,
            {
                method: "POST",
                headers: {
                    ...authHeader(token),
                    "Content-Type": `multipart/related; boundary=${boundary}`,
                },
                body,
            },
        ),
    );
    const file = (await res.json()) as DriveFile;
    return file.id;
}

async function updateDriveFile(
    token: string,
    fileId: string,
    data: unknown,
): Promise<void> {
    const { body, boundary } = buildMultipart(
        {},
        JSON.stringify(data, null, 2),
    );
    await expectOk(
        await fetch(
            `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=multipart`,
            {
                method: "PATCH",
                headers: {
                    ...authHeader(token),
                    "Content-Type": `multipart/related; boundary=${boundary}`,
                },
                body,
            },
        ),
    );
}

async function trashDriveFile(token: string, fileId: string): Promise<void> {
    await expectOk(
        await fetch(`${DRIVE_API}/files/${fileId}`, {
            method: "PATCH",
            headers: {
                ...authHeader(token),
                "Content-Type": MIME_JSON,
            },
            body: JSON.stringify({ trashed: true }),
        }),
    );
}

async function upsertDriveFile(
    token: string,
    folderId: string,
    name: string,
    data: unknown,
): Promise<void> {
    const existingId = await findDriveFile(token, folderId, name);
    if (existingId) {
        await updateDriveFile(token, existingId, data);
    } else {
        await createDriveFile(token, folderId, name, data);
    }
}

export const googleProvider: SyncProvider = {
    name: "google",
    connectLabel: "Google Drive",
    expiredMessage:
        "Google Drive session expired. Please reconnect in Settings.",
    revokedMessage:
        "Google Drive access was revoked or has insufficient permissions. Please reconnect in Settings.",

    async connect() {
        await loadGis();

        return new Promise((resolve, reject) => {
            const client = window.google?.accounts.oauth2.initCodeClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPE,
                ux_mode: "popup",
                prompt: "consent",
                callback: async (response) => {
                    if (response.error) {
                        reject(
                            new Error(
                                response.error_description ?? response.error,
                            ),
                        );
                        return;
                    }
                    try {
                        const token = await postAuthCallback(response.code);
                        resolve(token);
                    } catch (err) {
                        reject(
                            err instanceof Error
                                ? err
                                : new Error("Authentication failed."),
                        );
                    }
                },
                error_callback: (err) => {
                    if (err.type === "popup_closed") {
                        reject(new Error("Authentication cancelled"));
                    } else {
                        reject(
                            new Error(err.message ?? "Authentication failed."),
                        );
                    }
                },
            });

            if (!client) {
                reject(
                    new Error("Failed to initialise Google Identity Services."),
                );
                return;
            }

            client.requestCode();
        });
    },

    async disconnect() {
        await postAuthLogout();
    },

    async refreshAuthToken(_token) {
        const refreshed = await postAuthRefresh();
        return {
            accessToken: refreshed.accessToken,
            expiresAt: refreshed.expiresAt,
        };
    },

    isScopeError(err) {
        return (
            err instanceof Error &&
            err.message.includes("403") &&
            err.message.includes("insufficientPermissions")
        );
    },

    async getOrCreateRoot(token) {
        return getOrCreatePangoFolder(token);
    },

    async listFiles(token, rootId) {
        return listDriveFiles(token, rootId);
    },

    async findFile(token, rootId, name) {
        return findDriveFile(token, rootId, name);
    },

    async downloadFile(token, fileId) {
        return downloadDriveFile(token, fileId);
    },

    async createFile(token, rootId, name, data) {
        return createDriveFile(token, rootId, name, data);
    },

    async upsertFile(token, rootId, name, data) {
        return upsertDriveFile(token, rootId, name, data);
    },

    async trashFile(token, fileId) {
        return trashDriveFile(token, fileId);
    },
};
