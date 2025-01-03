import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScraperService } from './scraper/scraper.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with more permissive settings for development
  app.enableCors({
    origin: '*',  // More permissive for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // Optionally, you can directly run the scraper when the server starts.
  const scraperService = app.get(ScraperService);
  await scraperService.scrapeRecipes();

  await app.listen(3000, '0.0.0.0');  // Listen on all network interfaces
}
bootstrap();
