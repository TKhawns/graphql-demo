import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Product } from '../products/product.entity';

const seedProducts: Partial<Product>[] = [
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with USB receiver',
    price: 29.99,
    stock: 120,
    category: 'Electronics',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.5,
    stock: 45,
    category: 'Electronics',
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and SD card reader',
    price: 39.0,
    stock: 60,
    category: 'Accessories',
  },
  {
    name: 'Notebook Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 24.99,
    stock: 80,
    category: 'Accessories',
  },
  {
    name: 'Webcam 1080p',
    description: 'Full HD webcam with built-in microphone',
    price: 49.99,
    stock: 30,
    category: 'Electronics',
  },
];

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Product);

  const count = await repo.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} products already exist.`);
    await AppDataSource.destroy();
    return;
  }

  await repo.save(repo.create(seedProducts));
  console.log(`Seeded ${seedProducts.length} products.`);
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
