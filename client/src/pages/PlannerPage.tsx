import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useMealPlan } from "@/hooks/use-meal-plan";
import { useRecipes } from "@/hooks/use-recipes";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { mealPlans, isLoading: isLoadingPlans, createMealPlan } = useMealPlan();
  const { recipes, isLoading: isLoadingRecipes } = useRecipes();

  const currentPlan = mealPlans.find(
    plan => format(new Date(plan.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const getMealRecipe = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const recipeId = currentPlan?.recipes[mealType];
    if (!recipeId) return null;
    return recipes.find(r => r.id === recipeId);
  };

  const handleAddMeal = async (recipeId: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (currentPlan) {
      // Update existing plan
      const updatedRecipes = {
        ...currentPlan.recipes,
        [mealType]: recipeId
      };
      await updateMealPlan({
        id: currentPlan.id,
        recipes: updatedRecipes
      });
    } else {
      await createMealPlan({
        date: dateStr,
        recipes: {
          breakfast: mealType === 'breakfast' ? recipeId : null,
          lunch: mealType === 'lunch' ? recipeId : null,
          dinner: mealType === 'dinner' ? recipeId : null
        }
      });
    }
  };

  const isLoading = isLoadingPlans || isLoadingRecipes;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md"
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <h2 className="text-2xl font-bold">
          Meal Plan for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
              const recipe = getMealRecipe(meal);
              
              return (
                <div key={meal} className="space-y-4">
                  <h3 className="capitalize text-xl font-semibold">{meal}</h3>
                  {recipe ? (
                    <RecipeCard recipe={recipe} />
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="flex items-center justify-center p-8">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2"
                          onClick={() => {}}
                        >
                          <Plus className="h-4 w-4" />
                          Add {meal} recipe
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
