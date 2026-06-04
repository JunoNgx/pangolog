import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TRANSACTIONS_KEY } from "@/lib/constants";
import { getAllTransactions } from "../db/bulk";
import {
    createTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    getTransactionsByYear,
    restoreTransaction,
    updateTransaction,
} from "../db/transactions";
import type { TransactionInput, TransactionUpdate } from "../db/types";

export function useAllTransactions() {
    return useQuery({
        queryKey: [...TRANSACTIONS_KEY, "all"],
        queryFn: () => getAllTransactions(),
    });
}

export function useTransactionsByMonth(year: number, month: number) {
    return useQuery({
        queryKey: [...TRANSACTIONS_KEY, year, month],
        queryFn: () => getTransactionsByMonth(year, month),
    });
}

export function useTransactionsByYear(year: number) {
    return useQuery({
        queryKey: [...TRANSACTIONS_KEY, year],
        queryFn: () => getTransactionsByYear(year),
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: TransactionInput) => createTransaction(input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () =>
            toast.danger("Failed to save transaction", { timeout: 0 }),
    });
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: TransactionUpdate }) =>
            updateTransaction(id, input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () =>
            toast.danger("Failed to update transaction", { timeout: 0 }),
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () =>
            toast.danger("Failed to delete transaction", { timeout: 0 }),
    });
}

export function useRestoreTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreTransaction(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () => toast.danger("Failed to undo deletion", { timeout: 0 }),
    });
}
