import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createDime,
    deleteDime,
    getDimesByMonth,
    getDimesByYear,
    restoreDime,
    updateDime,
} from "../db/dimes";
import type { DimeInput, DimeUpdate } from "../db/types";

const DIMES_KEY = ["dimes"];

export function useDimes(year: number, month: number) {
    return useQuery({
        queryKey: [...DIMES_KEY, year, month],
        queryFn: () => getDimesByMonth(year, month),
    });
}

export function useDimesByYear(year: number) {
    return useQuery({
        queryKey: [...DIMES_KEY, year],
        queryFn: () => getDimesByYear(year),
    });
}

export function useCreateDime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: DimeInput) => createDime(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DIMES_KEY }),
        onError: () => toast.error("Failed to save transaction"),
    });
}

export function useUpdateDime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: DimeUpdate }) =>
            updateDime(id, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DIMES_KEY }),
        onError: () => toast.error("Failed to update transaction"),
    });
}

export function useDeleteDime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDime(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DIMES_KEY }),
        onError: () => toast.error("Failed to delete transaction"),
    });
}

export function useRestoreDime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreDime(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DIMES_KEY }),
        onError: () => toast.error("Failed to undo deletion"),
    });
}
