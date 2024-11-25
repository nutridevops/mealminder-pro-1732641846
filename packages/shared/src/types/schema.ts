import { pgTable, text, integer, timestamp, json, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  dietaryPreferences: json("dietary_preferences").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  location: json("location").$type<{
    latitude: number;
    longitude: number;
    address: string;
  }>().notNull(),
  deliveryRadius: integer("delivery_radius").notNull(), // in kilometers
  affiliateCode: text("affiliate_code").unique(),
  commissionRate: integer("commission_rate").default(10), // percentage
  apiConfig: json("api_config").$type<{
    endpoint: string;
    authType: 'bearer' | 'basic' | 'apikey';
    credentials: Record<string, string>;
    webhookUrl?: string;
  } | null>().default(null),
  specialties: json("specialties").$type<string[]>().default([]),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  unit: text("unit").notNull(),
  stockLevel: integer("stock_level").notNull(),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Moved transactions table definition to the correct location

export const recipes = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ingredients: json("ingredients").$type<{
    name: string;
    amount: number;
    unit: string;
  }[]>().notNull(),
  instructions: json("instructions").$type<{
    stepNumber: number;
    content: string;
    richText?: string;
  }[]>().notNull(),
  nutritionInfo: json("nutrition_info").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins: {
      vitaminA?: number;
      vitaminC?: number;
      vitaminD?: number;
      vitaminE?: number;
      vitaminK?: number;
      thiamin?: number;
      riboflavin?: number;
      niacin?: number;
      b6?: number;
      b12?: number;
      folate?: number;
    };
    minerals: {
      calcium?: number;
      iron?: number;
      magnesium?: number;
      phosphorus?: number;
      potassium?: number;
      sodium?: number;
      zinc?: number;
      copper?: number;
      manganese?: number;
      selenium?: number;
    };
  }>().notNull(),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  totalTime: integer("total_time").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  date: text("date").notNull(), // Changed to text to match the ISO date string format
  recipes: json("recipes").$type<{
    breakfast?: number | null;
    lunch?: number | null;
    dinner?: number | null;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  items: json("items").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertRecipeSchema = createInsertSchema(recipes);
export const selectRecipeSchema = createSelectSchema(recipes);
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = z.infer<typeof selectRecipeSchema>;

// Transaction table and schema definitions moved after all referenced tables
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = z.infer<typeof selectMealPlanSchema>;

export const insertShoppingListSchema = createInsertSchema(shoppingLists);
export const selectShoppingListSchema = createSelectSchema(shoppingLists);
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = z.infer<typeof selectShoppingListSchema>;
