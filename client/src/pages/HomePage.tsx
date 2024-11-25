import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChefHat } from "lucide-react";
import { Link } from "wouter";

import { useState } from "react";
import { useRecipeExtraction } from "@/hooks/use-recipe-extraction";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [recipeUrl, setRecipeUrl] = useState("");
  const { toast } = useToast();
  const {
    extractRecipe,
    isExtracting,
    isAdapting,
    healthWarnings,
    adaptedRecipe
  } = useRecipeExtraction();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-lg">
        <AspectRatio ratio={21/9}>
          <img
            src="https://images.unsplash.com/photo-1487376318617-f43c7b41e2e2"
            alt="Fresh healthy ingredients"
            className="object-cover w-full h-full brightness-50"
          />
        </AspectRatio>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Plan Your Healthy Meals
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Create nutritious meal plans, discover healthy recipes, and generate smart shopping lists
            </p>
          </div>
        </div>
      </section>

      {/* Recipe URL Extraction Section */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Quick Recipe Import</h2>
            <p className="text-muted-foreground">
              Paste a URL from any recipe website to automatically extract ingredients, instructions, and nutritional information
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="Paste a recipe URL here..."
              className="flex-1 h-12 text-base"
            />
            <Button
              size="lg"
              variant="default"
              className="h-12 sm:w-auto"
              onClick={async () => {
                if (!recipeUrl.trim()) {
                  toast({
                    title: "Invalid URL",
                    description: "Please enter a valid recipe URL",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  await extractRecipe(recipeUrl);
                  setRecipeUrl("");
                } catch (error) {
                  console.error('Recipe extraction failed:', error);
                  // Error toast is now handled in useRecipeExtraction
                }
              }}
              disabled={isExtracting || !recipeUrl}
            >
              {isExtracting ? (
                <>
                  <Timer className="h-5 w-5 animate-spin mr-2" />
                  Extracting...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Extract Recipe
                </>
              )}
            </Button>
          </div>

          {isAdapting && (
            <div className="flex items-center justify-center p-4 bg-muted rounded-md">
              <Timer className="h-4 w-4 animate-spin mr-2" />
              <span>Adapting recipe to your health profile...</span>
            </div>
          )}

          {healthWarnings.length > 0 && (
            <div className="space-y-2">
              {healthWarnings.map((warning, index) => (
                <Alert key={index} variant={warning.type === 'high' ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Health Adaptation Warning</AlertTitle>
                  <AlertDescription>{warning.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img
            src="https://images.unsplash.com/photo-1556911073-52527ac43761"
            alt="Recipe collection"
            className="rounded-lg aspect-video object-cover"
          />
          <h2 className="text-2xl font-semibold">Discover Recipes</h2>
          <p className="text-muted-foreground">
            Browse our collection of healthy recipes with detailed nutritional information
          </p>
          <Button asChild>
            <Link href="/recipes" className="inline-flex items-center">
              <ChefHat className="mr-2 h-4 w-4" />
              View Recipes
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <img
            src="https://images.unsplash.com/photo-1533115149875-0a1c8612f726"
            alt="Meal planning"
            className="rounded-lg aspect-video object-cover"
          />
          <h2 className="text-2xl font-semibold">Plan Your Week</h2>
          <p className="text-muted-foreground">
            Create balanced meal plans and automatically generate shopping lists
          </p>
          <Button asChild>
            <Link href="/planner" className="inline-flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Start Planning
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
