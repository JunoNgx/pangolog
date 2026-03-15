import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createTransaction,
    deleteTransaction,
    getTransactionsByMonth,
    getTransactionsByYear,
    restoreTransaction,
    updateTransaction,
} from "../db/transactions";
import type { TransactionInput, TransactionUpdate } from "../db/types";

const TRANSACTIONS_KEY = ["transactions"];

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
            toast.error("Failed to save transaction", { duration: Infinity }),
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
            toast.error("Failed to update transaction", { duration: Infinity }),
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () =>
            toast.error("Failed to delete transaction", { duration: Infinity }),
    });
}

export function useRestoreTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreTransaction(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
        onError: () =>
            toast.error("Failed to undo deletion", { duration: Infinity }),
    });
}
