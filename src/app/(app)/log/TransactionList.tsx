"use client";

import { Button, Skeleton } from "@heroui/react";
import { useState } from "react";
import type { Buck, Category, Dime } from "@/lib/db/types";
import { useDeleteBuck } from "@/lib/hooks/useBucks";
import { useDeleteDime } from "@/lib/hooks/useDimes";
import { formatAmount } from "@/lib/utils";
import { TransactionDialog } from "./TransactionDialog";

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
    const deleteDime = useDeleteDime();
    const deleteBuck = useDeleteBuck();
    const [editingTx, setEditingTx] = useState<Dime | Buck | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    function handleEdit(tx: Dime | Buck) {
        setEditingTx(tx);
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingTx(undefined);
    }

    function handleDelete(tx: Dime | Buck) {
        if (isDime(tx)) {
            deleteDime.mutate(tx.id);
        } else {
            deleteBuck.mutate(tx.id);
        }
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
                    const amountDisplay = formatAmount(tx.amount);
                    const isDeleting = isDime(tx)
                        ? deleteDime.isPending
                        : deleteBuck.isPending;

                    return (
                        <li
                            key={tx.id}
                            className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 bg-background"
                        >
                            {cat ? (
                                <>
                                    <span className="text-xl">
                                        {cat.icon || "·"}
                                    </span>
                                    <span
                                        className="h-4 w-4 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: cat.colour,
                                        }}
                                    />
                                </>
                            ) : (
                                <span className="text-xl text-default-300">
                                    ·
                                </span>
                            )}
                            <span className="font-mono flex-1 truncate">
                                {tx.description || (
                                    <span className="text-default-300">
                                        (no description)
                                    </span>
                                )}
                            </span>
                            {!isDime(tx) && (
                                <span className="text-xs text-default-400 font-mono">
                                    BUCK
                                </span>
                            )}
                            <span
                                className={`
                                    font-mono font-medium
                                    ${tx.isIncome ? "text-success" : "text-danger"}
                                `}
                            >
                                {tx.isIncome ? "+" : "-"}
                                {amountDisplay}
                            </span>
                            <Button
                                size="sm"
                                variant="light"
                                onPress={() => handleEdit(tx)}
                            >
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                isLoading={isDeleting}
                                onPress={() => handleDelete(tx)}
                            >
                                Delete
                            </Button>
                        </li>
                    );
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
