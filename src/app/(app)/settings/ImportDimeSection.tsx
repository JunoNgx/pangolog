"use client";

import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import {
    convertDimeToPangolog,
    getDimeExistingCategories,
    validateDimeCsv,
} from "@/lib/dimeImport/dimeProcess";
import {
    executeImport,
    type ImportData,
    type ImportPreview,
    previewImport,
} from "@/lib/import";
import { utcNowString } from "@/lib/utils";

interface PendingImport {
    data: ImportData;
    errors: string[];
}

export function ImportDimeSection() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dimeImportPreview, setDimeImportPreview] =
        useState<ImportPreview | null>(null);
    const [skippedCount, setSkippedCount] = useState(0);
    const [importError, setImportError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportPreview | null>(
        null,
    );
    const [isImporting, setIsImporting] = useState(false);

    const [pendingImport, setPendingImport] = useState<PendingImport | null>(
        null,
    );

    function renderStats(
        label: string,
        added: number,
        updated: number,
    ): string {
        return `${label}: +${added} new, ${updated} updated`;
    }

    const errorRow = importError && (
        <p className="text-danger text-xs">{importError}</p>
    );

    const previewPanel = dimeImportPreview && pendingImport && (
        <div className="bg-surface flex flex-col gap-2 rounded-lg p-3 text-sm">
            <p className="text-foreground font-semibold">Preview:</p>
            <p className="text-foreground">
                {renderStats(
                    "Transactions",
                    dimeImportPreview.transactionsAdded,
                    dimeImportPreview.transactionsUpdated,
                )}
            </p>
            <p className="text-foreground">
                {renderStats(
                    "Categories",
                    dimeImportPreview.categoriesAdded,
                    dimeImportPreview.categoriesUpdated,
                )}
            </p>
            {skippedCount > 0 && (
                <p className="text-warning-600 dark:text-warning-400 text-xs">
                    {skippedCount} row(s) were skipped due to validation errors.
                </p>
            )}
            {pendingImport.errors.length > 0 && (
                <ul className="text-warning-600 dark:text-warning-400 list-inside list-disc text-xs">
                    {pendingImport.errors.map((err, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}
            <div className="mt-1 flex gap-2">
                <Button
                    size="sm"
                    variant="primary"
                    isPending={isImporting}
                    onPress={handleConfirmImport}
                >
                    Confirm
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onPress={handleCancelImport}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );

    const resultPanel = importResult && (
        <div className="bg-success-soft flex flex-col gap-1 rounded-lg p-3 text-sm">
            <p className="text-success font-semibold">Import complete.</p>
            <p className="text-success">
                {renderStats(
                    "Transactions",
                    importResult.transactionsAdded,
                    importResult.transactionsUpdated,
                )}
            </p>
            <p className="text-success">
                {renderStats(
                    "Categories",
                    importResult.categoriesAdded,
                    importResult.categoriesUpdated,
                )}
            </p>
            {importResult.errors.length > 0 && (
                <ul className="text-warning-600 dark:text-warning-400 mt-1 list-inside list-disc text-xs">
                    {importResult.errors.map((err, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}
        </div>
    );

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = "";
        setImportError(null);
        setDimeImportPreview(null);
        setSkippedCount(0);
        setImportResult(null);
        setPendingImport(null);
        if (!file) return;

        try {
            const text = await file.text();
            const validation = validateDimeCsv(text);
            if (!validation.ok) {
                setImportError(validation.error);
                return;
            }

            const [existingCategories] = await Promise.all([
                getDimeExistingCategories(),
            ]);
            const converted = await convertDimeToPangolog(
                validation.rows,
                existingCategories,
                utcNowString(),
            );
            const preview = await previewImport(converted.data);
            setDimeImportPreview(preview);
            setSkippedCount(converted.skippedCount);
            setPendingImport({
                data: converted.data,
                errors: converted.errors,
            });
        } catch (err) {
            setImportError(`Failed to read file: ${err}`);
        }
    }

    async function handleConfirmImport() {
        if (!pendingImport) return;
        setIsImporting(true);
        try {
            const result = await executeImport(pendingImport.data);
            setImportResult(result);
            setPendingImport(null);
            setDimeImportPreview(null);
            setSkippedCount(0);
        } catch (err) {
            setImportError(`Import failed: ${err}`);
        } finally {
            setIsImporting(false);
        }
    }

    function handleCancelImport() {
        setPendingImport(null);
        setDimeImportPreview(null);
        setSkippedCount(0);
        setImportError(null);
        setImportResult(null);
    }

    return (
        <section>
            <h3 className="mb-2 text-lg font-semibold">Import from Dime</h3>
            <div className="flex flex-col gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <p className="text-muted text-xs">
                    Import transactions from the iOS app Dime, in CSV format.
                    Categories are matched against existing local categories by
                    name; otherwise new ones will be created.
                </p>
                <Button
                    variant="primary"
                    className="self-start"
                    onPress={() => fileInputRef.current?.click()}
                >
                    Import Dime CSV
                </Button>
                {errorRow}
                {previewPanel}
                {resultPanel}
            </div>
        </section>
    );
}
