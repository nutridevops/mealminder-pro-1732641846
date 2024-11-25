import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, LineChart } from "lucide-react";
import type { Recipe } from "@db/schema";
import { NutritionDisplay } from "./NutritionDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { NutritionAnalytics } from "./NutritionAnalytics";

type RecipeCardProps = {
  recipe: Recipe;
  onAddToPlan?: () => void;
};

export function RecipeCard({ recipe, onAddToPlan }: RecipeCardProps) {
  const [showNutritionAnalytics, setShowNutritionAnalytics] = useState(false);
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

      <CardFooter className="flex gap-2">
        <Button 
          onClick={() => setShowNutritionAnalytics(true)}
          className="flex-1"
          variant="outline"
        >
          <LineChart className="h-4 w-4 mr-2" />
          Nutrition Analysis
        </Button>
        {onAddToPlan && (
          <Button 
            onClick={onAddToPlan}
            className="flex-1"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Meal Plan
          </Button>
        )}
      </CardFooter>

      <Dialog open={showNutritionAnalytics} onOpenChange={setShowNutritionAnalytics}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nutritional Analysis - {recipe.name}</DialogTitle>
          </DialogHeader>
          <NutritionAnalytics recipe={recipe} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
