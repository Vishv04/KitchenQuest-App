import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScraperService {
  private readonly dataFilePath = path.join(__dirname, '..', '..', 'data', 'data.json');
  private readonly recipesFilePath = path.join(__dirname, '..', '..', 'data', 'recipes.json');
  private readonly allRecipesFilePath = path.join(__dirname, '..', '..', 'data', 'allrecipes.json');
  private readonly statusFilePath = path.join(__dirname, '..', '..', 'data', 'status.json');

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  @Cron('0 * * * *') // Runs every hour
async scrapeRecipes() {
  console.log('Starting recipe scraping job...');
  const status: {
    startTime: string;
    sections: { section: string; status: string; recipesScraped: number }[];
    totalRecipes: number;
    endTime?: string;
  } = {
    startTime: new Date().toISOString(),
    sections: [],
    totalRecipes: 0,
  };

  // Clear the recipes.json file before starting the scraping process
  this.clearFile(this.recipesFilePath);

  try {
    const sections = ['popular', 'trending', 'recommended'];
    let allRecipes = [];
    const seenRecipes = new Set(); // To track already added recipes

    for (const section of sections) {
      console.log(`[${new Date().toISOString()}] Scraping ${section} recipes...`);
      const url = `https://www.food.com/recipe/all/${section}`;
      const { data } = await axios.get(url);

      // Load the HTML into cheerio
      const $ = cheerio.load(data);

      // Find the <script> tag or other location containing the response JSON
      const scriptContent = $('script')
        .filter((_, el) => $(el).html()?.includes('"response"'))
        .first()
        .html();

      if (!scriptContent) {
        console.warn(`No response data found in HTML for section ${section}`);
        continue;
      }

      // Extract the JSON from the script content
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

      // console.log(`Extracted response for ${section}:`, response);

      // Extract recipes
      const editorialResults = response.editorialResults || [];
      const results = response.results || [];

      this.saveToFile(this.dataFilePath, { editorialResults, results }, false);

      console.log(`Extracted ${editorialResults.length + results.length} recipes from response`);

      const recipes = [...editorialResults, ...results].map((item) => ({
        title: item.main_title || 'No Title',
        thumbnail: item.main_image || '',
        section,
        ingredients: 'Ingredients not available',
        steps: 'Steps not available',
        submittedBy: item.author || 'Food.com',
      }));

      console.log(`Found ${recipes.length} recipes in ${section} section`);

      status.sections.push({
        section,
        status: recipes.length > 0 ? 'Success' : 'No Data Found',
        recipesScraped: recipes.length,
      });

      // Check for duplicates before pushing to allRecipes
      for (const recipe of recipes) {
        const recipeKey = `${recipe.section}_${recipe.title}`;
        if (!seenRecipes.has(recipeKey)) {
          seenRecipes.add(recipeKey);
          allRecipes.push(recipe);
        }
      }

      // Save section-specific recipes
      this.saveToFile(this.recipesFilePath, recipes, true);
    }

    // Save all recipes in one file
    this.saveToFile(this.allRecipesFilePath, allRecipes, false);

    // Update status
    status.totalRecipes = allRecipes.length;
    status.endTime = new Date().toISOString();

    // Save the status to a file
    this.saveToFile(this.statusFilePath, status, false);

    console.log(`[${new Date().toISOString()}] Scraping complete. Total recipes: ${allRecipes.length}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    // Update status in case of failure
    status.sections.push({
      section: 'General Error',
      status: error.message,
      recipesScraped: 0,
    });
    status.endTime = new Date().toISOString();
    this.saveToFile(this.statusFilePath, status, false);
  }
}

private clearFile(filePath: string) {
  try {
    // Check if file exists and clear it
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([])); // Clear the file content by writing an empty array
      console.log(`Cleared file: ${filePath}`);
    } else {
      console.log(`File not found, creating: ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify([])); // Create the file with empty content if it doesn't exist
    }
  } catch (error) {
    console.error(`Error clearing file ${filePath}:`, error);
    throw error; // Rethrow to handle in calling function
  }
}


  private saveToFile(filePath: string, data: any, append: boolean) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Convert data to string with proper formatting
      const jsonString = JSON.stringify(data, null, 2);

      if (append) {
        let existingData = [];
        if (fs.existsSync(filePath)) {
          try {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          } catch (e) {
            console.warn(`Error reading existing file ${filePath}, starting fresh`);
          }
        }
        const updatedData = Array.isArray(data) ? [...existingData, ...data] : [existingData, ...data];
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        console.log(`Updated ${filePath} with ${Array.isArray(data) ? data.length : 1} new items`);
      } else {
        fs.writeFileSync(filePath, jsonString);
        console.log(`Wrote ${filePath} successfully`);
      }
    } catch (error) {
      console.error(`Error saving to file ${filePath}:`, error);
      throw error; // Rethrow to handle in calling function
    }
  }
}

// interface Recipe {
//   title: string;
//   thumbnail: string;
//   section: string;
//   ingredients: string;
//   steps: string;
//   submittedBy: string;
// }
