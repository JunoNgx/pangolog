"use client";

import { DateTime } from "luxon";
import { useState } from "react";
import { BigBuckIndicator } from "@/components/BigBuckIndicator";
import { MainListContainer } from "@/components/MainListContainer";
import type { Category, Transaction } from "@/lib/db/types";
import { formatAmount, toIsoDateString } from "@/lib/utils";
import { TransactionDialog } from "./TransactionDialog";

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
}

export function TransactionList({
    transactions,
    categories,
}: TransactionListProps) {
    const [editingTx, setEditingTx] = useState<Transaction | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingTx(undefined);
    }

    function openEditDialog(transaction: Transaction) {
        setEditingTx(transaction);
        setIsDialogOpen(true);
    }

    const displayedItems = [...transactions].sort(
        (a, b) =>
            DateTime.fromISO(b.transactedAt).toMillis() -
            DateTime.fromISO(a.transactedAt).toMillis(),
    );

    if (!displayedItems.length) {
        return (
            <>
                <p className="text-muted py-12 text-center">Nothing to show.</p>
                <TransactionDialog
                    isOpen={isDialogOpen}
                    onClose={handleCloseDialog}
                    transaction={editingTx}
                />
            </>
        );
    }

    const groupedByDateItems = displayedItems.reduce<
        {
            dateKey: string;
            dateText: string;
            items: Transaction[];
        }[]
    >((acc, tx) => {
        const dt = DateTime.fromISO(tx.transactedAt);
        const dateText = dt.toLocaleString({
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        const dateKey = toIsoDateString(dt);

        const lastGroup = acc[acc.length - 1];
        if (lastGroup?.dateKey === dateKey) {
            lastGroup.items.push(tx);
            return acc;
        }

        acc.push({ dateKey, dateText, items: [tx] });
        return acc;
    }, []);

    return (
        <>
            <MainListContainer>
                {groupedByDateItems.map(({ dateKey, dateText, items }) => (
                    <li key={dateKey}>
                        <h3 className="text-muted mt-6 mb-0 text-sm">
                            {dateText}
                        </h3>
                        <ul>
                            {items.map((tx) => {
                                const cat = tx.categoryId
                                    ? categoryMap.get(tx.categoryId)
                                    : undefined;
                                return (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                        category={cat}
                                        openEditDialog={openEditDialog}
                                    />
                                );
                            })}
                        </ul>
                    </li>
                ))}
            </MainListContainer>
            <TransactionDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                transaction={editingTx}
            />
        </>
    );
}

interface TransactionItemProps {
    transaction: Transaction;
    category: Category | undefined;
    openEditDialog: (model: Transaction) => void;
}

function TransactionItem({
    transaction,
    category,
    openEditDialog,
}: TransactionItemProps) {
    const amountDisplay = formatAmount(transaction.amount);

    const hasCategory = !!category;
    const hasDescription = !!transaction.description;
    const txDate = DateTime.fromISO(transaction.transactedAt);
    const txDay = txDate.day;
    const txMonth = txDate.toLocaleString({ month: "short" });
    const isBigBuck = transaction.isBigBuck;

    const ariaLabel = [
        transaction.description,
        category?.name,
        transaction.isIncome ? "income" : "expense",
        amountDisplay,
        `${txDay} ${txMonth}`,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <li>
            <button
                type="button"
                aria-label={ariaLabel}
                onClick={() => openEditDialog(transaction)}
                className="bg-background hover:border-foreground focus:ring-accent mt-2 flex w-full cursor-pointer gap-2 border-b border-l-4 pt-1 pr-2 pb-1 pl-1 text-left transition-[border-color] outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderLeftColor: category?.colour }}
            >
                <div className="ml-2 min-w-0 grow-4">
                    {hasCategory ? (
                        <p className="truncate">
                            <span className="mr-2">{category.icon || "·"}</span>
                            <span className="text-foreground">
                                {category.name}
                            </span>
                        </p>
                    ) : (
                        <p className="text-muted">(no category)</p>
                    )}
                    {hasDescription ? (
                        <p className="text-muted truncate font-mono text-sm">
                            {transaction.description}
                        </p>
                    ) : (
                        <p className="text-muted font-mono text-sm">
                            (no description)
                        </p>
                    )}
                </div>

                {isBigBuck && <BigBuckIndicator />}

                <span
                    className={`shrink-0 self-center font-mono font-medium ${transaction.isIncome ? "text-success" : ""} `}
                >
                    {transaction.isIncome ? "+" : ""}
                    {amountDisplay}
                </span>
            </button>
        </li>
    );
}
