import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Recipe } from "@db/schema";

// Daily recommended values (in grams unless specified)
const DRV = {
  calories: 2000, // kcal
  protein: 50,
  carbs: 275,
  fat: 78,
  vitamins: {
    vitaminA: 900, // mcg
    vitaminC: 90, // mg
    vitaminD: 20, // mcg
    vitaminE: 15, // mg
    vitaminK: 120, // mcg
    thiamin: 1.2, // mg
    riboflavin: 1.3, // mg
    niacin: 16, // mg
    b6: 1.7, // mg
    b12: 2.4, // mcg
    folate: 400 // mcg
  },
  minerals: {
    calcium: 1000, // mg
    iron: 18, // mg
    magnesium: 400, // mg
    phosphorus: 1000, // mg
    potassium: 3500, // mg
    sodium: 2300, // mg
    zinc: 11, // mg
    copper: 0.9, // mg
    manganese: 2.3, // mg
    selenium: 55 // mcg
  }
};

function calculatePercentage(value: number, recommended: number): number {
  return Math.round((value / recommended) * 100);
}

type NutrientBarProps = {
  label: string;
  value: number;
  recommended: number;
  unit: string;
};

function NutrientBar({ label, value, recommended, unit }: NutrientBarProps) {
  const percentage = calculatePercentage(value, recommended);
  const isHigh = percentage > 100;
  const isLow = percentage < 25;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {value}{unit} / {recommended}{unit}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={`h-2 ${isHigh ? 'bg-red-100' : isLow ? 'bg-yellow-100' : 'bg-green-100'}`}
      />
      <div className="text-xs text-right text-muted-foreground">
        {percentage}% of daily value
      </div>
    </div>
  );
}

type NutritionAnalyticsProps = {
  recipe: Recipe;
};

export function NutritionAnalytics({ recipe }: NutritionAnalyticsProps) {
  const { nutritionInfo } = recipe;
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NutrientBar
            label="Calories"
            value={nutritionInfo.calories}
            recommended={DRV.calories}
            unit="kcal"
          />
          <NutrientBar
            label="Protein"
            value={nutritionInfo.protein}
            recommended={DRV.protein}
            unit="g"
          />
          <NutrientBar
            label="Carbohydrates"
            value={nutritionInfo.carbs}
            recommended={DRV.carbs}
            unit="g"
          />
          <NutrientBar
            label="Fat"
            value={nutritionInfo.fat}
            recommended={DRV.fat}
            unit="g"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vitamins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(nutritionInfo.vitamins || {}).map(([key, value]) => (
            <NutrientBar
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              recommended={DRV.vitamins[key as keyof typeof DRV.vitamins]}
              unit={key === 'vitaminA' || key === 'vitaminD' || key === 'vitaminK' || key === 'b12' || key === 'folate' ? 'mcg' : 'mg'}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minerals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(nutritionInfo.minerals || {}).map(([key, value]) => (
            <NutrientBar
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              recommended={DRV.minerals[key as keyof typeof DRV.minerals]}
              unit={key === 'selenium' ? 'mcg' : 'mg'}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
