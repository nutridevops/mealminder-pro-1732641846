import { pgTable, text, integer, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  dietaryPreferences: json("dietary_preferences").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: json("instructions").$type<string[]>().notNull(),
  nutritionInfo: json("nutrition_info").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>().notNull(),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  date: date("date").notNull(),
  recipes: json("recipes").$type<{
    breakfast?: number;
    lunch?: number;
    dinner?: number;
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

export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const selectMealPlanSchema = createSelectSchema(mealPlans);
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = z.infer<typeof selectMealPlanSchema>;

export const insertShoppingListSchema = createInsertSchema(shoppingLists);
export const selectShoppingListSchema = createSelectSchema(shoppingLists);
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = z.infer<typeof selectShoppingListSchema>;
