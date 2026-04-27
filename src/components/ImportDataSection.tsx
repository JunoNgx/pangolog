"use client";

import { Button } from "@heroui/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
    executeImport,
    type ImportData,
    type ImportPreview,
    previewImport,
    validateImportData,
} from "@/lib/import";

export function ImportDataSection() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importData, setImportData] = useState<ImportData | null>(null);
    const [importPreview, setImportPreview] = useState<ImportPreview | null>(
        null,
    );
    const [importError, setImportError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportPreview | null>(
        null,
    );
    const [isImporting, setIsImporting] = useState(false);

    function renderStats(
        label: string,
        added: number,
        updated: number,
    ): string {
        return `${label}: +${added} new, ${updated} updated`;
    }

    const errorRow = importError && (
        <p className="text-xs text-danger-500">{importError}</p>
    );

    const importPreviewPanel = importPreview && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-default-100 text-sm">
            <p className="font-semibold text-default-700">Preview:</p>
            <p className="text-default-600">
                {renderStats(
                    "Transactions",
                    importPreview.transactionsAdded,
                    importPreview.transactionsUpdated,
                )}
            </p>
            <p className="text-default-600">
                {renderStats(
                    "Categories",
                    importPreview.categoriesAdded,
                    importPreview.categoriesUpdated,
                )}
            </p>
            <p className="text-default-600">
                {renderStats(
                    "Recurring rules",
                    importPreview.rulesAdded,
                    importPreview.rulesUpdated,
                )}
            </p>
            {importPreview.errors.length > 0 && (
                <ul className="text-xs text-warning-600 dark:text-warning-400 list-disc list-inside">
                    {importPreview.errors.map((err, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}
            <div className="flex gap-2 mt-1">
                <Button
                    size="sm"
                    color="primary"
                    isLoading={isImporting}
                    onPress={handleConfirmImport}
                >
                    Confirm
                </Button>
                <Button size="sm" variant="light" onPress={handleCancelImport}>
                    Cancel
                </Button>
            </div>
        </div>
    );

    const importResultPanel = importResult && (
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-success-50 text-sm">
            <p className="font-semibold text-success-700">Import complete.</p>
            <p className="text-success-600">
                {renderStats(
                    "Transactions",
                    importResult.transactionsAdded,
                    importResult.transactionsUpdated,
                )}
            </p>
            <p className="text-success-600">
                {renderStats(
                    "Categories",
                    importResult.categoriesAdded,
                    importResult.categoriesUpdated,
                )}
            </p>
            <p className="text-success-600">
                {renderStats(
                    "Recurring rules",
                    importResult.rulesAdded,
                    importResult.rulesUpdated,
                )}
            </p>
            {importResult.errors.length > 0 && (
                <ul className="text-xs text-warning-600 dark:text-warning-400 list-disc list-inside mt-1">
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
        setImportPreview(null);
        setImportData(null);
        setImportResult(null);
        if (!file) return;

        try {
            const text = await file.text();
            const parsed: unknown = JSON.parse(text);
            const validationError = validateImportData(parsed);
            if (validationError !== null) {
                setImportError(validationError);
                return;
            }
            const validData = parsed as ImportData;
            const preview = await previewImport(validData);
            setImportData(validData);
            setImportPreview(preview);
        } catch {
            setImportError(
                "Failed to read file. Make sure it is a valid JSON file.",
            );
        }
    }

    async function handleConfirmImport() {
        if (!importData) return;
        setIsImporting(true);
        try {
            const result = await executeImport(importData);
            setImportResult(result);
            setImportData(null);
            setImportPreview(null);
        } catch (err) {
            setImportError(`Import failed: ${err}`);
        } finally {
            setIsImporting(false);
        }
    }

    function handleCancelImport() {
        setImportData(null);
        setImportPreview(null);
        setImportError(null);
        setImportResult(null);
    }

    return (
        <section>
            <h3 className="text-lg font-semibold mb-4">Import Data</h3>
            <div className="flex flex-col gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button
                    color="primary"
                    variant="flat"
                    className="self-start"
                    onPress={() => fileInputRef.current?.click()}
                >
                    Import JSON
                </Button>
                {errorRow}
                {importPreviewPanel}
                {importResultPanel}
            </div>
        </section>
    );
}
