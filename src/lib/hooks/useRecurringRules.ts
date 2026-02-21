import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createRecurringRule,
    deleteRecurringRule,
    getAllRecurringRules,
    restoreRecurringRule,
    updateRecurringRule,
} from "../db/recurringRules";
import type { RecurringRuleInput, RecurringRuleUpdate } from "../db/types";

const RECURRING_RULES_KEY = ["recurring-rules"];

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
            toast.error("Failed to save recurring rule", {
                duration: Infinity,
            }),
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
            toast.error("Failed to update recurring rule", {
                duration: Infinity,
            }),
    });
}

export function useDeleteRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRecurringRule(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () =>
            toast.error("Failed to delete recurring rule", {
                duration: Infinity,
            }),
    });
}

export function useRestoreRecurringRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreRecurringRule(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: RECURRING_RULES_KEY }),
        onError: () =>
            toast.error("Failed to undo deletion", { duration: Infinity }),
    });
}
