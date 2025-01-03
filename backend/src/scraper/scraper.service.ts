import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../recipes/entities/recipes.entity';
import { RecipeContent } from '../recipes/entities/recipes-content.entity';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Define types for better type safety
interface RecipeData {
  recipe_id: string,
  title: string;
  thumbnail: string;
  section: string;
  steps: string;
  submittedBy: string;
  record_url: string;
}

function parseIngredient(ingredient: string) {
  const match = ingredient.match(/^([\d./\s]+)?(.+)$/);
  return {
    quantity: match?.[1]?.trim() || '',
    item: match?.[2]?.trim() || ingredient
  };
}

@Injectable()
export class ScraperService {
  private readonly dataFilePath = path.join(__dirname, '..', '..', 'data', 'data.json');
  private readonly recipesFilePath = path.join(__dirname, '..', '..', 'data', 'recipes.json');
  private readonly detailedRecipesFilePath = path.join(__dirname, '..', '..', 'data', 'detailedRecipes.json');

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeContent)
    private readonly recipeContentRepository: Repository<RecipeContent>,
  ) {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  @Cron('0 * * * *') // Runs every hour
  async scrapeRecipes() {
    console.log('Starting recipe scraping job...');
    
    // Clear the previous data files
    await this.clearFile(this.recipesFilePath);
    await this.clearFile(this.detailedRecipesFilePath);

    try {
      const sections = ['popular', 'trending', 'recommended'];
      let allRecipes: RecipeData[] = [];
      let allDetailedRecipes: any[] = [];
      const seenRecipes = new Set<string>();
      const UniquerecordUrls = new Set<string>();

      // Scrape each section
      for (const section of sections) {
        console.log(`[${new Date().toISOString()}] Scraping ${section} recipes...`);
        const url = `https://www.food.com/recipe/all/${section}`;
        const { data } = await axios.get(url);

        // Load HTML into cheerio
        const $ = cheerio.load(data);

        // Extract the JSON data from the script
        const scriptContent = $('script')
          .filter((_, el) => $(el).html()?.includes('"response"'))
          .first()
          .html();

        if (!scriptContent) {
          console.warn(`No response data found in HTML for section ${section}`);
          continue;
        }

        const jsonMatch = scriptContent.match(/\{.*"response".*\}/);
        if (!jsonMatch) {
          console.warn(`No valid JSON found in script content for section ${section}`);
          continue;
        }

        const responseJson = JSON.parse(jsonMatch[0]);
        const response = responseJson?.response;

        if (!response) {
          console.warn(`Response field is missing in the JSON for section ${section}`);
          continue;
        }

        // const editorialResults = response.editorialResults || [];
        const results = response.results || [];

        this.saveToFile(this.dataFilePath, { results }, false);

        console.log(`Extracted ${results.length} recipes from response`);

        const recipes = [...results].map((item) => ({
          recipe_id: item.recipe_id || "",
          title: item.main_title || 'No Title',
          thumbnail: item.recipe_photo_url || '',
          section,
          steps: item.num_steps || 'Steps not available',
          submittedBy: item.user_name || 'Food.com',
          record_url: item.record_url,
        }));

        console.log(`Found ${recipes.length} recipes in ${section} section`);

        // Check for duplicates before adding recipes
        for (const recipe of recipes) {
          const recipeKey = `${recipe.section}_${recipe.title}`;
          if (!seenRecipes.has(recipeKey)) {
            seenRecipes.add(recipeKey);
            allRecipes.push(recipe);
            UniquerecordUrls.add(recipe.record_url); // Collect URLs for detailed scraping
          }
        }

      }

      const recordUrls: string[] = Array.from(UniquerecordUrls);

      // Save recipes to both file and database
      await this.saveToFile(this.recipesFilePath, allRecipes, false);
      await this.saveRecipesToDatabase(allRecipes);

      // Scrape detailed data from each record URL
      for (const recordUrl of recordUrls) {
        const recipeId = recordUrl.split('-').pop();
        const recipe = allRecipes.find(r => r.recipe_id === recipeId);
        const thumbnail = recipe ? recipe.thumbnail : '';
        await this.scrapeDetailedRecipe(recordUrl, recipeId, thumbnail, allDetailedRecipes);
      }

      // Save detailed recipes to both file and database
      await this.saveToFile(this.detailedRecipesFilePath, allDetailedRecipes, false);
      await this.saveDetailedRecipesToDatabase(allDetailedRecipes);

      console.log(`[${new Date().toISOString()}] Scraping complete. Total recipes: ${allRecipes.length}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error:`, error);
    }
  }

  private async scrapeDetailedRecipe(
    recordUrl: string, 
    recipeId: string, 
    thumbnail: string,
    allDetailedRecipes: any[]
  ) {
    try {
      console.log(`Scraping detailed recipe data from ${recordUrl}...`);
      const { data } = await axios.get(recordUrl);

      const $ = cheerio.load(data);
      const jsonLd = $('script[type="application/ld+json"]').html();
      const recipeData = jsonLd ? JSON.parse(jsonLd) : null;

      const title = recipeData?.name;

      const existingRecipe = allDetailedRecipes.find(recipe => recipe.title === title);
      if (existingRecipe) {
        console.log(`Recipe with title "${title}" already exists. Skipping...`);
        return;
      }

      const detailedRecipe = {
        recipe_id: recipeId,
        title: recipeData?.name,
        description: recipeData?.description || '',
        url: recordUrl,
        thumbnail: thumbnail,
        author: recipeData?.author || '',
        cookTime: recipeData?.cookTime || '',
        prepTime: recipeData?.prepTime || '',
        totalTime: recipeData?.totalTime || '',
        recipeCategory: recipeData?.recipeCategory || '',
        keywords: recipeData?.keywords || '',
        aggregateRating: recipeData?.aggregateRating?.ratingValue || '',
        reviewCount: recipeData?.aggregateRating?.reviewCount || '',
        nutrition: recipeData?.nutrition || {},
        ingredients: recipeData?.recipeIngredient
          ? recipeData.recipeIngredient.map((ingredient) => parseIngredient(ingredient))
          : [],
        instructions: recipeData?.recipeInstructions || [],
        recipeYield: recipeData?.recipeYield || '',
      };

      allDetailedRecipes.push(detailedRecipe);
      console.log(`Successfully scraped detailed data for recipe: ${title}`);
    } catch (error) {
      console.error(`Error scraping detailed data for ${recordUrl}:`, error);
    }
  }

  private async clearFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, JSON.stringify([])); // Clear the file content by writing an empty array
        console.log(`Cleared file: ${filePath}`);
      } else {
        console.log(`File not found, creating: ${filePath}`);
        await fs.promises.writeFile(filePath, JSON.stringify([])); // Create the file with empty content if it doesn't exist
      }
    } catch (error) {
      console.error(`Error clearing file ${filePath}:`, error);
      throw error;
    }
  }

  private async saveToFile(filePath: string, data: any, append: boolean) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const jsonString = JSON.stringify(data, null, 2);

      if (append) {
        let existingData = [];
        if (fs.existsSync(filePath)) {
          try {
            existingData = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
          } catch (e) {
            console.warn(`Error reading existing file ${filePath}, starting fresh`);
          }
        }
        const updatedData = Array.isArray(data) ? [...existingData, ...data] : [existingData, ...data];
        await fs.promises.writeFile(filePath, JSON.stringify(updatedData, null, 2));
        console.log(`Updated ${filePath} with ${Array.isArray(data) ? data.length : 1} new items`);
      } else {
        await fs.promises.writeFile(filePath, jsonString);
        console.log(`Wrote ${filePath} successfully`);
      }
    } catch (error) {
      console.error(`Error saving to file ${filePath}:`, error);
      throw error;
    }
  }

  private async saveRecipesToDatabase(recipes: any[]) {
    try {
      // Clear existing recipes
      await this.recipeRepository.clear();
      
      // Save new recipes
      const recipeEntities = recipes
        .filter(recipe => recipe.recipe_id) // Filter out recipes with no ID
        .map(recipe => {
          const recipeEntity = new Recipe();
          recipeEntity.recipe_id = recipe.recipe_id || ''; // Provide default empty string
          recipeEntity.title = recipe.title;
          recipeEntity.thumbnail = recipe.thumbnail;
          recipeEntity.section = recipe.section;
          recipeEntity.steps = recipe.steps;
          recipeEntity.submittedBy = recipe.submittedBy;
          recipeEntity.record_url = recipe.record_url;
          return recipeEntity;
        });

      if (recipeEntities.length === 0) {
        console.warn('No valid recipes to save to database');
        return;
      }

      await this.recipeRepository.save(recipeEntities);
      console.log(`Saved ${recipeEntities.length} recipes to database`);
    } catch (error) {
      console.error('Error saving recipes to database:', error);
      throw error;
    }
  }

  private async saveDetailedRecipesToDatabase(detailedRecipes: any[]) {
    try {
      // Clear existing detailed recipes
      await this.recipeContentRepository.clear();
      
      // Save new detailed recipes
      const detailedRecipeEntities = detailedRecipes.map(recipe => {
        const recipeContentEntity = new RecipeContent();
        recipeContentEntity.recipe_id = recipe.recipe_id;
        recipeContentEntity.title = recipe.title;
        recipeContentEntity.description = recipe.description;
        recipeContentEntity.url = recipe.url;
        recipeContentEntity.thumbnail = recipe.thumbnail;
        recipeContentEntity.author = recipe.author;
        recipeContentEntity.cookTime = recipe.cookTime;
        recipeContentEntity.prepTime = recipe.prepTime;
        recipeContentEntity.totalTime = recipe.totalTime;
        recipeContentEntity.recipeCategory = recipe.recipeCategory;
        recipeContentEntity.keywords = recipe.keywords;
        recipeContentEntity.aggregateRating = recipe.aggregateRating;
        recipeContentEntity.reviewCount = recipe.reviewCount;
        recipeContentEntity.nutrition = recipe.nutrition;
        recipeContentEntity.ingredients = recipe.ingredients;
        recipeContentEntity.instructions = recipe.instructions;
        recipeContentEntity.recipeYield = recipe.recipeYield;
        return recipeContentEntity;
      });

      await this.recipeContentRepository.save(detailedRecipeEntities);
      console.log(`Saved ${detailedRecipeEntities.length} detailed recipes to database`);
    } catch (error) {
      console.error('Error saving detailed recipes to database:', error);
      throw error;
    }
  }
}
