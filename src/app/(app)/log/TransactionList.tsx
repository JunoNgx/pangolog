"use client";

import { Skeleton } from "@heroui/react";
import { useState } from "react";
import type { Buck, Category, Dime } from "@/lib/db/types";
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
    const amountDisplay = formatAmount(transaction.amount);

    const hasCategory = !!category;
    const hasDescription = !!transaction.description;
    const txDate = new Date(transaction.transactedAt);
    const txDay = txDate.getDay();
    const txMonth = txDate.toLocaleDateString("en-us", { month: "short" });
    const isBigBuck = !isDime(transaction);

    return (
        <li
            className={`
                grid grid-cols-12 gap-1 relative
                pt-0 pr-0 pl-2 pb-1 mb-1
                border-b-1 border-default-200 bg-background
                cursor-pointer hover:border-default-400 transition
            `}
            onClick={() => openEditDialog(transaction)}
        >
            <div
                className="absolute left-1 w-1 h-full"
                style={{
                    backgroundColor: category?.colour,
                }}
            />

            <div className={`
                    flex flex-col justify-around items-center col-span-2
                    font-sans
                    md:col-span-1
                `}>
                <p className="font-mono font-medium text-[24px] leading-none">{txDay}</p>
                <p className="text-xs">{txMonth}</p>
            </div>

            <div className={`
                font-sans
                ${isBigBuck
                    ? "col-span-7 md:col-span-8"
                    : "col-span-8 md:col-span-9"
                }
            `}>
                {hasCategory
                    ? <div className="">{category.icon || "·"} {category.name}</div>
                    : <div className="text-gray-500">no category</div>
                }
                {hasDescription
                    ? <div className="truncate">{transaction.description}</div>
                    : <div className="text-gray-500">no description</div>
                }
            </div>

            {isBigBuck && (
                <span className={`
                    col-span-1 justify-self-center self-center
                    font-mono text-center text-xs text-default-400
                `}>
                    BIG BUCK
                </span>
            )}

            <span
                className={`
                    col-span-2 self-center justify-self-center
                    font-mono font-medium
                    ${transaction.isIncome ? "text-success" : ""}
                `}
            >
                {transaction.isIncome ? "+" : ""}{amountDisplay}
            </span>

        </li>
    );
};