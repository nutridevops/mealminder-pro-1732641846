import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InsertMealPlan, MealPlan } from '@db/schema';

async function fetchMealPlans(): Promise<MealPlan[]> {
  const response = await fetch('/api/meal-plans');
  if (!response.ok) {
    throw new Error('Failed to fetch meal plans');
  }
  return response.json();
}

async function createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
  const response = await fetch('/api/meal-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mealPlan),
  });

  if (!response.ok) {
    throw new Error('Failed to create meal plan');
  }

  return response.json();
}

async function updateMealPlan(id: number, mealPlan: Partial<MealPlan>): Promise<MealPlan> {
  const response = await fetch(`/api/meal-plans/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mealPlan),
  });

  if (!response.ok) {
    throw new Error('Failed to update meal plan');
  }

  return response.json();
}

export function useMealPlan() {
  const queryClient = useQueryClient();

  const mealPlansQuery = useQuery<MealPlan[], Error>({
    queryKey: ['meal-plans'],
    queryFn: fetchMealPlans,
  });

  const createMealPlanMutation = useMutation({
    mutationFn: createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });

  const updateMealPlanMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<MealPlan>) =>
      updateMealPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });

  return {
    mealPlans: mealPlansQuery.data ?? [],
    isLoading: mealPlansQuery.isLoading,
    error: mealPlansQuery.error,
    createMealPlan: createMealPlanMutation.mutateAsync,
    updateMealPlan: updateMealPlanMutation.mutateAsync,
  };
}
