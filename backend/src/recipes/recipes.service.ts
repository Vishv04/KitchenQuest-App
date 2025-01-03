import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipes.entity';
import { RecipeContent } from './entities/recipes-content.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeContent)
    private readonly recipeContentRepository: Repository<RecipeContent>,
  ) {}

  async findBySection(sectionType: string): Promise<Recipe[]> {
    return this.recipeRepository.find({ where: { section: sectionType } });
  }

  async findDetailedRecipe(id: number): Promise<RecipeContent | undefined> {
    return this.recipeContentRepository.findOne({ where: { recipe_id: id } });
  }
}
