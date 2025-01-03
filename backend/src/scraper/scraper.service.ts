import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Define types for better type safety
interface Recipe {
  id: string,
  title: string;
  thumbnail: string;
  section: string;
  steps: string;
  submittedBy: string;
  record_url: string;
}

@Injectable()
export class ScraperService {
  private readonly dataFilePath = path.join(__dirname, '..', '..', 'data', 'data.json');
  private readonly recipesFilePath = path.join(__dirname, '..', '..', 'data', 'recipes.json');
  private readonly detailedRecipesFilePath = path.join(__dirname, '..', '..', 'data', 'detailedRecipes.json');

  constructor() {
    // Ensure the data directory exists
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
      let allRecipes: Recipe[] = [];
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
          id: item.recipe_id || "",
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

      // Save all recipes to a file
      await this.saveToFile(this.recipesFilePath, allRecipes, false);

      // Scrape detailed data from each record URL
      for (const recordUrl of recordUrls) {
        const recipeId = recordUrl.split('-').pop(); // Extract the recipe ID from the URL
        await this.scrapeDetailedRecipe(recordUrl, recipeId, allDetailedRecipes);
      }

      // Save detailed recipes
      await this.saveToFile(this.detailedRecipesFilePath, allDetailedRecipes, false);

      console.log(`[${new Date().toISOString()}] Scraping complete. Total recipes: ${allRecipes.length}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error:`, error);
    }
  }

  private async scrapeDetailedRecipe(recordUrl: string, recipeId: string, allDetailedRecipes: any[]) {
    try {
      console.log(`Scraping detailed recipe data from ${recordUrl}...`);
      const { data } = await axios.get(recordUrl);
  
      // Load the HTML into cheerio
      const $ = cheerio.load(data);
  
      // Extract JSON-LD data
      const jsonLd = $('script[type="application/ld+json"]').html();
      const recipeData = jsonLd ? JSON.parse(jsonLd) : null;

      const title = recipeData?.name;
  
      // Check if the recipe already exists based on the title
      const existingRecipe = allDetailedRecipes.find(recipe => recipe.title === title);
      if (existingRecipe) {
        console.log(`Recipe with title "${title}" already exists. Skipping...`);
        return; // Skip adding this recipe if a duplicate is found
      }
  
      const detailedRecipe = {
        recipe_id: recipeId,
        title: recipeData?.name,
        description: recipeData?.description || '',
        url: recordUrl,
        author: recipeData?.author || '',
        cookTime: recipeData?.cookTime || '',
        prepTime: recipeData?.prepTime || '',
        totalTime: recipeData?.totalTime || '',
        recipeCategory: recipeData?.recipeCategory || '',
        keywords: recipeData?.keywords || '',
        aggregateRating: recipeData?.aggregateRating?.ratingValue || '',
        reviewCount: recipeData?.aggregateRating?.reviewCount || '',
        nutrition: recipeData?.nutrition || {},
        ingredients: recipeData?.recipeIngredient,
        instructions: recipeData?.recipeInstructions || [],
        recipeYield: recipeData?.recipeYield || '',
      };
  
      // Add the detailed recipe to the list
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
}
