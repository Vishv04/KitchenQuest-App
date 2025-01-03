import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'vishv',
  database: process.env.DATABASE_NAME || 'recipe_explorer',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};
