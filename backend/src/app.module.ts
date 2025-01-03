import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module'; // Import ScraperModule

@Module({
  imports: [
    ScraperModule, // Register ScraperModule here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
