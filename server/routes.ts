import type { Express } from "express";
import { db } from "../db";
import { 
  recipes, 
  mealPlans, 
  suppliers,
  products,
  insertRecipeSchema, 
  insertMealPlanSchema,
  insertSupplierSchema,
  insertProductSchema
} from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // OAuth routes
  app.get("/api/auth/:provider", async (req, res) => {
    const { provider } = req.params;
    const { supplierId } = req.query;
    
    if (!supplierId) {
      return res.status(400).json({
        error: "Missing supplier ID",
        message: "Supplier ID is required for authentication"
      });
    }

    try {
      const supplier = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, Number(supplierId)))
        .limit(1);

      if (!supplier.length) {
        return res.status(404).json({
          error: "Supplier not found",
          message: "The specified supplier does not exist"
        });
      }

      // Store supplierId in session for callback
      req.session.supplierId = Number(supplierId);

      // Initialize OAuth flow based on provider
      const providerConfig = {
        google: {
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          scope: 'profile email',
          // Add other provider-specific config
        },
        microsoft: {
          authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          scope: 'profile.read',
          // Add other provider-specific config
        }
      }[provider];

      if (!providerConfig) {
        return res.status(400).json({
          error: "Invalid provider",
          message: "The specified provider is not supported"
        });
      }

      res.json({ 
        status: "success",
        message: `OAuth flow initiated for ${provider}`,
        authUrl: `/api/auth/${provider}/callback`,
        provider: provider
      });
    } catch (error) {
      console.error(`OAuth error with ${provider}:`, error);
      res.status(500).json({ 
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Failed to authenticate"
      });
    }
  });

  app.get("/api/auth/:provider/callback", async (req, res) => {
    const { provider } = req.params;
    const { code } = req.query;
    const supplierId = req.session.supplierId;

    if (!supplierId) {
      return res.status(400).json({
        error: "Missing supplier ID",
        message: "No supplier ID found in session"
      });
    }

    try {
      // Exchange code for tokens
      const tokens = {
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
        expiresAt: Date.now() + 3600000 // 1 hour from now
      };

      // Update supplier with OAuth information
      const [updatedSupplier] = await db
        .update(suppliers)
        .set({
          oauthProvider: provider,
          oauthTokens: tokens
        })
        .where(eq(suppliers.id, supplierId))
        .returning();

      if (!updatedSupplier) {
        throw new Error("Failed to update supplier with OAuth tokens");
      }

      // Clear session
      delete req.session.supplierId;

      res.json({
        status: "success",
        message: `Successfully authenticated with ${provider}`,
        supplier: updatedSupplier
      });
    } catch (error) {
      console.error(`OAuth callback error with ${provider}:`, error);
      res.status(500).json({
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Failed to complete authentication"
      });
    }
  });

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
        ingredients: Array.isArray(result.data.ingredients) 
          ? result.data.ingredients.map(ing => ({
              name: String(ing?.name || ''),
              amount: Number(ing?.amount || 0),
              unit: String(ing?.unit || 'g')
            }))
          : [],
        instructions: Array.isArray(result.data.instructions)
          ? result.data.instructions.map((inst, index) => ({
              stepNumber: Number(inst?.stepNumber || index + 1),
              content: String(inst?.content || ''),
              richText: String(inst?.richText || '')
            }))
          : [],
        nutritionInfo: {
          calories: Number(result.data.nutritionInfo?.calories || 0),
          protein: Number(result.data.nutritionInfo?.protein || 0),
          carbs: Number(result.data.nutritionInfo?.carbs || 0),
          fat: Number(result.data.nutritionInfo?.fat || 0),
          vitamins: result.data.nutritionInfo && typeof result.data.nutritionInfo === 'object' && result.data.nutritionInfo.vitamins
            ? Object.fromEntries(
                Object.entries(result.data.nutritionInfo.vitamins)
                  .map(([k, v]) => [k, Number(v)])
              )
            : {},
          minerals: result.data.nutritionInfo && typeof result.data.nutritionInfo === 'object' && result.data.nutritionInfo.minerals
            ? Object.fromEntries(
                Object.entries(result.data.nutritionInfo.minerals)
                  .map(([k, v]) => [k, Number(v)])
              )
            : {}
        },
        prepTime: Number(result.data.prepTime || 0),
        cookTime: Number(result.data.cookTime || 0),
        totalTime: Number(result.data.totalTime || 0),
        imageUrl: result.data.imageUrl || null,
        userId: result.data.userId || null
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
  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const allSuppliers = await db.select().from(suppliers);
      res.json(allSuppliers);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      res.status(500).send("Failed to fetch suppliers");
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    // Set JSON headers first thing
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request body"
        });
      }

      // Create supplier
      const [newSupplier] = await db
        .insert(suppliers)
        .values({
          name: req.body.name?.trim() || '',
          description: req.body.description?.trim() || '',
          website: req.body.website,
          active: true,
          specialties: [],
          searchTags: [],
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0
        })
        .returning();

      // Return success response
      return res.status(201).json({
        success: true,
        supplier: newSupplier
      });

    } catch (error) {
      console.error('Supplier creation error:', error);
      
      // Return error response
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create supplier"
      });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const allProducts = await db.select().from(products);
      res.json(allProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      res.status(500).send("Failed to fetch products");
    }
  });

  app.get("/api/suppliers/:supplierId/products", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const supplierProducts = await db
        .select()
        .from(products)
        .where(eq(products.supplierId, supplierId));
      res.json(supplierProducts);
    } catch (error) {
      console.error('Failed to fetch supplier products:', error);
      res.status(500).send("Failed to fetch supplier products");
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const [newProduct] = await db.insert(products).values(result.data).returning();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).send("Failed to create product");
    }
  });
        return res.status(404).send("Meal plan not found");
      }

      res.json(updatedMealPlan);
    } catch (error) {
      res.status(500).send("Failed to update meal plan");
    }
  });
}
