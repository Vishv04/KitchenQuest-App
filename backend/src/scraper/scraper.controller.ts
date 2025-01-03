import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('scrape')
  async scrapeRecipes() {
    try {
      // Manually trigger the scraping process
      await this.scraperService.scrapeRecipes();
      return { message: 'Scraping started successfully' };
    } catch (error) {
      return { message: 'Error starting scraper', error: error.message };
    }
  }

  @Get('status')
  async getScrapingStatus() {
    try {
      // Fetch status from the status file (status.json)
      const status = await this.getStatus();
      return status;
    } catch (error) {
      return { message: 'Error fetching status', error: error.message };
    }
  }

  private async getStatus() {
    const fs = require('fs');
    const path = require('path');
    const statusFilePath = path.join(__dirname, '..', '..', 'data', 'status.json');
    
    // Read the status from file
    try {
      const statusData = fs.readFileSync(statusFilePath, 'utf-8');
      return JSON.parse(statusData);
    } catch (e) {
      return { message: 'Status file not found or invalid' };
    }
  }
}
