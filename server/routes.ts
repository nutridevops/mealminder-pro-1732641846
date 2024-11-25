import type { Express } from "express";
import { db } from "../db";
import { recipes, mealPlans, insertRecipeSchema, insertMealPlanSchema } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const allRecipes = await db.select().from(recipes);
      res.json(allRecipes);
    } catch (error) {
      res.status(500).send("Failed to fetch recipes");
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      console.log('Received recipe data:', JSON.stringify(req.body, null, 2));
      
      const result = insertRecipeSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Recipe validation failed:', result.error.errors);
        return res.status(400).json({ 
          message: 'Invalid recipe data',
          errors: result.error.errors 
        });
      }

      // Transform and validate the data
      const recipeData = {
        name: result.data.name,
        description: result.data.description,
        ingredients: (result.data.ingredients ?? []).map(ing => ({
          name: ing?.name ?? '',
          amount: Number(ing?.amount ?? 0),
          unit: ing?.unit ?? 'g'
        })),
        instructions: (result.data.instructions ?? []).map((inst, index) => ({
          stepNumber: inst?.stepNumber ?? index + 1,
          content: inst?.content ?? '',
          richText: inst?.richText ?? ''
        })),
        nutritionInfo: {
          calories: Number(result.data.nutritionInfo?.calories ?? 0),
          protein: Number(result.data.nutritionInfo?.protein ?? 0),
          carbs: Number(result.data.nutritionInfo?.carbs ?? 0),
          fat: Number(result.data.nutritionInfo?.fat ?? 0),
          vitamins: typeof result.data.nutritionInfo?.vitamins === 'object' ? result.data.nutritionInfo.vitamins : {},
          minerals: typeof result.data.nutritionInfo?.minerals === 'object' ? result.data.nutritionInfo.minerals : {}
        },
        prepTime: Number(result.data.prepTime),
        cookTime: Number(result.data.cookTime),
        totalTime: Number(result.data.totalTime),
        imageUrl: result.data.imageUrl,
        userId: result.data.userId
      };

      console.log('Transformed recipe data:', JSON.stringify(recipeData, null, 2));

      const [newRecipe] = await db.insert(recipes).values(recipeData).returning();
      console.log('Recipe created successfully:', newRecipe.id);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      res.status(500).json({ 
        error: 'Failed to create recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(recipes).where(eq(recipes.id, id));
      res.status(204).send();
    } catch (error) {
      res.status(500).send("Failed to delete recipe");
    }
  });

  // Meal Plan routes
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const allMealPlans = await db.select().from(mealPlans);
      res.json(allMealPlans);
    } catch (error) {
      res.status(500).send("Failed to fetch meal plans");
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const result = insertMealPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      // Ensure recipes object has the correct structure with proper typing
      const inputRecipes = result.data.recipes as {
        breakfast?: number | undefined;
        lunch?: number | undefined;
        dinner?: number | undefined;
      };

      // Build recipes object matching the schema type
      const recipes = {
        breakfast: inputRecipes.breakfast || undefined,
        lunch: inputRecipes.lunch || undefined,
        dinner: inputRecipes.dinner || undefined
      };

      const [newMealPlan] = await db.insert(mealPlans).values({
        ...result.data,
        recipes
      }).returning();

      res.status(201).json(newMealPlan);
    } catch (error) {
      console.error('Error creating meal plan:', error);
      res.status(500).send("Failed to create meal plan");
    }
  });

  app.patch("/api/meal-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [updatedMealPlan] = await db
        .update(mealPlans)
        .set(req.body)
        .where(eq(mealPlans.id, id))
        .returning();
      
      if (!updatedMealPlan) {
        return res.status(404).send("Meal plan not found");
      }

      res.json(updatedMealPlan);
    } catch (error) {
      res.status(500).send("Failed to update meal plan");
    }
  });
}
