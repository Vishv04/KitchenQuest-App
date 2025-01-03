import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { Recipe } from '../recipes/entities/recipes.entity';
import { RecipeContent } from '../recipes/entities/recipes-content.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Recipe, RecipeContent])
  ],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
