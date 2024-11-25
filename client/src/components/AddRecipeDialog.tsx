import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Plus, Minus, Timer, Link, AlertTriangle, Download } from "lucide-react";
import { useRecipeExtraction } from "@/hooks/use-recipe-extraction";
import { useForm, useFieldArray } from "react-hook-form";
import { insertRecipeSchema, type InsertRecipe } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AddRecipeDialogProps = {
  onAdd: (recipe: InsertRecipe) => Promise<void>;
};

export function AddRecipeDialog({ onAdd }: AddRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipeUrl, setRecipeUrl] = useState("");
  const { toast } = useToast();
  const {
    extractRecipe,
    isExtracting,
    isAdapting,
    healthWarnings,
    adaptedRecipe
  } = useRecipeExtraction();
  
  const form = useForm<InsertRecipe>({
    resolver: zodResolver(insertRecipeSchema),
    defaultValues: {
      name: "",
      description: "",
      ingredients: [{ name: "", amount: 0, unit: "g" }],
      instructions: [{ stepNumber: 1, content: "", richText: "" }],
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: {
          vitaminA: 0,
          vitaminC: 0,
          vitaminD: 0,
          vitaminE: 0,
          vitaminK: 0,
          thiamin: 0,
          riboflavin: 0,
          niacin: 0,
          b6: 0,
          b12: 0,
          folate: 0
        },
        minerals: {
          calcium: 0,
          iron: 0,
          magnesium: 0,
          phosphorus: 0,
          potassium: 0,
          sodium: 0,
          zinc: 0,
          copper: 0,
          manganese: 0,
          selenium: 0
        }
      },
      prepTime: 0,
      cookTime: 0,
      totalTime: 0
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({ control: form.control, name: "ingredients" });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = 
    useFieldArray({ control: form.control, name: "instructions" });

  const updateTotalTime = (prepTime: number, cookTime: number) => {
    form.setValue("totalTime", prepTime + cookTime);
  };

  async function onSubmit(data: InsertRecipe) {
    try {
      await onAdd(data);
      setOpen(false);
      form.reset();
      toast({
        title: "Recipe added successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Failed to add recipe",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Quick Recipe Import Section */}
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Quick Recipe Import
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-base">Recipe URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <Input
                            value={recipeUrl}
                            onChange={(e) => setRecipeUrl(e.target.value)}
                            placeholder="Paste a recipe URL to automatically extract details"
                            className="flex-1 h-12 text-base"
                          />
                          <Button
                            type="button"
                            size="lg"
                            variant="default"
                            className="min-w-[140px] h-12"
                            onClick={async () => {
                              try {
                                const recipe = await extractRecipe(recipeUrl);
                                form.reset(recipe);
                                toast({
                                  title: "Recipe extracted successfully",
                                  variant: "default"
                                });
                              } catch (error) {
                                toast({
                                  title: "Failed to extract recipe",
                                  description: "Please try again or enter the recipe manually",
                                  variant: "destructive"
                                });
                              }
                            }}
                            disabled={isExtracting || !recipeUrl}
                          >
                            {isExtracting ? (
                              <Timer className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                              <Download className="h-5 w-5 mr-2" />
                            )}
                            {isExtracting ? "Extracting..." : "Extract Recipe"}
                          </Button>
                        </div>
                      </FormControl>
                      <p className="text-sm text-muted-foreground mt-2">
                        Paste a URL from any recipe website to automatically extract ingredients, instructions, and nutritional information
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Prep Time (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                          updateTotalTime(value, form.getValues("cookTime"));
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Cook Time (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                          updateTotalTime(form.getValues("prepTime"), value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Total Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ingredients</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendIngredient({ name: "", amount: 0, unit: "g" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              {ingredientFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="l">l</SelectItem>
                                <SelectItem value="tsp">tsp</SelectItem>
                                <SelectItem value="tbsp">tbsp</SelectItem>
                                <SelectItem value="cup">cup</SelectItem>
                                <SelectItem value="piece">piece</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-8"
                        onClick={() => removeIngredient(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Instructions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendInstruction({ 
                    stepNumber: instructionFields.length + 1,
                    content: "",
                    richText: ""
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {instructionFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>

                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`instructions.${index}.content`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder="Enter step instructions..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`instructions.${index}.richText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rich Text (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="HTML formatting allowed"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nutrition Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nutritionInfo.calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionInfo.protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionInfo.carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionInfo.fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Add Recipe</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
