import { useState } from "react";
import type { InsertRecipe } from "@db/schema";

// Mock recipe extraction function
async function extractRecipeFromUrl(url: string): Promise<InsertRecipe> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock data
  return {
    name: "Extracted Recipe",
    description: "This is an automatically extracted recipe.",
    ingredients: [
      { name: "Ingredient 1", amount: 100, unit: "g" },
      { name: "Ingredient 2", amount: 200, unit: "ml" }
    ],
    instructions: [
      { stepNumber: 1, content: "Step 1 of the recipe", richText: "" },
      { stepNumber: 2, content: "Step 2 of the recipe", richText: "" }
    ],
    nutritionInfo: {
      calories: 450,
      protein: 20,
      carbs: 45,
      fat: 15,
      vitamins: {
        vitaminA: 800,
        vitaminC: 60,
        vitaminD: 20
      },
      minerals: {
        calcium: 200,
        iron: 4,
        potassium: 400
      }
    },
    prepTime: 15,
    cookTime: 30,
    totalTime: 45
  };
}

// Mock health profile adaptation
interface HealthWarning {
  type: 'high' | 'low' | 'warning';
  nutrient: string;
  message: string;
}

interface AdaptedRecipe {
  original: InsertRecipe;
  adapted: InsertRecipe;
  warnings: HealthWarning[];
}

async function adaptRecipeToHealthProfile(recipe: InsertRecipe): Promise<AdaptedRecipe> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create adapted version with mock modifications
  const adapted: InsertRecipe = {
    ...recipe,
    nutritionInfo: {
      ...recipe.nutritionInfo,
      sodium: Math.floor(recipe.nutritionInfo.calories * 0.8), // Reduce sodium by 20%
      fat: Math.floor(recipe.nutritionInfo.fat * 0.7) // Reduce fat by 30%
    }
  };

  return {
    original: recipe,
    adapted,
    warnings: [
      {
        type: 'high',
        nutrient: 'sodium',
        message: 'Original recipe is high in sodium'
      },
      {
        type: 'warning',
        nutrient: 'allergens',
        message: 'Contains common allergens'
      }
    ]
  };
}

export function useRecipeExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [healthWarnings, setHealthWarnings] = useState<HealthWarning[]>([]);
  const [adaptedRecipe, setAdaptedRecipe] = useState<InsertRecipe | null>(null);

  const extractRecipe = async (url: string) => {
    setIsExtracting(true);
    try {
      const recipe = await extractRecipeFromUrl(url);
      setIsExtracting(false);
      
      // Start health profile adaptation
      setIsAdapting(true);
      const { adapted, warnings } = await adaptRecipeToHealthProfile(recipe);
      setAdaptedRecipe(adapted);
      setHealthWarnings(warnings);
      setIsAdapting(false);
      
      return adapted;
    } catch (error) {
      setIsExtracting(false);
      setIsAdapting(false);
      throw error;
    }
  };

  return {
    extractRecipe,
    isExtracting,
    isAdapting,
    healthWarnings,
    adaptedRecipe
  };
}
