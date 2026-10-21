import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../products/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'khanhtrinh',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'graphql_demo',
  entities: [Product],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
