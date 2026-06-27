export interface SyncAuthToken {
    provider: "google";
    accessToken: string;
    expiresAt: number;
    email: string;
}

export type SyncTokenResult = string | null | { expiredMessage: string };

export interface SyncFile {
    id: string;
    name: string;
    modifiedTime: string;
}

export interface SyncProvider {
    readonly name: string;
    readonly connectLabel: string;
    readonly expiredMessage: string;
    readonly revokedMessage: string;

    connect(): Promise<SyncAuthToken>;
    disconnect(): Promise<void>;
    refreshAuthToken(
        token: SyncAuthToken,
    ): Promise<Pick<SyncAuthToken, "accessToken" | "expiresAt">>;
    isScopeError(err: unknown): boolean;

    getOrCreateRoot(token: string): Promise<string>;
    listFiles(token: string, rootId: string): Promise<SyncFile[]>;
    findFile(
        token: string,
        rootId: string,
        name: string,
    ): Promise<string | null>;
    downloadFile<T>(token: string, fileId: string): Promise<T>;
    createFile(
        token: string,
        rootId: string,
        name: string,
        data: unknown,
    ): Promise<string>;
    upsertFile(
        token: string,
        rootId: string,
        name: string,
        data: unknown,
    ): Promise<void>;
    trashFile(token: string, fileId: string): Promise<void>;
}
