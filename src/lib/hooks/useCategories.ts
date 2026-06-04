import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CATEGORIES_KEY } from "@/lib/constants";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    reorderCategories,
    restoreCategory,
    updateCategory,
} from "../db/categories";
import type { Category, CategoryInput, CategoryUpdate } from "../db/types";
import { useProfileSettingsStore } from "../store/useProfileSettingsStore";

export function useCategories() {
    const { isCategoryAlphabetical } = useProfileSettingsStore();

    return useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: getAllCategories,
        select: (data) => {
            if (isCategoryAlphabetical) {
                return [...data].sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: "base",
                    }),
                );
            }
            return [...data].sort((a, b) => a.priority - b.priority);
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CategoryInput) => createCategory(input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () => toast.danger("Failed to save category", { timeout: 0 }),
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: CategoryUpdate }) =>
            updateCategory(id, input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () =>
            toast.danger("Failed to update category", { timeout: 0 }),
    });
}

export function useReorderCategories() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: { id: string; priority: number }[]) =>
            reorderCategories(updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
            const previousCategories =
                queryClient.getQueryData<Category[]>(CATEGORIES_KEY);

            if (previousCategories) {
                const priorityMap = new Map(
                    updates.map((u) => [u.id, u.priority]),
                );
                const reordered = [...previousCategories]
                    .map((cat) => ({
                        ...cat,
                        priority: priorityMap.get(cat.id) ?? cat.priority,
                    }))
                    .sort((a, b) => a.priority - b.priority);
                queryClient.setQueryData(CATEGORIES_KEY, reordered);
            }

            return { previousCategories };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(
                    CATEGORIES_KEY,
                    context.previousCategories,
                );
            }
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () =>
            toast.danger("Failed to delete category", { timeout: 0 }),
    });
}

export function useRestoreCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreCategory(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () => toast.danger("Failed to undo deletion", { timeout: 0 }),
    });
}
