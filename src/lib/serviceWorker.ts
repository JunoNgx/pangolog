export async function clearSwCaches(): Promise<void> {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
}
