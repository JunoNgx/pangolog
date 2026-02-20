import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createBuck,
    deleteBuck,
    getBucksByYear,
    restoreBuck,
    updateBuck,
} from "../db/bucks";
import type { BuckInput, BuckUpdate } from "../db/types";

const BUCKS_KEY = ["bucks"];

export function useBucks(year: number) {
    return useQuery({
        queryKey: [...BUCKS_KEY, year],
        queryFn: () => getBucksByYear(year),
    });
}

export function useCreateBuck() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: BuckInput) => createBuck(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: BUCKS_KEY }),
        onError: () => toast.error("Failed to save transaction", { duration: Infinity }),
    });
}

export function useUpdateBuck() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: BuckUpdate }) =>
            updateBuck(id, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: BUCKS_KEY }),
        onError: () => toast.error("Failed to update transaction", { duration: Infinity }),
    });
}

export function useDeleteBuck() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBuck(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: BUCKS_KEY }),
        onError: () => toast.error("Failed to delete transaction", { duration: Infinity }),
    });
}

export function useRestoreBuck() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreBuck(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: BUCKS_KEY }),
        onError: () => toast.error("Failed to undo deletion", { duration: Infinity }),
    });
}
