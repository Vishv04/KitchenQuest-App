import { Controller, Get, Param } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Get('sections/:sectionType/recipes')
  async getRecipesBySection(@Param('sectionType') sectionType: string) {
    return this.recipesService.findBySection(sectionType);
  }

  @Get('recipes/:id')
  async getRecipeDetails(@Param('id') id: string) {
    return this.recipesService.findDetailedRecipe(id);
  }
}
