import type { StoreName } from "@/lib/constants";

export function performIdbRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

interface OpenStoreConfig {
    db: IDBDatabase;
    storeName: StoreName;
    mode: IDBTransactionMode;
}

export function openStore({
    db,
    storeName,
    mode,
}: OpenStoreConfig): IDBObjectStore {
    return db.transaction(storeName, mode).objectStore(storeName);
}

export function performTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

interface IdbUpdateConfig<T extends { id: string }> {
    db: IDBDatabase;
    storeName: StoreName;
    id: string;
    updater: (storedRecord: T) => T;
}

export function performIdbUpdate<T extends { id: string }>({
    db,
    storeName,
    id,
    updater,
}: IdbUpdateConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const store = openStore({ db, storeName, mode: "readwrite" });
        const getReq = store.get(id);

        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
            const storedRecord = getReq.result as T | undefined;
            if (!storedRecord) {
                reject(new Error(`${storeName} ${id} not found`));
                return;
            }

            const updatedRecord = updater(storedRecord);
            const putReq = store.put(updatedRecord);
            putReq.onsuccess = () => resolve(updatedRecord);
            putReq.onerror = () => reject(putReq.error);
        };
    });
}
