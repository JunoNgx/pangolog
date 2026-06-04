import { MIME_JSON } from "@/lib/constants";
import { buildDataSnapshot } from "@/lib/dataProcess";
import { todayDateString } from "./utils";

function triggerDownload(
    content: string,
    filename: string,
    mimeType: string,
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function exportJson(
    isPrettyPrint: boolean,
    shouldIncludeDeleted = false,
): Promise<void> {
    const data = await buildDataSnapshot(shouldIncludeDeleted);

    const content = isPrettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

    triggerDownload(content, `pangolog-${todayDateString()}.json`, MIME_JSON);
}
