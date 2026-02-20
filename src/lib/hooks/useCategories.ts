import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    reorderCategories,
    restoreCategory,
    updateCategory,
} from "../db/categories";
import type { Category, CategoryInput, CategoryUpdate } from "../db/types";

const CATEGORIES_KEY = ["categories"];

export function useCategories() {
    return useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: getAllCategories,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CategoryInput) => createCategory(input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () => toast.error("Failed to save category", { duration: Infinity }),
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: CategoryUpdate }) =>
            updateCategory(id, input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () => toast.error("Failed to update category", { duration: Infinity }),
    });
}

export function useReorderCategories() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: { id: string; priority: number }[]) =>
            reorderCategories(updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
            const previous =
                queryClient.getQueryData<Category[]>(CATEGORIES_KEY);

            if (previous) {
                const priorityMap = new Map(
                    updates.map((u) => [u.id, u.priority]),
                );
                const reordered = [...previous]
                    .map((cat) => ({
                        ...cat,
                        priority: priorityMap.get(cat.id) ?? cat.priority,
                    }))
                    .sort((a, b) => a.priority - b.priority);
                queryClient.setQueryData(CATEGORIES_KEY, reordered);
            }

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(CATEGORIES_KEY, context.previous);
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
        onError: () => toast.error("Failed to delete category", { duration: Infinity }),
    });
}

export function useRestoreCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreCategory(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
        onError: () => toast.error("Failed to undo deletion", { duration: Infinity }),
    });
}
