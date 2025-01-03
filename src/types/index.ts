export interface Recipe {
    id: number;
    recipe_id: string;
    title: string;
    thumbnail: string;
    section: string;
    steps: string;
    submittedBy: string;
    record_url: string;
}
  
  export interface Nutrition {
    "@type": string;
    calories: string;
    fatContent: string;
    proteinContent: string;
    carbohydrateContent: string;
    fiberContent: string;
    sugarContent: string;
    sodiumContent: string;
    cholesterolContent: string;
    saturatedFatContent: string;
  }
  
  export interface Ingredient {
    item: string;
    quantity: string;
  }
  
  export interface Instruction {
    text: string;
    "@type": string;
  }
  
  export interface RecipeDetailData {
    title: string;
    description: string;
    cookTime: string;
    prepTime: string;
    totalTime: string;
    recipeCategory: string;
    nutrition: Nutrition;
    ingredients: Ingredient[];
    instructions: Instruction[];
    author: string;
    thumbnail: string;
  }
  
  export type RootStackParamList = {
    Home: undefined;
    RecipeList: { section: string };
    RecipeDetail: { recipeId: string };
  };
  