"use client";

import { Button, Skeleton } from "@heroui/react";
import { useState } from "react";
import type { Buck, Category, Dime } from "@/lib/db/types";
import { useDeleteBuck } from "@/lib/hooks/useBucks";
import { useDeleteDime } from "@/lib/hooks/useDimes";
import { formatAmount } from "@/lib/utils";
import { TransactionDialog } from "./TransactionDialog";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionListProps {
    transactions: (Dime | Buck)[];
    categories: Category[];
    isLoading: boolean;
}

function isDime(tx: Dime | Buck): tx is Dime {
    return "month" in tx;
}

export function TransactionList({
    transactions,
    categories,
    isLoading,
}: TransactionListProps) {
    const [editingTx, setEditingTx] = useState<Dime | Buck | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingTx(undefined);
    }

    function openEditDialog(transaction: Buck | Dime) {
        setEditingTx(transaction);
        setIsDialogOpen(true);
    }

    const sorted = [...transactions].sort(
        (a, b) =>
            new Date(b.transactedAt).getTime() - new Date(a.transactedAt).getTime(),
    );

    if (isLoading) {
        return (
            <ul className="flex flex-col gap-2">
                {["s1", "s2", "s3", "s4", "s5"].map((key) => (
                    <li
                        key={key}
                        className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 bg-background"
                    >
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 flex-1 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-8 w-12 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                    </li>
                ))}
            </ul>
        );
    }

    if (!sorted.length) {
        return (
            <>
                <p className="text-center text-default-400 py-12 font-mono">
                    No transactions yet. Tap + to add one.
                </p>
                <TransactionDialog
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                    transaction={editingTx}
                />
            </>
        );
    }

    return (
        <>
            <ul className="flex flex-col gap-2">
                {sorted.map((tx) => {
                    const cat = tx.categoryId
                        ? categoryMap.get(tx.categoryId)
                        : undefined;

                    return <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        category={cat}
                        openEditDialog={openEditDialog}
                    />;
                })}
            </ul>
            <TransactionDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                transaction={editingTx}
            />
        </>
    );
}

interface TransactionItemProps {
    transaction: (Dime | Buck);
    category: Category | undefined,
    openEditDialog: (model: Dime | Buck) => void,
}

function TransactionItem({
    transaction,
    category,
    openEditDialog,
}: TransactionItemProps) {
    const deleteDime = useDeleteDime();
    const deleteBuck = useDeleteBuck();

    const isDeleting = isDime(transaction)
        ? deleteDime.isPending
        : deleteBuck.isPending;

    const amountDisplay = formatAmount(transaction.amount);

    function handleEdit(tx: Dime | Buck) {
        openEditDialog(transaction);
    }

    function handleDelete(tx: Dime | Buck) {
        if (isDime(tx)) {
            deleteDime.mutate(tx.id);
        } else {
            deleteBuck.mutate(tx.id);
        }
    }

    return (
        <li
            className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 bg-background"
        >
            {category ? (
                <>
                    <span className="text-xl">
                        {category.icon || "·"}
                    </span>
                    <span
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{
                            backgroundColor: category.colour,
                        }}
                    />
                </>
            ) : (
                <span className="text-xl text-default-300">
                    ·
                </span>
            )}
            <span className="font-mono flex-1 truncate">
                {transaction.description || (
                    <span className="text-default-300">
                        (no description)
                    </span>
                )}
            </span>
            {!isDime(transaction) && (
                <span className="text-xs text-default-400 font-mono">
                    BUCK
                </span>
            )}
            <span
                className={`
                    font-mono font-medium
                    ${transaction.isIncome ? "text-success" : "text-danger"}
                `}
            >
                {transaction.isIncome ? "+" : "-"}
                {amountDisplay}
            </span>
            <Button
                className="min-w-0"
                size="sm"
                variant="light"
                onPress={() => handleEdit(transaction)}
            >
                <Pencil size="18"/>
            </Button>
            <Button
                className="min-w-0"
                size="sm"
                variant="light"
                color="danger"
                isLoading={isDeleting}
                onPress={() => handleDelete(transaction)}
            >
                <Trash2 size="18"/>
            </Button>
        </li>
    );
};