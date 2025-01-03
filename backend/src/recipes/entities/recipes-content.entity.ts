import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('recipe_content')
export class RecipeContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  recipe_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column()
  author: string;

  @Column()
  cookTime: string;

  @Column()
  prepTime: string;

  @Column()
  totalTime: string;

  @Column()
  recipeCategory: string;

  @Column()
  keywords: string;

  @Column()
  aggregateRating: string;

  @Column()
  reviewCount: string;

  @Column({ type: 'jsonb' })
  nutrition: Record<string, string>;

  @Column({ type: 'jsonb' })
  ingredients: Array<{ quantity: string; item: string }>;

  @Column({ type: 'jsonb' })
  instructions: Array<{ text: string }>;

  @Column()
  recipeYield: string;
}
