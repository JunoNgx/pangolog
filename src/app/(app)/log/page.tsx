"use client";

import { Button, Checkbox, Switch } from "@heroui/react";
import { useMemo, useState } from "react";
import { useBucks } from "@/lib/hooks/useBucks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDimes } from "@/lib/hooks/useDimes";
import { useLogStore } from "@/lib/store/useLogStore";
import { TransactionDialog } from "./TransactionDialog";
import { TransactionList } from "./TransactionList";

export default function LogPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const {
        isViewingBigBucks,
        shouldIncludeBucksInDimes,
        selectedYear,
        selectedMonth,
        setIsViewingBigBucks,
        setShouldIncludeBucksInDimes,
        setSelectedYear,
        setSelectedMonth,
    } = useLogStore();

    const { data: dimes, isLoading: dimesLoading } = useDimes(
        selectedYear,
        selectedMonth,
    );
    const { data: bucks, isLoading: bucksLoading } = useBucks(selectedYear);
    const { data: categories } = useCategories();

    const transactions = useMemo(() => {
        if (isViewingBigBucks) {
            return bucks ?? [];
        }
        const base = dimes ?? [];
        if (shouldIncludeBucksInDimes) {
            return [...base, ...(bucks ?? [])];
        }
        return base;
    }, [isViewingBigBucks, shouldIncludeBucksInDimes, dimes, bucks]);

    const isLoading = isViewingBigBucks
        ? bucksLoading
        : dimesLoading || (shouldIncludeBucksInDimes && bucksLoading);

    const monthValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    function handleMonthChange(value: string) {
        const [y, m] = value.split("-").map(Number);
        if (y && m) {
            setSelectedYear(y);
            setSelectedMonth(m);
        }
    }

    return (
        <div>
            <h2 className="font-mono text-xl font-bold mb-4">Transactions</h2>

            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-4">
                    <Switch
                        isSelected={isViewingBigBucks}
                        onValueChange={setIsViewingBigBucks}
                        size="sm"
                    >
                        <span className="font-mono text-sm">Big Bucks</span>
                    </Switch>
                </div>

                {!isViewingBigBucks && (
                    <div className="flex items-center gap-4 flex-wrap">
                        <input
                            type="month"
                            value={monthValue}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="font-mono text-sm bg-default-100 rounded-lg px-3 py-2 border border-default-200"
                        />
                        <Checkbox
                            isSelected={shouldIncludeBucksInDimes}
                            onValueChange={setShouldIncludeBucksInDimes}
                            size="sm"
                        >
                            <span className="font-mono text-sm">
                                Include bucks
                            </span>
                        </Checkbox>
                    </div>
                )}
            </div>

            <TransactionList
                transactions={transactions}
                categories={categories ?? []}
                isLoading={isLoading}
            />

            <Button
                color="primary"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 min-w-0 rounded-full text-2xl"
                onPress={() => setIsCreateOpen(true)}
            >
                +
            </Button>
            <TransactionDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                defaultIsBuck={isViewingBigBucks}
            />
        </div>
    );
}
