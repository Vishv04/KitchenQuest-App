import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScraperService } from './scraper/scraper.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optionally, you can directly run the scraper when the server starts.
  const scraperService = app.get(ScraperService);
  await scraperService.scrapeRecipes(); // Uncomment if you want to run the scraper immediately

  await app.listen(3000);
}
bootstrap();
