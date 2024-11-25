import { Progress } from "@/components/ui/progress";

type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type NutritionDisplayProps = {
  nutrition: NutritionInfo;
};

export function NutritionDisplay({ nutrition }: NutritionDisplayProps) {
  const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span>Calories</span>
        <span className="font-medium">{nutrition.calories} kcal</span>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Protein</span>
            <span>{nutrition.protein}g</span>
          </div>
          <Progress value={(nutrition.protein / totalMacros) * 100} className="bg-blue-100" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Carbs</span>
            <span>{nutrition.carbs}g</span>
          </div>
          <Progress value={(nutrition.carbs / totalMacros) * 100} className="bg-green-100" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Fat</span>
            <span>{nutrition.fat}g</span>
          </div>
          <Progress value={(nutrition.fat / totalMacros) * 100} className="bg-yellow-100" />
        </div>
      </div>
    </div>
  );
}
