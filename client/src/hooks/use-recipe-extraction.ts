import { useState } from "react";
import type { InsertRecipe } from "@db/schema";

// Mock recipe extraction function
async function extractRecipeFromUrl(url: string): Promise<InsertRecipe> {
  if (!url.startsWith('http')) {
    throw new Error('Invalid URL format. Please provide a valid URL starting with http:// or https://');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return realistic mock data
  return {
    name: "Mediterranean Quinoa Bowl",
    description: "A nutritious and protein-rich Mediterranean-style quinoa bowl with roasted vegetables, chickpeas, and a lemon tahini dressing.",
    ingredients: [
      { name: "Quinoa", amount: 200, unit: "g" },
      { name: "Chickpeas", amount: 400, unit: "g" },
      { name: "Cherry Tomatoes", amount: 200, unit: "g" },
      { name: "Cucumber", amount: 1, unit: "piece" },
      { name: "Red Onion", amount: 1, unit: "piece" },
      { name: "Feta Cheese", amount: 100, unit: "g" },
      { name: "Olive Oil", amount: 30, unit: "ml" },
      { name: "Lemon Juice", amount: 45, unit: "ml" },
      { name: "Tahini", amount: 30, unit: "g" }
    ],
    instructions: [
      { stepNumber: 1, content: "Rinse quinoa thoroughly and cook according to package instructions.", richText: "" },
      { stepNumber: 2, content: "Drain and rinse chickpeas, then roast with olive oil and seasonings at 200°C for 20-25 minutes.", richText: "" },
      { stepNumber: 3, content: "Chop vegetables: halve cherry tomatoes, dice cucumber, and thinly slice red onion.", richText: "" },
      { stepNumber: 4, content: "Make dressing by whisking together tahini, lemon juice, olive oil, and seasoning.", richText: "" },
      { stepNumber: 5, content: "Assemble bowls by layering quinoa, roasted chickpeas, fresh vegetables, and crumbled feta.", richText: "" },
      { stepNumber: 6, content: "Drizzle with tahini dressing and serve immediately.", richText: "" }
    ],
    nutritionInfo: {
      calories: 450,
      protein: 20,
      carbs: 45,
      fat: 15,
      vitamins: {
        vitaminA: 800,
        vitaminC: 60,
        vitaminD: 20,
        vitaminE: 15,
        vitaminK: 80,
        thiamin: 1.2,
        riboflavin: 1.3,
        niacin: 16,
        b6: 1.7,
        b12: 2.4,
        folate: 400
      },
      minerals: {
        calcium: 1000,
        iron: 18,
        magnesium: 400,
        phosphorus: 1000,
        potassium: 3500,
        sodium: 2300,
        zinc: 11,
        copper: 0.9,
        manganese: 2.3,
        selenium: 55
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
