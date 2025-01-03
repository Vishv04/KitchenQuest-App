import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Recipe } from './entities/recipes.entity';
import { RecipeContent } from './entities/recipes-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeContent])],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
