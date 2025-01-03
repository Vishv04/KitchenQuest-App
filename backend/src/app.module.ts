import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module'; // Import ScraperModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    RecipesModule,
    ScraperModule, // Register ScraperModule here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}



