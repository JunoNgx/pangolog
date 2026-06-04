import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RECURRING_RULES_KEY } from "@/lib/constants";
import {
    createRecurringRule,
    deleteRecurringRule,
    getAllRecurringRules,
    restoreRecurringRule,
    updateRecurringRule,
} from "../db/recurringRules";
import type { RecurringRuleInput, RecurringRuleUpdate } from "../db/types";

export function useRecurringRules() {
    return useQuery({
        queryKey: RECURRING_RULES_KEY,
        queryFn: getAllRecurringRules,
    });
}

export function useCreateRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: RecurringRuleInput) => createRecurringRule(input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () =>
            toast.danger("Failed to save recurring rule", { timeout: 0 }),
    });
}

export function useUpdateRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            input,
        }: {
            id: string;
            input: RecurringRuleUpdate;
        }) => updateRecurringRule(id, input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () =>
            toast.danger("Failed to update recurring rule", { timeout: 0 }),
    });
}

export function useDeleteRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRecurringRule(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () =>
            toast.danger("Failed to delete recurring rule", { timeout: 0 }),
    });
}

export function useRestoreRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreRecurringRule(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () => toast.danger("Failed to undo deletion", { timeout: 0 }),
    });
}
