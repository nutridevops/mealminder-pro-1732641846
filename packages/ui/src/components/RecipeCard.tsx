import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import type { Recipe } from "@db/schema";
import { NutritionDisplay } from "./NutritionDisplay";

type RecipeCardProps = {
  recipe: Recipe;
  onAddToPlan?: () => void;
};

export function RecipeCard({ recipe, onAddToPlan }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"}
          alt={recipe.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{recipe.name}</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.prepTime} min
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {recipe.description}
        </p>
        <NutritionDisplay nutrition={recipe.nutritionInfo} />
      </CardContent>

      {onAddToPlan && (
        <CardFooter>
          <Button 
            onClick={onAddToPlan}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Meal Plan
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
