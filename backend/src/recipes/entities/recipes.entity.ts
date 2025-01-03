import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipe_id: number;

  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column()
  section: string;

  @Column()
  steps: string;

  @Column()
  submittedBy: string;

  @Column()
  record_url: string;
}
