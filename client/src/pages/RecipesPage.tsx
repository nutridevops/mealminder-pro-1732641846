import { RecipeCard } from "@/components/RecipeCard";
import { AddRecipeDialog } from "@/components/AddRecipeDialog";
import { useRecipes } from "@/hooks/use-recipes";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipesPage() {
  const { recipes, isLoading, createRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <AddRecipeDialog onAdd={createRecipe} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search recipes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">
              No recipes found. Add your first recipe to get started!
            </p>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onAddToPlan={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
