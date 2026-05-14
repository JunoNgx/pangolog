import {
    DRIVE_API,
    DRIVE_UPLOAD_API,
    FOLDER_MIME,
    FOLDER_NAME,
    MIME_JSON,
} from "@/lib/constants";

// --- File name helpers ---

const BOUNDARY = "pangolog_boundary";

export function transactionFileName(year: number): string {
    return `${year}.json`;
}

export function backupFileName(year: number, month: number): string {
    const mm = String(month).padStart(2, "0");
    return `backup-${year}-${mm}.json`;
}

// --- Types ---

export interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
}

interface DriveFileList {
    files: DriveFile[];
}

// --- Internals ---

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

// --- Folder ---

export async function getOrCreatePangoFolder(token: string): Promise<string> {
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

// --- File operations ---

export async function listFiles(
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

export async function findFile(
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

export async function downloadFile<T>(
    token: string,
    fileId: string,
): Promise<T> {
    const res = await expectOk(
        await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
            headers: authHeader(token),
        }),
    );
    return res.json() as Promise<T>;
}

export async function createFile(
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

export async function updateFile(
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

export async function trashFile(token: string, fileId: string): Promise<void> {
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

export async function upsertFile(
    token: string,
    folderId: string,
    name: string,
    data: unknown,
): Promise<void> {
    const existingId = await findFile(token, folderId, name);
    if (existingId) {
        await updateFile(token, existingId, data);
    } else {
        await createFile(token, folderId, name, data);
    }
}
