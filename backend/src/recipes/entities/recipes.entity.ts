import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  recipe_id: string;

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
