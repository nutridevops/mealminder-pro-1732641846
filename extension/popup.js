document.getElementById('captureRecipe').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  
  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute content script
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractRecipeData,
    });
    
    const recipeData = result[0].result;
    
    // Send recipe data to MealMinder API
    const response = await fetch('http://localhost:5000/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save recipe');
    }
    
    statusEl.textContent = 'Recipe captured successfully!';
    statusEl.className = 'status success';
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      window.close();
    }, 2000);
  } catch (error) {
    statusEl.textContent = 'Failed to capture recipe. Please try again.';
    statusEl.className = 'status error';
    statusEl.style.display = 'block';
  }
});

function extractRecipeData() {
  // This function will be injected into the page
  const recipe = {
    name: '',
    description: '',
    ingredients: [],
    instructions: [],
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      vitamins: {},
      minerals: {}
    },
    prepTime: 0,
    cookTime: 0,
    totalTime: 0
  };
  
  // Try to find recipe schema.org markup
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data['@type'] === 'Recipe') {
        recipe.name = data.name || '';
        recipe.description = data.description || '';
        recipe.prepTime = parseInt(data.prepTime) || 0;
        recipe.cookTime = parseInt(data.cookTime) || 0;
        recipe.totalTime = parseInt(data.totalTime) || 0;
        
        if (Array.isArray(data.recipeIngredient)) {
          recipe.ingredients = data.recipeIngredient.map(ingredient => ({
            name: ingredient,
            amount: 0,
            unit: 'piece'
          }));
        }
        
        if (Array.isArray(data.recipeInstructions)) {
          recipe.instructions = data.recipeInstructions.map((instruction, index) => ({
            stepNumber: index + 1,
            content: typeof instruction === 'string' ? instruction : instruction.text,
            richText: ''
          }));
        }
        
        if (data.nutrition) {
          recipe.nutritionInfo = {
            calories: parseInt(data.nutrition.calories) || 0,
            protein: parseInt(data.nutrition.proteinContent) || 0,
            carbs: parseInt(data.nutrition.carbohydrateContent) || 0,
            fat: parseInt(data.nutrition.fatContent) || 0,
            vitamins: {},
            minerals: {}
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse recipe schema:', e);
    }
  }
  
  // Fallback to basic page scraping if schema.org data is incomplete
  if (!recipe.name) {
    recipe.name = document.querySelector('h1')?.textContent?.trim() || '';
  }
  
  if (!recipe.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    recipe.description = metaDescription?.content || '';
  }
  
  return recipe;
}
