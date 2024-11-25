import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: {
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
  minerals?: {
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
};

type NutritionDisplayProps = {
  nutrition: NutritionInfo;
};

function NutrientBar({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span>{label}</span>
      <span className="font-medium">{value} {unit}</span>
    </div>
  );
}

export function NutritionDisplay({ nutrition }: NutritionDisplayProps) {
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
  
  return (
    <div className="space-y-4">
      {/* Calories and Macronutrients */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span>Calories</span>
          <span className="font-medium">{nutrition.calories} kcal</span>
        </div>
        
        <div className="space-y-2 mt-2">
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

      {/* Key Micronutrients */}
      <div className="border-t pt-2">
        <h4 className="text-sm font-medium mb-2">Key Nutrients</h4>
        <div className="space-y-1">
          {nutrition.vitamins?.vitaminC && (
            <NutrientBar label="Vitamin C" value={nutrition.vitamins.vitaminC} unit="mg" />
          )}
          {nutrition.vitamins?.vitaminD && (
            <NutrientBar label="Vitamin D" value={nutrition.vitamins.vitaminD} unit="mcg" />
          )}
          {nutrition.minerals?.iron && (
            <NutrientBar label="Iron" value={nutrition.minerals.iron} unit="mg" />
          )}
          {nutrition.minerals?.calcium && (
            <NutrientBar label="Calcium" value={nutrition.minerals.calcium} unit="mg" />
          )}
        </div>
      </div>

      {/* Expandable Additional Nutrients */}
      {showAllNutrients && (
        <>
          {/* All Vitamins */}
          {nutrition.vitamins && Object.keys(nutrition.vitamins).length > 0 && (
            <div className="border-t pt-2">
              <h4 className="text-sm font-medium mb-2">All Vitamins</h4>
              <div className="space-y-1">
                {nutrition.vitamins.vitaminA && (
                  <NutrientBar label="Vitamin A" value={nutrition.vitamins.vitaminA} unit="mcg" />
                )}
                {nutrition.vitamins.vitaminE && (
                  <NutrientBar label="Vitamin E" value={nutrition.vitamins.vitaminE} unit="mg" />
                )}
                {nutrition.vitamins.vitaminK && (
                  <NutrientBar label="Vitamin K" value={nutrition.vitamins.vitaminK} unit="mcg" />
                )}
                {nutrition.vitamins.thiamin && (
                  <NutrientBar label="Thiamin (B1)" value={nutrition.vitamins.thiamin} unit="mg" />
                )}
                {nutrition.vitamins.riboflavin && (
                  <NutrientBar label="Riboflavin (B2)" value={nutrition.vitamins.riboflavin} unit="mg" />
                )}
                {nutrition.vitamins.niacin && (
                  <NutrientBar label="Niacin (B3)" value={nutrition.vitamins.niacin} unit="mg" />
                )}
                {nutrition.vitamins.b6 && (
                  <NutrientBar label="Vitamin B6" value={nutrition.vitamins.b6} unit="mg" />
                )}
                {nutrition.vitamins.b12 && (
                  <NutrientBar label="Vitamin B12" value={nutrition.vitamins.b12} unit="mcg" />
                )}
                {nutrition.vitamins.folate && (
                  <NutrientBar label="Folate" value={nutrition.vitamins.folate} unit="mcg" />
                )}
              </div>
            </div>
          )}

          {/* All Minerals */}
          {nutrition.minerals && Object.keys(nutrition.minerals).length > 0 && (
            <div className="border-t pt-2">
              <h4 className="text-sm font-medium mb-2">All Minerals</h4>
              <div className="space-y-1">
                {nutrition.minerals.magnesium && (
                  <NutrientBar label="Magnesium" value={nutrition.minerals.magnesium} unit="mg" />
                )}
                {nutrition.minerals.phosphorus && (
                  <NutrientBar label="Phosphorus" value={nutrition.minerals.phosphorus} unit="mg" />
                )}
                {nutrition.minerals.potassium && (
                  <NutrientBar label="Potassium" value={nutrition.minerals.potassium} unit="mg" />
                )}
                {nutrition.minerals.sodium && (
                  <NutrientBar label="Sodium" value={nutrition.minerals.sodium} unit="mg" />
                )}
                {nutrition.minerals.zinc && (
                  <NutrientBar label="Zinc" value={nutrition.minerals.zinc} unit="mg" />
                )}
                {nutrition.minerals.copper && (
                  <NutrientBar label="Copper" value={nutrition.minerals.copper} unit="mg" />
                )}
                {nutrition.minerals.manganese && (
                  <NutrientBar label="Manganese" value={nutrition.minerals.manganese} unit="mg" />
                )}
                {nutrition.minerals.selenium && (
                  <NutrientBar label="Selenium" value={nutrition.minerals.selenium} unit="mcg" />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Show More/Less Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2"
        onClick={() => setShowAllNutrients(!showAllNutrients)}
      >
        {showAllNutrients ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            Show All Nutrients
          </>
        )}
      </Button>
    </div>
  );
}
