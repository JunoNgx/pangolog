import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    updateCategory,
} from "../db/categories";
import type { CategoryInput, CategoryUpdate } from "../db/types";

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
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: CategoryUpdate }) =>
            updateCategory(id, input),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    });
}
