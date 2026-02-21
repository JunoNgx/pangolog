"use client";

import { Skeleton } from "@heroui/react";
import type React from "react";
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

    const displayedItems = [...transactions].sort(
        (a, b) =>
            new Date(b.transactedAt).getTime() -
            new Date(a.transactedAt).getTime(),
    );

    if (isLoading) {
        return (
            <ul className="MainListContainer gap-2">
                {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
                    <Skeleton
                        key={key}
                        className="h-12 w-full rounded-lg my-1"
                    />
                ))}
            </ul>
        );
    }

    if (!displayedItems.length) {
        return (
            <>
                <p className="text-center text-default-400 py-12">
                    Nothing to show.
                </p>
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
            date: Date;
            dateKey: string;
            dateText: string;
            items: (Dime | Buck)[];
        }[]
    >((acc, tx) => {
        const date = new Date(tx.transactedAt);
        const dateText = date.toLocaleDateString("en-us", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        const lastGroup = acc[acc.length - 1];
        if (lastGroup?.dateKey === dateKey) {
            lastGroup.items.push(tx);
            return acc;
        }

        acc.push({ date, dateKey, dateText, items: [tx] });
        return acc;
    }, []);

    return (
        <>
            <ul className="MainListContainer">
                {groupedByDateItems.map(({ dateKey, dateText, items }) => (
                    <li key={dateKey}>
                        <h3 className="mt-6 mb-0 text-sm text-default-400">
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
    transaction: Dime | Buck;
    category: Category | undefined;
    openEditDialog: (model: Dime | Buck) => void;
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
    const txDay = txDate.getDate();
    const txMonth = txDate.toLocaleDateString("en-us", { month: "short" });
    const isBigBuck = !isDime(transaction);

    const ariaLabel = [
        transaction.description,
        category?.name,
        transaction.isIncome ? "income" : "expense",
        amountDisplay,
        `${txDay} ${txMonth}`,
    ]
        .filter(Boolean)
        .join(", ");

    function handleKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        openEditDialog(transaction);
    }

    return (
        <li
            aria-label={ariaLabel}
            className={`
                flex gap-2 relative
                pt-1 pr-2 pl-6 pb-1 mt-2
                border-b-1 border-default-200 bg-background
                cursor-pointer hover:border-default-400 transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            `}
            onClick={() => openEditDialog(transaction)}
            onKeyDown={handleKeyDown}
        >
            <div
                className="absolute left-1 bottom-0 top-0 w-1 h-full"
                style={{
                    backgroundColor: category?.colour,
                }}
            />

            <div className="grow-4 min-w-0">
                {hasCategory ? (
                    <p>
                        <span className="mr-1">{category.icon || "·"}</span>
                        <span className="text-default-700">
                            {category.name}
                        </span>
                    </p>
                ) : (
                    <p className="text-default-400">(no category)</p>
                )}
                {hasDescription ? (
                    <p className="font-mono text-sm text-default-400 truncate">
                        {transaction.description}
                    </p>
                ) : (
                    <p className="font-mono text-sm text-default-400">
                        (no description)
                    </p>
                )}
            </div>

            {isBigBuck && (
                <span className={`ChipLabel text-amber-500`}>BIG BUCK</span>
            )}

            <span
                className={`
                    self-center
                    font-mono font-medium
                    ${transaction.isIncome ? "text-success" : ""}
                `}
            >
                {transaction.isIncome ? "+" : ""}
                {amountDisplay}
            </span>
        </li>
    );
}
