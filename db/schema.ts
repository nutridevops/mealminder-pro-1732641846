import { pgTable, text, integer, timestamp, json, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define Zod schemas for complex types
const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string()
});

const instructionSchema = z.object({
  stepNumber: z.number(),
  content: z.string(),
  richText: z.string().optional()
});

const nutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  vitamins: z.record(z.number()).optional().nullable(),
  minerals: z.record(z.number()).optional().nullable()
});

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
  ingredients: json("ingredients").$type<z.infer<typeof ingredientSchema>[]>().notNull(),
  instructions: json("instructions").$type<z.infer<typeof instructionSchema>[]>().notNull(),
  nutritionInfo: json("nutrition_info").$type<z.infer<typeof nutritionSchema>>().notNull(),
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
  date: date("date").notNull(),
  recipes: json("recipes").$type<{
    breakfast?: number;
    lunch?: number;
    dinner?: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define OAuth token type
const oauthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  scope: z.string().optional(),
  tokenType: z.string().optional()
}).nullable();

export const suppliers = pgTable("suppliers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  active: boolean("active").default(true),
  affiliateCode: text("affiliate_code").unique(),
  commissionRate: integer("commission_rate").default(10), // percentage
  totalOrders: integer("total_orders").default(0),
  totalRevenue: integer("total_revenue").default(0), // in cents
  totalCommission: integer("total_commission").default(0), // in cents
  lastOrderAt: timestamp("last_order_at"),
  oauthProvider: text("oauth_provider"), // 'google', 'microsoft', etc.
  oauthId: text("oauth_id"), // unique ID from the OAuth provider
  oauthTokens: json("oauth_tokens").$type<z.infer<typeof oauthTokenSchema>>().default(null),
  isAuthenticated: boolean("is_authenticated").default(false),
  searchTags: json("search_tags").$type<string[]>().default([]),
  specialties: json("specialties").$type<string[]>().default([]),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  unit: text("unit").notNull(),
  inStock: boolean("in_stock").default(true),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  items: json("items").$type<{
    productId: number;
    quantity: number;
    supplierId: number;
  }[]>().notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow()
});

export const transactions = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  userId: integer("user_id").references(() => users.id),
  orderAmount: integer("order_amount").notNull(), // in cents
  commissionAmount: integer("commission_amount").notNull(), // in cents
  status: text("status").notNull().default('pending'),
  affiliateCode: text("affiliate_code").notNull(),
  orderReference: text("order_reference").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Add Zod schemas for transactions
export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = z.infer<typeof selectTransactionSchema>;
  // Supplier table remains the same but moved to products section

// Add Zod schemas for new tables
export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = z.infer<typeof selectSupplierSchema>;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;

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
