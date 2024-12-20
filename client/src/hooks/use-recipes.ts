import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InsertRecipe, Recipe } from '@db/schema';

async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/recipes');
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }
  return response.json();
}

async function createRecipe(recipe: InsertRecipe): Promise<Recipe> {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error('Failed to create recipe');
  }

  return response.json();
}

async function deleteRecipe(id: number): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete recipe');
  }
}

export function useRecipes() {
  const queryClient = useQueryClient();

  const recipesQuery = useQuery<Recipe[], Error>({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch recipes:', error);
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error) => {
      console.error('Failed to create recipe:', error);
      throw error;
    },
    retry: 2,
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  return {
    recipes: recipesQuery.data ?? [],
    isLoading: recipesQuery.isLoading,
    error: recipesQuery.error,
    createRecipe: createRecipeMutation.mutateAsync,
    deleteRecipe: deleteRecipeMutation.mutateAsync,
  };
}
